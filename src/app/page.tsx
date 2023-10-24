
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

  interface ToolTipPositionProps {
    top: number;
    left: number;
  }


export default function Home() {

  const result = useData('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');

  const [selectedElement, setSelectedElement] = useState<SelectedElementType>({year: 0, month: 0, variance: 0, temperature: 0})
  const [tooltipPosition, setTooltipPosition] = useState<ToolTipPositionProps>({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

  if (result === undefined) {
    return;
  }
  
  const [minYear, maxYear] = d3.extent(result.monthlyVariance.map(x => x.year))

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
        { month: data.month, variance: parseFloat(data.variance.toFixed(1)), temperature:parseFloat((result.baseTemperature + data.variance).toFixed(2))})
    
  })


  function handleMouseEnter(e: React.MouseEvent<SVGRectElement, MouseEvent>, year: number, month: number) {

    const elementYear = dataWithTemperature.find(x => x.year === year);
    
    const elementMonthData = elementYear?.monthlyData.find(m => m.month === month);
    
    if(elementYear && elementMonthData && elementYear.year) {
      setSelectedElement({year: elementYear.year, ...elementMonthData});
    }

    const clientX = e.clientX;
    const clientY = e.clientY;
    const toolTipPadding = -100;

    setTooltipPosition({
      top: clientY + toolTipPadding, 
      left: clientX-30,
    });
    setToolTipAttrs('tooltip active opacity-80')
  }

  function handleMouseLeave() {
    setToolTipAttrs('tooltip opacity-0')
  }

  function tempColor(temp: number) : string {
    
    if (temp < 2.8) {
      return "rgb(21, 81, 161)"
    }
    else if(temp >= 2.8 && temp < 3.9) {
      return "rgb(69, 117, 180)";
    } else if (temp >= 2.8 && temp < 5) {
      return "rgb(116, 173, 209)";
    }else if (temp >= 5 && temp < 6.1) {
      return "rgb(171, 217, 233)";
    }else if (temp >= 6.1 && temp < 7.2) {
      return "rgb(224, 243, 248)";
    }else if (temp >= 7.2 && temp < 8.3) {
      return "rgb(255, 255, 191)";
    }else if (temp >= 8.3 && temp < 9.5) {
      return "rgb(254, 224, 144)";
    }else if (temp >= 9.5 && temp < 10.6) {
      return "rgb(253, 174, 97)";
    }else if (temp >= 10.6 && temp < 11.7) {
      return "rgb(244, 109, 67)";
    }else if (temp >= 11.7 && temp <= 12.8) {
      return "rgb(215, 48, 39)";
    } else {
      return "rgb(154, 11, 4)";
    }
  }

  const svgHeight = 540
  const svgWidth = 1603
  const padding = {
    Left: 100,
    Right: 50,
    Top: 35,
    Bottom: 150
  }
  const rectWidth = 5;
  const rectHeight = 33;

  if (minYear === undefined || maxYear === undefined) {
    return
  }

  let startXcoordinate = padding.Left - rectWidth;
  let startYcoordinate = padding.Top - rectHeight;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <ToolTip
        element={selectedElement}
        position={tooltipPosition}
        toolTipAttrs={tooltipAttrs}
      />


      <svg height={svgHeight} width={svgWidth} className='text-black bg-amber-50'>
        {dataWithTemperature.map( data => {
          startYcoordinate = padding.Top;
          startXcoordinate += rectWidth;
          return (
            data.monthlyData.map((monthData) => {
              startYcoordinate += rectHeight;
              return (
                <rect key={data.year.toString() + ' - ' + monthData.month.toString()} width={5} height={33} 
                      fill={tempColor(monthData.temperature)} 
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

interface ToolTipProps {
  element: SelectedElementType;
  position: ToolTipPositionProps;
  toolTipAttrs: string;
}

function ToolTip({element, position, toolTipAttrs}: ToolTipProps) {

  function numberToMonth(numberMonth:number) : string {
    const monthArray = ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];

    return monthArray[numberMonth - 1];
  }
  
  return (

    <div id='tooltip' 
        data-year={element.year}
        className={`flex flex-col justify-center items-center bg-slate-600 font-bold text-base text-white p-2 absolute rounded select-none pointer-events-none ${toolTipAttrs}`}
        style={{ top: position.top + 'px', left: position.left + 'px' }}
    >
    {element && (
      <>
        <p>{element.year} - {numberToMonth(element.month)}</p>
        <p>{element.temperature}°C</p>
        <p>{element.variance > 0 && '+'}{element.variance}°C</p> 
      </>
    )}   
</div>
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