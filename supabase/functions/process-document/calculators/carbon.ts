export interface CarbonResult {
  category: string;
  value: number;
  unit: string;
  emissionFactor: number;
  carbonKg: number;
}


const emissionFactors: Record<string, number> = {

  electricity: 0.82, // kg CO2 per kWh

  diesel: 2.68,     // kg CO2 per litre

  petrol: 2.31,     // kg CO2 per litre

  fuel: 2.31,       // default fuel factor

  water: 0.344,     // kg CO2 per 1000 litres

  waste: 0.45       // kg CO2 per kg

};



export function calculateCarbon(
  category: string,
  value: number,
  unit: string
): CarbonResult {


  const factor =
    emissionFactors[category] ?? 0;



  let carbonKg = 0;



  // Water calculation
  if(category === "water") {

    carbonKg =
      (value / 1000) * factor;

  }


  // Normal calculation
  else {

    carbonKg =
      value * factor;

  }



  return {

    category,

    value,

    unit,

    emissionFactor: factor,

    carbonKg:
      Number(carbonKg.toFixed(2))

  };

}