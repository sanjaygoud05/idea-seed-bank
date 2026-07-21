import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { AppLayout } from '@/layouts/AppLayout';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

import { Button } from '@/components/ui/button';

import {
  Building2,
  BarChart3,
  Sparkles,
  Leaf,
  Zap,
  Sun,
  Recycle,
  TrendingDown,
  ArrowUpRight,
  Bot,
  ShieldCheck,
} from 'lucide-react';


import {
  getMyCompany,
  listEmissions,
  listEnergy,
  listInsights,
  listNotifications,
} from '@/services/company';


import { NotificationCard } from '@/components/notifications/NotificationCard';

import { formatNumber } from '@/utils/format';


import { KpiCard } from '@/components/dashboard/KpiCard';
import { EmissionsTrendChart } from '@/components/dashboard/EmissionsTrendChart';
import { EmissionBreakdown } from '@/components/dashboard/EmissionBreakdown';
import { EnergyMixChart } from '@/components/dashboard/EnergyMixChart';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';



export default function DashboardPage() {


  const company = useQuery({
    queryKey:['my-company'],
    queryFn:getMyCompany
  });



  const companyId = company.data?.id;



  const emissions = useQuery({

    queryKey:[
      'dashboard',
      'emissions',
      companyId
    ],

    queryFn:()=>listEmissions(companyId!),

    enabled:!!companyId

  });



  const energy = useQuery({

    queryKey:[
      'dashboard',
      'energy',
      companyId
    ],

    queryFn:()=>listEnergy(companyId!),

    enabled:!!companyId

  });



  const insights = useQuery({

    queryKey:[
      'dashboard',
      'insights',
      companyId
    ],

    queryFn:()=>listInsights(companyId!),

    enabled:!!companyId

  });



  const notifs = useQuery({

    queryKey:[
      'dashboard',
      'notifs'
    ],

    queryFn:listNotifications

  });





  if(company.isLoading){

    return (

      <AppLayout>

        <LoadingSkeleton rows={4}/>

      </AppLayout>

    );

  }






  if(!company.data){

    return (

      <AppLayout>

        <div className="space-y-8">

          <div className="hero-aurora p-8 md:p-10">


            <div className="relative z-10 max-w-2xl space-y-3">


              <span className="chip-emerald">

                <Leaf className="h-3 w-3"/>

                CarbonIQ · Intelligence Platform

              </span>



              <h1 className="text-3xl md:text-4xl font-bold">

                Set up your company to unlock carbon intelligence.

              </h1>



              <p className="text-muted-foreground">

                Create your organization profile to start measuring emissions and receiving AI recommendations.

              </p>



              <Button asChild>

                <Link to="/company">

                  <Building2 className="h-4 w-4"/>

                  Create company profile

                </Link>

              </Button>


            </div>


          </div>


        </div>


      </AppLayout>

    );

  }







  const emissionRows = emissions.data ?? [];

  const energyRows = energy.data ?? [];



  const totalCo2e = Math.round(

    emissionRows.reduce(

      (sum:any,row:any)=>

      sum + Number(row.carbon_tonnes ?? 0),

      0

    )

  );



  const totalKwh = energyRows.reduce(

    (sum:any,row:any)=>

    sum + Number(row.electricity_kwh ?? 0),

    0

  );



  const totalRenewable = energyRows.reduce(

    (sum:any,row:any)=>

    sum + Number(row.renewable_kwh ?? 0),

    0

  );



  const totalEnergyMwh =
    Math.round(totalKwh/1000);



  const renewablePct =
    totalKwh > 0
    ? Math.round((totalRenewable/totalKwh)*100)
    : 0;




  const wasteTonnes = Math.round(

    emissionRows

    .filter((r:any)=>

      /waste/i.test(

        `${r.emission_type ?? ''} ${r.source ?? ''}`

      )

    )

    .reduce(

      (sum:any,row:any)=>

      sum + Number(row.carbon_tonnes ?? 0),

      0

    )

    *10

  )/10;







return (

<AppLayout>


<div className="space-y-8">



<section className="hero-aurora p-6 md:p-8">


<div className="flex flex-col md:flex-row md:justify-between gap-4">


<div>


<div className="flex gap-2">


<span className="chip-emerald">

<Leaf className="h-3 w-3"/>

Sustainability Intelligence

</span>



<span className="chip-emerald">

<ShieldCheck className="h-3 w-3"/>

{company.data.industry || "Enterprise"}

</span>


</div>



<h1 className="text-3xl font-bold mt-3">

Welcome back,

<span className="text-primary ml-2">

{company.data.company_name}

</span>


</h1>



<p className="text-muted-foreground mt-2">

Monitor carbon performance and reduce emissions using AI.

</p>



</div>



<div className="flex gap-2">


<Button asChild variant="outline">

<Link to="/uploads">

Upload data

</Link>

</Button>



<Button asChild>

<Link to="/insights">

<Bot className="h-4 w-4"/>

AI Advisor

</Link>

</Button>



</div>



</div>


</section>







<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


<KpiCard
label="Total Carbon Footprint"
value={formatNumber(totalCo2e)}
unit="t CO₂e"
hint="All emissions"
icon={Leaf}
accent="emerald"
/>


<KpiCard
label="Energy Consumption"
value={formatNumber(totalEnergyMwh)}
unit="MWh"
hint="Total energy"
icon={Zap}
accent="amber"
/>


<KpiCard
label="Renewable Energy"
value={`${renewablePct}`}
unit="%"
hint="Clean energy"
icon={Sun}
accent="emerald"
/>


<KpiCard
label="Waste Impact"
value={formatNumber(wasteTonnes)}
unit="t CO₂e"
hint="Waste emissions"
icon={Recycle}
accent="slate"
/>


</section>








<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">


<div className="glass-card p-5 lg:col-span-2">


<h3 className="font-semibold flex gap-2">

<TrendingDown className="h-4 w-4"/>

Emission Trend

</h3>


{emissions.isLoading

?

<LoadingSkeleton rows={4}/>

:

<EmissionsTrendChart data={emissionRows as any}/>

}


</div>





<div className="glass-card p-5">


<h3 className="font-semibold">

Energy Mix

</h3>


{energy.isLoading

?

<LoadingSkeleton rows={4}/>

:

<EnergyMixChart data={energyRows as any}/>

}


</div>



</section>








<section className="glass-card p-6">


<h3 className="font-semibold mb-4">

Carbon Emission Breakdown

</h3>


<EmissionBreakdown data={emissionRows as any}/>


</section>









<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">



<div>


{

insights.isLoading

?

<LoadingSkeleton rows={4}/>


:

(insights.data ?? []).length === 0


?

<EmptyState

icon={Sparkles}

title="No AI insights yet"

description="Upload data to generate AI recommendations."

/>


:

<AIInsightsCard

data={(insights.data ?? [])[0]}

/>


}


</div>








<div className="glass-card p-5">


<div className="flex justify-between mb-4">


<div>

<h3 className="font-semibold">

Recent Alerts

</h3>


<p className="text-xs text-muted-foreground">

Workspace notifications

</p>


</div>


<Link to="/notifications">

<ArrowUpRight className="h-4 w-4"/>

</Link>


</div>




{

(notifs.data ?? []).length === 0

?

<EmptyState

icon={BarChart3}

title="You're all caught up"

description="No alerts."

/>


:

(notifs.data ?? []).slice(0,4).map((n:any)=>(


<NotificationCard

key={n.id}

notification={{

id:n.id,

title:n.title,

message:n.message,

kind:n.category ?? "info",

read:n.status==="read",

createdAt:n.created_at

}}

/>


))


}



</div>



</section>






</div>


</AppLayout>

);


}