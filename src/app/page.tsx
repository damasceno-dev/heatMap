
"use client"
import { useEffect, useState } from "react"
import * as d3 from 'd3';
import { getDataWithTemperature } from "./deletedCode";

interface DataPlot {
  year: number;
  month: number;
  variance: number;
}
interface SelectedElementType extends DataPlot {
  temperature: number;
}
interface Data {
  baseTemperature: number;
  monthlyVariance: DataPlot[];
}
interface DataPlotWithTemperature extends Pick<DataPlot, "month" | "variance"> { 
  temperature: number;
}
interface DataYearObjectArray { 
    year: number,
    monthlyData: {
      month: number,
      variance: number,
      temperature: number
    }[]
  }


export default function Home() {

  const result = useData('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');

  const [selectedElement, setSelectedElement] = useState<SelectedElementType>({year: 0, month: 0, variance: 0, temperature: 0})
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

  if (result === undefined) {
    return;
  }
  
  const [minYear, maxYear] = d3.extent(result.monthlyVariance.map(x => x.year))
  
  // let dataTemp: DataPlotWithTemperature[] = [];
  // dataTemp = result.monthlyVariance.map(data => {
  //   return ({...data, temperature: result.baseTemperature + data.variance})
  // })

  
  let dataWithTemperature: DataYearObjectArray[] = []
  let monthlyData: DataPlotWithTemperature[] = []
  let year = minYear;

  result.monthlyVariance.forEach( data => {  
    if (year && data.year !== year) {
      dataWithTemperature.push({year, monthlyData})
      year = data.year
      monthlyData = []
    } 
    monthlyData.push(
        { month: data.month, variance: data.variance, temperature:result.baseTemperature + data.variance})
    
  })


  function handleMouseEnter(e: React.MouseEvent<SVGRectElement, MouseEvent>, year: number, month: number) {

    const elementYear = dataWithTemperature.find(x => x.year === year);
    
    const elementMonthData = elementYear?.monthlyData.find(m => m.month === month);
    
    if(elementYear && elementMonthData && elementYear.year) {
      setSelectedElement({year: elementYear.year, ...elementMonthData});
    }

    const clientX = e.clientX;
    const clientY = e.clientY;
    const toolTipPadding = 6;

    setTooltipPosition({
      top: clientY + toolTipPadding, 
      left: clientX + toolTipPadding,
    });
    setToolTipAttrs('tooltip active opacity-80')
  }

  function handleMouseLeave() {
    setToolTipAttrs('tooltip opacity-0')
  }

  const svgHeight = 540
  const svgWidth = 1603
  const padding = {
    Left: 100,
    Right: 50,
    Top: 35,
    Bottom: 150
  }

  if (minYear === undefined || maxYear === undefined) {
    return
  }

  let startXcoordinate = padding.Left - 5;
  let startYcoordinate = padding.Top - 33;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <div id='tooltip' 
           data-year={selectedElement.year}
           className={`bg-slate-400 text-sm font-bold p-2 absolute rounded text-black select-none pointer-events-none ${tooltipAttrs}`}
           style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}
        >
        {selectedElement && (
          <>
            <p>{selectedElement.year} - {selectedElement.month}</p>
            <p>{selectedElement.temperature}</p>
            <p>{selectedElement.variance}</p> 
          </>
        )}   
      </div>


      <svg height={svgHeight} width={svgWidth} className='text-black bg-amber-50'>
        {dataWithTemperature.map( data => {
          startYcoordinate = padding.Top;
          startXcoordinate += 5;
          return (
            data.monthlyData.map((monthData, i) => {
              startYcoordinate += 33;
              return (
                <rect key={data.year.toString() + ' - ' + monthData.month.toString()} width={5} height={33} 
                      fill='#fee090' 
                      x={startXcoordinate} 
                      y={startYcoordinate}
                      className="hover:stroke-black"
                      data-month={monthData.month}
                      data-year={data.year}
                      onMouseEnter={(event) => {handleMouseEnter(event, data.year, monthData.month)}}
                      onMouseLeave={handleMouseLeave}
                />
              )
            })
          )
        })}
      </svg>
    </main>
  )
}

function useData(url: string) {
  const [data, setData] = useState<Data>();
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if(!ignore) {
          setData(data);
        }
      });

      return () => {
        ignore = true;
      }
  }, [url])

  return data;
}

function useDataAsync(url: string) {
  const [data, setData] = useState<Data>();
  useEffect(() => {
    let ignore = false;

    async function fetchData(url: string) {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json()
      
      if(!ignore) {
        setData(data)
      }
    } 
   
    fetchData(url);

      return () => {
        ignore = true;
      }
    }, [url])
    
    return data;
}