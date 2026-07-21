import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  Download,
  FileText,
  Bot,
  Leaf,
  DollarSign,
  TrendingDown,
} from "lucide-react";

import { AppLayout } from "@/layouts/AppLayout";
import { PageHeader } from "@/components/common/PageHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ProcessingPipeline } from "@/components/upload/ProcessingPipeline";

import { supabase } from "@/integrations/supabase/client";

import {
  getDocument,
  getDocumentSignedUrl,
} from "@/services/documents";

import { formatBytes } from "@/utils/bytes";
import { formatDate } from "@/utils/format";

import {
  fileTypeIcon,
  statusTone,
} from "@/utils/documents";

import { cn } from "@/lib/utils";


export default function DocumentResultsPage() {


  const { id } = useParams<{ id: string }>();

  const queryClient = useQueryClient();


  const [signedUrl, setSignedUrl] =
    useState<string | null>(null);





  /*
    DOCUMENT QUERY
  */

  const {
    data: doc,
    isLoading,
  } = useQuery({

    queryKey: [
      "document",
      id,
    ],


    enabled: !!id,


    queryFn: () =>
      id
        ? getDocument(id)
        : Promise.resolve(null),

  });






  /*
    CARBON RESULTS QUERY
  */

  const {
    data: carbonResults = [],
    isLoading: carbonLoading,

  } = useQuery({


    queryKey: [
      "carbon-results",
      id,
    ],


    enabled: !!id,


    queryFn: async () => {


      const {
        data,
        error,

      } = await supabase


        .from("carbon_results")


        .select("*")


        .eq(
          "document_id",
          id
        );



      if(error)
        throw error;



      return data ?? [];

    },


  });








  /*
    AI INSIGHTS QUERY
  */

  const {

    data: aiInsight,

    isLoading: aiLoading,


  } = useQuery({


    queryKey: [
      "ai-insight",
      id,
    ],


    enabled: !!id,


    queryFn: async () => {


      const {

        data,

        error,

      } = await supabase


        .from("ai_insights")


        .select("*")


        .eq(
          "document_id",
          id
        )


        .order(

          "created_at",

          {
            ascending:false,
          }

        )


        .limit(1)


        .maybeSingle();




      if(error)
        throw error;



      return data;


    },


  });






  /*
    SIGNED URL
  */

  useEffect(() => {


    if(!doc)
      return;



    getDocumentSignedUrl(doc)

      .then(setSignedUrl)

      .catch(() =>
        setSignedUrl(null)
      );


  },[doc]);






  /*
    REALTIME UPDATE
  */

  useEffect(() => {


    if(!id)
      return;



    const channel = supabase


      .channel(
        `document-${id}`
      )


      .on(

        "postgres_changes",

        {

          event:"UPDATE",

          schema:"public",

          table:"uploaded_data",

          filter:`id=eq.${id}`,

        },


        () => {


          queryClient.invalidateQueries({

            queryKey:[
              "document",
              id,
            ],

          });



          queryClient.invalidateQueries({

            queryKey:[
              "carbon-results",
              id,
            ],

          });



          queryClient.invalidateQueries({

            queryKey:[
              "ai-insight",
              id,
            ],

          });


        }


      )


      .subscribe();




    return () => {

      supabase.removeChannel(channel);

    };


  },[
    id,
    queryClient,
  ]);






  if(isLoading){


    return (

      <AppLayout>

        <LoadingSkeleton rows={6}/>

      </AppLayout>

    );

  }






  if(!doc){


    return (

      <AppLayout>


        <EmptyState

          icon={FileText}

          title="Document not found"

          description="It may have been deleted."

        />


      </AppLayout>

    );


  }






  const Icon =
    fileTypeIcon(
      doc.file_type
    );


  const tone =
    statusTone(
      doc.processing_status
    );


  const canPreview =
    doc.file_type === "pdf" ||
    doc.file_type === "image";




  return (

    <AppLayout>

      <div className="space-y-6">


        <Button

          asChild

          variant="ghost"

          size="sm"

          className="gap-2 -ml-3"

        >

          <Link to="/uploads">

            <ArrowLeft className="h-4 w-4"/>

            Back to documents

          </Link>


        </Button>
        <PageHeader

          title={doc.file_name}

          description="Extraction results and sustainability analysis for this document."

          action={

            signedUrl

              ? {

                  label:"Download",

                  icon:Download,

                  onClick:() =>

                    window.open(

                      signedUrl,

                      "_blank",

                      "noopener"

                    ),

                }

              : undefined

          }

        />





        {/* PROCESSING PIPELINE */}


        <Card>


          <CardHeader>


            <CardTitle className="text-base">

              Processing Pipeline

            </CardTitle>


          </CardHeader>



          <CardContent className="space-y-4">


            <ProcessingPipeline

              status={
                doc.processing_status
              }

              errorMessage={
                doc.error_message
              }

            />




            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">


              <Meta label="Type">


                <span className="uppercase">

                  {doc.file_type}

                </span>


              </Meta>





              <Meta label="Size">


                {formatBytes(
                  doc.file_size_bytes
                )}


              </Meta>





              <Meta label="Uploaded">


                {formatDate(
                  doc.uploaded_at
                )}


              </Meta>





              <Meta label="Status">


                <Badge

                  className={cn(

                    "border-transparent",

                    tone.className

                  )}

                >

                  {tone.label}

                </Badge>


              </Meta>



            </div>


          </CardContent>


        </Card>








        {/* PREVIEW + EXTRACTION */}



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">



          <Card>


            <CardHeader>


              <CardTitle className="text-base flex items-center gap-2">


                <Icon className="h-4 w-4"/>


                File Preview


              </CardTitle>


            </CardHeader>




            <CardContent>


              {!signedUrl ? (


                <LoadingSkeleton rows={3}/>



              ) : canPreview ? (



                doc.file_type === "image" ? (


                  <img


                    src={signedUrl}


                    alt={doc.file_name}


                    className="w-full rounded border border-border"


                  />



                ) : (


                  <iframe


                    src={signedUrl}


                    title={doc.file_name}


                    className="w-full h-[520px] rounded border border-border bg-muted"


                  />


                )



              ) : (


                <EmptyState


                  icon={FileText}


                  title="Preview unavailable"


                  description="Download this file to view it."


                />


              )}



            </CardContent>



          </Card>








          <div className="space-y-6">





            {/* CONFIDENCE */}


            <Card>


              <CardHeader>


                <CardTitle className="text-base">


                  Extraction Confidence


                </CardTitle>


              </CardHeader>




              <CardContent>


                {

                  doc.confidence_score !== null

                  && doc.confidence_score !== undefined

                  ? (


                    <p className="text-3xl font-bold">


                      {Math.round(

                        doc.confidence_score * 100

                      )}%


                    </p>


                  )


                  : (


                    <p className="text-sm text-muted-foreground">


                      Confidence score not available yet.


                    </p>


                  )


                }


              </CardContent>


            </Card>







            {/* EXTRACTED TEXT */}



            <Card>


              <CardHeader>


                <CardTitle className="text-base">


                  Extracted Text


                </CardTitle>


              </CardHeader>




              <CardContent>


                {

                  doc.extracted_text

                  ? (


                    <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-auto">


                      {doc.extracted_text}


                    </pre>


                  )


                  : (


                    <p className="text-sm text-muted-foreground">


                      No extracted text available.


                    </p>


                  )


                }



              </CardContent>



            </Card>







            {/* STRUCTURED DATA */}



            <Card>


              <CardHeader>


                <CardTitle className="text-base">


                  Structured Data


                </CardTitle>


              </CardHeader>




              <CardContent>


                {


                doc.extracted_data &&

                Object.keys(

                  doc.extracted_data

                ).length > 0


                ? (


                  <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-auto">


                    {JSON.stringify(

                      doc.extracted_data,

                      null,

                      2

                    )}


                  </pre>


                )


                : (


                  <p className="text-sm text-muted-foreground">


                    Structured extraction pending.


                  </p>


                )


                }



              </CardContent>



            </Card>





          </div>



        </div>








        {/* CARBON SECTION STARTS IN PART 3 */}

        {/* =========================
            CARBON EMISSIONS SUMMARY
        ========================== */}


        {carbonLoading && (

          <Card>

            <CardContent className="py-6">

              <p className="text-sm text-muted-foreground">

                Calculating carbon emissions...

              </p>

            </CardContent>

          </Card>

        )}





        {carbonResults.length > 0 && (


          <Card>


            <CardHeader>


              <CardTitle className="flex items-center gap-2">


                <Leaf className="h-5 w-5 text-green-600"/>


                Carbon Emissions Summary


              </CardTitle>


            </CardHeader>





            <CardContent>


              <div className="space-y-4">



                {carbonResults.map((item) => (



                  <div


                    key={item.id}


                    className="flex justify-between items-center border-b pb-3"


                  >



                    <div>


                      <p className="font-medium capitalize">


                        {item.category}


                      </p>



                      <p className="text-sm text-muted-foreground">


                        {item.value} {item.unit}


                      </p>



                    </div>





                    <div className="text-right">


                      <p className="font-semibold text-green-600">


                        {Number(

                          item.carbon_kg

                        ).toFixed(2)}

                        {" "}kg CO₂


                      </p>




                      <p className="text-xs text-muted-foreground">


                        Factor: {item.emission_factor}


                      </p>


                    </div>




                  </div>



                ))}



              </div>



            </CardContent>


          </Card>


        )}








        {/* =========================
            AI INSIGHTS
        ========================== */}



        {aiLoading && (


          <Card>


            <CardContent className="py-6">


              <p className="text-sm text-muted-foreground">


                Generating AI sustainability insights...


              </p>


            </CardContent>


          </Card>


        )}







        {aiInsight && (


          <Card>



            <CardHeader>


              <CardTitle className="flex items-center gap-2">


                <Bot className="h-5 w-5 text-primary"/>


                AI Sustainability Insights


              </CardTitle>


            </CardHeader>





            <CardContent className="space-y-6">





              <div>


                <p className="font-semibold">


                  Main Insight


                </p>



                <p className="text-muted-foreground mt-2">


                  {aiInsight.insight}


                </p>



              </div>







              <div>


                <p className="font-semibold">


                  Recommendation


                </p>



                <p className="text-muted-foreground mt-2">


                  {aiInsight.recommendation || "No recommendation available."}


                </p>



              </div>







              <div className="grid md:grid-cols-3 gap-4">





                <Card>


                  <CardContent className="pt-6">


                    <div className="flex items-center gap-3">


                      <TrendingDown className="h-5 w-5 text-green-600"/>



                      <div>


                        <p className="text-sm">


                          CO₂ Savings


                        </p>



                        <p className="font-bold">


                          {aiInsight.estimated_co2e_saving_tonnes ?? 0}

                          {" "}t/year


                        </p>


                      </div>


                    </div>


                  </CardContent>


                </Card>








                <Card>


                  <CardContent className="pt-6">


                    <div className="flex items-center gap-3">


                      <DollarSign className="h-5 w-5 text-green-600"/>



                      <div>


                        <p className="text-sm">


                          Annual Savings


                        </p>



                        <p className="font-bold">


                          $

                          {aiInsight.estimated_annual_saving_usd ?? 0}


                        </p>


                      </div>


                    </div>


                  </CardContent>


                </Card>








                <Card>


                  <CardContent className="pt-6">


                    <p className="text-sm">


                      Priority


                    </p>



                    <p className="font-bold text-red-600">


                      {aiInsight.priority}


                    </p>


                  </CardContent>


                </Card>




              </div>





            </CardContent>


          </Card>


        )}






      </div>


    </AppLayout>

  );


}







function Meta({

  label,

  children,

}: {

  label:string;

  children:React.ReactNode;

}) {


  return (

    <div>


      <p className="text-xs text-muted-foreground">

        {label}

      </p>



      <div className="mt-1 text-foreground">

        {children}

      </div>


    </div>


  );


}