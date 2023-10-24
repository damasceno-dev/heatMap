interface DataPlot {
    year: number;
    month: number;
    variance: number;
  }
  interface Data {
    baseTemperature: number;
    monthlyVariance: DataPlot[];
  }
  interface DataWithTemperature extends Pick<DataPlot, "year" | "month"> { 
    temperature: number
  }
const result = {baseTemperature: 8.66, monthlyVariance: [{year: 1999, month: 1, variance:0.00}]}
  const totalvalue = result.monthlyVariance.reduce((acc, x) => {
    return acc + x.variance
  }, 0)
export function getDataWithTemperature(heatData: Data) : DataWithTemperature[] {
    // debugger
    const result = heatData.monthlyVariance.map(data => {
      let temperature = getTemperature(data.year, data.month);
      return ({year: data.year, month: data.month, temperature})
    })
  
    function getTemperature(year : number, month: number) : number  {
  
      let variance = heatData.monthlyVariance.find(x => x.month === month && x.year ===year)?.variance;
  
      if (variance === undefined) {
        throw new Error(`Can't get data variance from year ${year} and month ${month}`);
      }
  
      // if (year === 1753 && month === 1) {
      //   return heatData.baseTemperature + variance;
      // }
  
      // do {
      //   if (month === 1) {
      //     year--;
      //     month = 12;
      //   } else {
      //     month--;
      //   }
      //     variance += heatData.monthlyVariance.find(x => x.month === month && x.year ===year)?.variance!
      // } while (year !== 1753 && month !== 1)
  
  
      while (year !== 1753 || month !== 1) {
        if (month === 1) {
          year--;
          month = 12;
        } else {
          month--;
        }
          variance += heatData.monthlyVariance.find(x => x.month === month && x.year ===year)?.variance!
      } 
  
        return heatData.baseTemperature + variance;
        
    }
  
    // const returnedArray = result.filter((x) => x !== undefined) as {year: number, month: number, temperature: number}[];
  
    return result
  }
  