const HUGGINGFACE_API_KEY =
  Deno.env.get("HUGGINGFACE_API_KEY");

const GEMINI_API_KEY =
  Deno.env.get("GEMINI_API_KEY");



async function generateWithHuggingFace(prompt:string) {

  const response = await fetch(

    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",

    {
      method:"POST",

      headers:{
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type":"application/json",
      },

      body:JSON.stringify({

        inputs: prompt,

        parameters:{
          max_new_tokens:300,
          temperature:0.7
        }

      })

    }

  );


  const result = await response.json();


  console.log(
    "HUGGING FACE RESPONSE:",
    JSON.stringify(result)
  );


  if(!response.ok){

    throw new Error(
      JSON.stringify(result)
    );

  }


  return (
    result?.[0]?.generated_text ??
    ""
  );

}





async function generateWithGemini(prompt:string){

  const response = await fetch(

    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,

    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        contents:[

          {
            parts:[
              {
                text:prompt
              }
            ]
          }

        ]

      })

    }

  );


  if(!response.ok){

    const errorText = await response.text();

    console.log(
      "Gemini API Error:",
      errorText
    );

    throw new Error(
      errorText
    );

  }



  const data = await response.json();


  return (
    data
    ?.candidates?.[0]
    ?.content
    ?.parts?.[0]
    ?.text
    ??
    ""
  );

}





function parseAIResponse(
  text:string,
  totalCarbon:number
){


  let priority="Medium";


  if(totalCarbon > 10000){

    priority="High";

  }

  else if(totalCarbon < 1000){

    priority="Low";

  }



  return {

    insight:
 text
 .replace(/\n+/g," ")
 .trim()
 .slice(0,300),


    recommendation:

text
.replace(/\n+/g," ")
.trim()
.slice(300,600)
||
"Improve energy efficiency and increase renewable energy usage.",


    priority,



    estimated_co2_saving_tonnes:

      Number(
        (
          (totalCarbon * 0.2)
          /
          1000
        )
        .toFixed(2)
      ),



    estimated_annual_saving_usd:

      Number(
        (
          totalCarbon * 0.05
        )
        .toFixed(2)
      )

  };

}





export async function generateAIInsights(
  carbonData:any
){


  const totalCarbon =
    carbonData.totalCarbon ?? 0;



  const prompt = `

You are a sustainability AI consultant.

Analyze this company carbon data.

Total carbon emission:
${totalCarbon} kg CO2


Carbon breakdown:

${JSON.stringify(
  carbonData.carbonResults
)}



Provide:

1. Main carbon problem
2. Reduction recommendations
3. Estimated savings
4. Priority level


Keep response practical for a company dashboard.

`;



  let aiText = "";



  // Hugging Face First

  try {


    aiText =
      await generateWithHuggingFace(
        prompt
      );


    console.log(
      "Generated using Hugging Face"
    );


  }

  catch(error){


    console.log(
      "Hugging Face failed, trying Gemini"
    );


    try {


      aiText =
        await generateWithGemini(
          prompt
        );


    }

    catch(geminiError){


      console.log(
        "Gemini failed, using fallback"
      );


      aiText = `

Main carbon problem:
High emissions detected from energy usage.


Recommendations:
Reduce electricity consumption, improve efficiency,
increase renewable energy adoption and optimize fuel usage.


Priority:
Medium

`;

    }

  }



  return {

  insight:
    text
      .replace(/\n+/g, " ")
      .trim()
      .slice(0,300),


  recommendation:
    text
      .replace(/\n+/g, " ")
      .trim()
      .slice(300,600)
      ||
      "Improve energy efficiency and increase renewable energy usage.",


  priority,


  estimated_co2_saving_tonnes:
    Number(
      (
        (totalCarbon * 0.2) / 1000
      ).toFixed(2)
    ),


  estimated_annual_saving_usd:
    Number(
      (
        totalCarbon * 0.05
      ).toFixed(2)
    )

};


}