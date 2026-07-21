import { Bot, Leaf, DollarSign, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface AIInsight {
  insight?: string;
  recommendation?: string;
  priority?: string;
  estimated_co2_saving_tonnes?: number;
  estimated_annual_saving_usd?: number;
}


interface Props {
  data?: AIInsight;
}


const priorityStyles:any = {
  High:
    "text-red-500 bg-red-500/10 border-red-500/30",

  Medium:
    "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",

  Low:
    "text-green-500 bg-green-500/10 border-green-500/30",
};



export function AIInsightsCard({data}:Props){

  if(!data){
    return null;
  }


  return (

    <Card className="glass-card border-primary/20">

      <CardHeader>

        <div className="flex items-center justify-between">

          <CardTitle className="flex items-center gap-2">

            <Bot className="h-5 w-5 text-primary"/>

            AI Sustainability Advisor

          </CardTitle>


          <span
            className={`
              text-xs px-3 py-1 rounded-full border
              ${priorityStyles[data.priority ?? "Medium"]}
            `}
          >

            {data.priority ?? "Medium"}

          </span>


        </div>

      </CardHeader>



      <CardContent className="space-y-5">


        <div>

          <h4 className="text-sm font-semibold mb-1">
            Carbon Insight
          </h4>


          <p className="text-sm text-muted-foreground leading-relaxed">

            {data.insight}

          </p>

        </div>




        <div>

          <h4 className="text-sm font-semibold mb-1">
            Recommendation
          </h4>


          <p className="text-sm text-muted-foreground leading-relaxed">

            {data.recommendation}

          </p>


        </div>




        <div className="grid grid-cols-2 gap-4">


          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">

            <div className="flex items-center gap-2">

              <Leaf className="h-4 w-4 text-primary"/>

              <span className="text-xs">
                CO₂ Saving
              </span>

            </div>


            <p className="text-lg font-bold mt-2">

              {data.estimated_co2_saving_tonnes ?? 0}

              {" "}
              tonnes

            </p>


          </div>





          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">


            <div className="flex items-center gap-2">

              <DollarSign className="h-4 w-4 text-primary"/>

              <span className="text-xs">
                Annual Saving
              </span>

            </div>


            <p className="text-lg font-bold mt-2">

              $
              {data.estimated_annual_saving_usd ?? 0}

            </p>


          </div>



        </div>


      </CardContent>


    </Card>

  );

}