"use client";
import React, { useState } from 'react';
import { Chart, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables, registry } from 'chart.js';
import 'chartjs-adapter-moment';
import moment from 'moment-timezone';

ChartJS.register(...registerables);

const timezoneOffset = -330; // Assuming the offset is -330 minutes (5 hours and 30 minutes)

const prepareChartData = (windActualData: any[], windForecastData: any[], horizon: number) => {
  const labels = Array.from(
    new Set([
      ...windActualData.map((record: { startTime: any; }) => moment(record.startTime).add(timezoneOffset, 'minutes').toISOString()),
      ...windForecastData.map((record: { startTime: any; }) => moment(record.startTime).add(timezoneOffset, 'minutes').toISOString()),
    ])
  ).sort();

  const actualDataset = {
    label: 'Wind Actual',
    data: labels.map((label) => {
      const record = windActualData.find((record: { startTime: any; }) => moment(record.startTime).add(timezoneOffset, 'minutes').toISOString() === label);
      return record ? record.generation : null;
    }),
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
  };

  const forecastDataset = {
    label: 'Wind Forecast',
    data: labels.map((label) => {
      const targetPublishTime = moment(label).utc();
      targetPublishTime.subtract(horizon, 'minutes');
      const targetPublishTimeStr = targetPublishTime.toISOString();

      const closestPublishTime = windForecastData.reduce((prev, curr) => {
        const prevDiff = Math.abs(moment(prev.publishTime).add(timezoneOffset, 'minutes').utc().diff(targetPublishTime, 'minutes'));
        const currDiff = Math.abs(moment(curr.publishTime).add(timezoneOffset, 'minutes').utc().diff(targetPublishTime, 'minutes'));
        return prevDiff < currDiff ? prev : curr;
      });

      const records = windForecastData.filter((record: { startTime: any; publishTime: any; }) => moment(record.startTime).add(timezoneOffset, 'minutes').toISOString() === label && moment(record.publishTime).add(timezoneOffset, 'minutes').toISOString() === moment(closestPublishTime.publishTime).add(timezoneOffset, 'minutes').toISOString());
      if (records.length === 0) {
        return null;
      }
      const generation = closestPublishTime.generation;
      return generation;
    }),
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
  };

  return {
    labels,
    datasets: [actualDataset, forecastDataset],
  };
};
export default function Home() {
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [horizon, setHorizon] = useState('');
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

 const chartData = prepareChartData(windActualData, windForecastData, parseInt(horizon));
 
 return (
  <div className="flex flex-col bg-slate-700 items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl font-bold text-white p-12">Forecast Monitoring App</h1>
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
      <form className="mb-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date:
            </label>
            <input
              type="datetime-local"
              id="start-date"
              min="2024-01-01T00:00"
              max="2024-01-31T23:59"
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              End Date:
            </label>
            <input
              type="datetime-local"
              id="end-date"
              min="2024-01-01T00:00"
              max="2024-01-31T23:59"
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="horizon" className="block text-sm font-medium text-gray-700">
              Forecast Horizon: {horizon} minutes
            </label>
            <input
              type="range"
              id="horizon"
              min="0"
              max="1440"
              step="30"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
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
        <div className="mb-4">
          <div className="flex justify-between mb-4 text-gray-600">
            <div>
              Start Time: <span className="font-semibold">{chartData.labels[0]}</span>
            </div>
            <div>
              End Time: <span className="font-semibold">{chartData.labels[chartData.labels.length - 1]}</span>
            </div>
            <div className="flex items-center">
              Forecast Horizon: <span className="font-semibold ml-2">{horizon} minutes</span>
            </div>
          </div>
          <Line
            data={chartData}
            options={{
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'hour',
                    displayFormats: {
                      hour: 'DD-MM, hh:mm a',
                    },
                  },
                },
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Wind Data',
                },
              },
            }}
          />
        </div>
      )}
    </div>
  </div>
);
}