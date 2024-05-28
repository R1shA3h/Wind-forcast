"use client";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Slider from 'react-input-slider';

export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [horizon, setHorizon] = useState('');
  const [windActualData, setWindActualData] = useState([]);
  const [windForecastData, setWindForecastData] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedStartDate = `${startDate}:00.000Z`;
        const formattedEndDate = `${endDate}:00.000Z`;

        const response = await fetch(`/api/route?startDate=${formattedStartDate}&endDate=${formattedEndDate}&horizon=${horizon}`);
        const data = await response.json();

        if (response.ok) {
          setWindActualData(data.windActualData);
          setWindForecastData(data.windForecastData);
        } else {
          setError(data.error || 'An error occurred while fetching data.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data.');
      }
    };

    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate, horizon]);

  console.log(startDate);
  console.log(endDate);
  console.log(horizon);

  const handleSubmit = () => {
    alert(`Start Date: ${startDate}:00.000Z\nEnd Date: ${endDate}:00.000Z\nHorizon: ${horizon}`);
  };

  return (
    <div className="flex bg-gray-100 mt-20 shadow-md rounded-lg justify-center items-center">
      <form className="p-10 border-none" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex gap-2 items-center">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              Start Date:
            </label>
            <input
              type="datetime-local"
              id="start-date"
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              End Date:
            </label>
            <input
              type="datetime-local"
              id="end-date"
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="horizon" className="text-sm font-medium text-gray-700">
              Horizon: {horizon} minutes
            </label>
            <input
              type="range"
              id="horizon"
              min="0"
              max="300"
              step="30"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="slider rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        >
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Wind Actual Data</h2>
        <pre className="bg-gray-100 text-black p-4 rounded">
          {JSON.stringify(windActualData, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Wind Forecast Data</h2>
        <pre className="bg-gray-100 text-black p-4 rounded">
          {JSON.stringify(windForecastData, null, 2)}
        </pre>
      </div>
    </div>
  );
}