import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseCSV } from "./parsers/csv.ts";
import { calculateCarbon } from "./calculators/carbon.ts";
import { generateAIInsights } from "./services/ai.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error("documentId is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );


    // Fetch uploaded document

    const { data: document, error: fetchError } =
      await supabase
        .from("uploaded_data")
        .select("*")
        .eq("id", documentId)
        .single();


    if (fetchError || !document) {
      throw new Error("Document not found");
    }


    await supabase
      .from("uploaded_data")
      .update({
        processing_status: "processing",
      })
      .eq("id", documentId);



    // Download file

    const { data: file, error: downloadError } =
      await supabase.storage
        .from("documents")
        .download(document.storage_path);


    if (downloadError || !file) {
      throw new Error("File download failed");
    }



    // CSV validation

    if (document.mime_type !== "text/csv") {
      throw new Error("Only CSV supported currently");
    }



    // Parse CSV

    const parsedData = await parseCSV(file);

    console.log(
      "Parsed Data:",
      parsedData
    );


    const carbonResults = parsedData.rows
      .map((row: any) => {

        const results:any[] = [];


        if (row.electricityUsage) {
          results.push(
            calculateCarbon(
              "electricity",
              Number(row.electricityUsage),
              "kWh"
            )
          );
        }


        if (row.fuelConsumption) {
          results.push(
            calculateCarbon(
              "fuel",
              Number(row.fuelConsumption),
              "liters"
            )
          );
        }


        if (row.waterUsage) {
          results.push(
            calculateCarbon(
              "water",
              Number(row.waterUsage),
              "liters"
            )
          );
        }


        if (row.wasteGenerated) {
          results.push(
            calculateCarbon(
              "waste",
              Number(row.wasteGenerated),
              "kg"
            )
          );
        }


        return results;

      })
      .flat();



    if (carbonResults.length === 0) {
      throw new Error("No carbon data found");
    }



    console.log(
      "Carbon Results:",
      carbonResults
    );



    // Save carbon results

    await supabase
      .from("carbon_results")
      .delete()
      .eq(
        "document_id",
        documentId
      );



    const carbonRows = carbonResults.map(
      (item:any)=>({

        document_id: documentId,

        category:item.category,

        value:item.value,

        unit:item.unit,

        emission_factor:item.emissionFactor,

        carbon_kg:item.carbonKg,

      })
    );


    const {error:carbonError} =
      await supabase
      .from("carbon_results")
      .insert(carbonRows);



    if(carbonError){
      throw carbonError;
    }




    // Generate AI Insights

    const totalCarbon =
      carbonResults.reduce(
        (
          sum:number,
          item:any
        ) =>
          sum + item.carbonKg,
        0
      );


    console.log(
      "Generating AI insights..."
    );


    const aiResult =
      await generateAIInsights({

        totalCarbon,

        carbonResults

      });



    console.log(
      "AI Result:",
      aiResult
    );




    // Save AI Insights

    const {error:aiError} =
      await supabase
      .from("ai_insights")
      .insert({

        company_id:
          document.company_id,

        document_id:
          documentId,

        insight:
          aiResult.insight,

        recommendation:
          aiResult.recommendation,

        category:
          "Carbon Reduction",

        priority:
          aiResult.priority,

        estimated_co2_saving_tonnes:
          aiResult.estimated_co2_saving_tonnes,

        estimated_annual_saving_usd:
          aiResult.estimated_annual_saving_usd

      });



    if(aiError){

      console.error(
        "AI INSERT ERROR:",
        aiError
      );

      throw aiError;

    }




    // Complete processing

    await supabase
      .from("uploaded_data")
      .update({

        processing_status:
          "completed",

        processed_at:
          new Date().toISOString()

      })
      .eq(
        "id",
        documentId
      );




    return new Response(

      JSON.stringify({

        success:true,

        message:
          "Document processed successfully",

        totalCarbon,

        carbonResults,

        aiResult

      }),

      {
        headers:{
          ...corsHeaders,

          "Content-Type":
            "application/json"
        }
      }

    );



  } catch(error:any){


    console.error(
      "PROCESS ERROR:",
      error
    );


    return new Response(

      JSON.stringify({

        success:false,

        message:
          error.message,

        stack:
          error.stack

      }),

      {
        status:500,

        headers:{
          ...corsHeaders,

          "Content-Type":
            "application/json"
        }
      }

    );

  }

});