"use client";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-moment';

interface RecordType {
  actual: number | null;
  forecast: number | null;
  time: string ;
}

interface ActType {
  [key: string]: RecordType;
}

ChartJS.register(...registerables);

const timezoneOffset = -330; 

const prepareChartData = (windActualData: any[], windForecastData: any[], horizon: number) => {
  const actual = [];
  const forecast = [];
  const labels = [];

  let act: ActType = {};
  
  for(let record of windActualData){
    const time = new Date(record.startTime)
    time.setMinutes(time.getMinutes() + timezoneOffset);
    const tf = time.toISOString();
    act[tf] = {"actual": record.generation, "forecast": null, "time": tf};
    
  }


  for (let record of windForecastData){
    const cpt = new Date(record.startTime);
    cpt.setMinutes(cpt.getMinutes() - horizon);
    const label = cpt.toISOString();


    if(record.publishTime===label){
      const time = new Date(record.startTime)
      time.setMinutes(time.getMinutes() + timezoneOffset);
      const tf = time.toISOString();
      if(act[tf]){
        act[tf].forecast = record.generation;
      }else{
        act[tf] = {"actual": null, "forecast": record.generation, "time": tf};
      }
    } 
  }
  for(let i of Object.keys(act)){
    forecast.push(act[i].forecast)
    actual.push(act[i].actual)
    labels.push(act[i].time)
  }
  // console.log(act)
  // console.log("forecast", forecast);
  // console.log("labels", labels);


  const actualDataset = {
    label: 'Wind Actual',
    data: actual,
    borderColor: 'rgba(135, 206, 250, 1)',
    backgroundColor: 'rgba(135, 206, 250, 0.2)', 
    pointRadius:1.5,
    pointHoverRadius:4,
    fill:false,
    borderWidth: 1,
  };

  const forecastDataset = {
    label: 'Wind Forecast',
    data: forecast,
    borderColor: 'rgba(220, 20, 60, 1)',
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    pointRadius:1.5,
    pointHoverRadius:4,
    spanGaps:true,
    fill:false,
    borderWidth:1,
  };

  return {
    labels,
    datasets: [actualDataset, forecastDataset],
  };
};

const getSliderBackground = (horizon: number) => {
  const percentage = (horizon / 2880) * 100;
  return `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percentage}%, #d1d5db ${percentage}%)`;
};

export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [horizon, setHorizon] = useState(0);
  const [windActualData, setWindActualData] = useState([]);
  const [windForecastData, setWindForecastData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedStartDate = `${startDate}:00.000Z`;
      const formattedEndDate = `${endDate}:00.000Z`;

      const response = await fetch(`/api/forecast?startDate=${formattedStartDate}&endDate=${formattedEndDate}&horizon=${horizon}`);
      const data = await response.json();

      if (response.ok) {
        setWindActualData(data.windActualData);
        setWindForecastData(data.windForecastData);
        setError('');
      } else {
        setError(data.error || 'An error occurred while fetching data.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    }finally {
    setLoading(false);
  }
};

const chartData = prepareChartData(windActualData, windForecastData, horizon);

return (
  <div className="flex flex-col bg-slate-700 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
  <h1 className="text-4xl font-bold text-white text-center mb-8"> <span className='text-gradient'>Forecast Monitoring App</span> ⛅</h1>
  <div className="bg-white rounded-lg shadow-lg p-8 mx-auto max-w-4xl w-full">
    <form className="mb-8" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="start-date" className="block text-sm font-semibold text-gray-800">
            Start Date:
          </label>
          <div className="mt-2 relative">
            <input
              type="datetime-local"
              id="start-date"
              min="2024-01-01T00:00"
              max="2024-01-31T23:59"
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-semibold text-gray-800">
            End Date:
          </label>
          <div className="mt-2 relative">
            <input
              type="datetime-local"
              id="end-date"
              min="2024-01-01T00:00"
              max="2024-01-31T23:59"
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="horizon" className="block text-sm font-semibold text-gray-800">
            Forecast Horizon:
          </label>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-600 font-medium mr-4">{horizon} minutes</span>
            <input
              type="range"
              id="horizon"
              min="30"
              max="2880"
              step="60"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="flex-1 h-4 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                backgroundImage: getSliderBackground(horizon),
              }}
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="mt-10 inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? (
          <svg
            className="animate-spin flex justify-center h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        ) : (
          'Submit'
        )}
      </button>
    </form>
    {error && <p className="text-red-500 mb-4">{error}</p>}
    {chartData && (
      <div className=" h-[550px] sm:h-[450px] md:h-[375px] lg:h-[375px] xl:h-[370px]">
        <Line
  data={chartData}
  options={{
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'DD MMM YY, HH:mm', // Tooltip format
          displayFormats: {
            hour: 'HH:mm', // Time format for axis
            day: 'DD MMM YY', // Date format for axis
          },
        },
        title: {
          display: true,
          text: 'Time (UTC)', 
          font: {
            size: 16, // Larger font size for axis title
            weight: 'bold', // Bold font weight for axis title
            family: 'Arial, sans-serif', // Font family for axis title
          },
        },
        ticks: {
          autoSkip: true, // Ensures labels do not overlap
          maxRotation: 0, // Prevents rotation of the labels
          minRotation: 0, // Prevents rotation of the labels
          padding: 20, // Add padding between labels and axis
          font: {
            size: 12, // Font size for labels
            weight: 'normal', // Font weight for labels
            family: 'Arial, sans-serif', // Font family for labels
            // color: '#333', // Font color for labels
          },
          // stepSize: 4, // Increase spacing between labels
          callback: function(value, index, values) {
            const date = new Date(value);
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const day = date.toLocaleDateString([], { day: '2-digit' });
            const month = date.toLocaleDateString([], { month: 'short' });
            return [time,day,month]; // Return time and date with month name on separate lines
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Generation (MW)', 
          font: {
            size: 16, // Larger font size for axis title
            weight: 'bold', // Bold font weight for axis title
            family: 'Arial, sans-serif', // Font family for axis title
          },
        },
        ticks: {
          font: {
            size: 12, // Font size for labels
            weight: 'normal', // Font weight for labels
            family: 'Arial, sans-serif', // Font family for labels
            // color: '#333', // Font color for labels
          },
        },
      },        
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14, // Font size for legend
            weight: 'normal', // Font weight for legend
            family: 'Arial, sans-serif', // Font family for legend
            // color: '#333', // Font color for legend
          },
        },
      },
      title: {
        display: true,
        text: 'Wind Generation',
        font: {
          size: 18, // Font size for chart title
          weight: 'bold', // Bold font weight for chart title
          family: 'Arial, sans-serif', // Font family for chart title
        },
      },
    },
  }}
/>


      </div>
    )}
  </div>
</div>
)
}