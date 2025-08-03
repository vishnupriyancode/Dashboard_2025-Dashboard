import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MetricCard = ({ title, value, change, unit = '', changeUnit = '%' }) => {
  const isPositive = parseFloat(change) > 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changeText = isPositive ? `+${change}` : change;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline justify-between mt-2">
        <p className="text-2xl font-semibold text-gray-900">
          {value}{unit}
        </p>
        <span className={`${changeColor} text-sm font-medium flex items-center`}>
          {changeText}{changeUnit}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  // Helper function to generate dates array
  const generateDateRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Helper function to format date as 'MMM DD'
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: '2-digit'
    }).format(date);
  };

  const generateChartData = (range) => {
    const today = new Date();
    let startDate;
    
    if (range === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // Last 7 days including today
    } else {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // Last 30 days including today
    }

    const dates = generateDateRange(startDate, today);
    
    // Generate sample data for each date
    return dates.map(date => ({
      date: formatDate(date),
      success: Math.floor(Math.random() * (15 - 8 + 1)) + 8, // Random between 8-15
      failed: Math.floor(Math.random() * 3) // Random between 0-2
    }));
  };

  const [apiData, setApiData] = useState({
    summary: {
      total: 156,
      success: 133,
      failed: 18,
      pending: 5,
      avgResponseTime: 240,
      changes: {
        total: 12,
        successRate: 3,
        responseTime: -18,
        failed: -4
      }
    },
    statusData: generateChartData('week') // Initialize with weekly data
  });

  useEffect(() => {
    // Update the fetchData function to use the date range
    const fetchData = async () => {
      try {
        // Format dates for API call
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = dateRange.to.toISOString().split('T')[0];
        
        // For demo purposes, generate sample data instead of API call
        const sampleData = {
          ...apiData,
          statusData: generateChartData(timeRange)
        };
        
        setApiData(sampleData);
        
        // Uncomment below for actual API integration
        /*
        const response = await fetch(`YOUR_API_ENDPOINT?from=${fromDate}&to=${toDate}`);
        const data = await response.json();
        setApiData(data);
        */
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dateRange, timeRange]);

  const pieChartData = {
    labels: ['Success', 'Failed', 'Pending'],
    datasets: [
      {
        data: [
          apiData.summary.success,
          apiData.summary.failed,
          apiData.summary.pending
        ],
        backgroundColor: [
          'rgb(128, 128, 128)',  // Medium gray for Success
          'rgb(192, 192, 192)',  // Light gray for Failed
          'rgb(230, 230, 230)'   // Very light gray for Pending
        ],
        borderWidth: 0
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14
          },
          generateLabels: (chart) => {
            const data = chart.data;
            const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
            return data.labels.map((label, index) => ({
              text: `${label} ${data.datasets[0].data[index]} (${((data.datasets[0].data[index] / total) * 100).toFixed(0)}%)`,
              fillStyle: data.datasets[0].backgroundColor[index],
              index
            }));
          }
        }
      },
      tooltip: {
        enabled: false
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    },
    layout: {
      padding: 20
    }
  };

  const barChartData = {
    labels: apiData.statusData.map(item => item.date),
    datasets: [
      {
        label: 'Success',
        data: apiData.statusData.map(item => item.success),
        backgroundColor: 'rgb(75, 75, 75)',
        borderRadius: 4,
        barThickness: timeRange === 'month' ? 8 : 20,
      },
      {
        label: 'Failed',
        data: apiData.statusData.map(item => item.failed),
        backgroundColor: 'rgb(192, 192, 192)',
        borderRadius: 4,
        barThickness: timeRange === 'month' ? 8 : 20,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: 'rgb(224, 224, 224)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgb(242, 242, 242)',
          drawBorder: false
        },
        ticks: {
          stepSize: 4
        }
      }
    }
  };

  const successRate = apiData.summary.total > 0
    ? ((apiData.summary.success / apiData.summary.total) * 100).toFixed(0)
    : 0;

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    const today = new Date();
    
    if (range === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      setDateRange({
        from: weekStart,
        to: today
      });
    } else {
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 29); // Set to 30 days ago
      setDateRange({
        from: monthStart,
        to: today
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Requests"
          value={apiData.summary.total}
          change={apiData.summary.changes.total}
        />
        <MetricCard
          title="Success Rate"
          value={successRate}
          unit="%"
          change={apiData.summary.changes.successRate}
        />
        <MetricCard
          title="Avg. Response Time"
          value={apiData.summary.avgResponseTime}
          unit="ms"
          change={apiData.summary.changes.responseTime}
          changeUnit="ms"
        />
        <MetricCard
          title="Failed Requests"
          value={apiData.summary.failed}
          change={apiData.summary.changes.failed}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Request Distribution</h3>
          <div className="relative h-[300px] max-w-[400px] mx-auto flex items-center justify-center">
            <div className="absolute inset-0">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="absolute text-center">
              <div className="text-2xl font-bold">{apiData.summary.total}</div>
              <div className="text-gray-500 text-sm">Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">API Status Overview</h3>
            <div className="flex gap-4">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    timeRange === 'week' ? 'bg-blue-500 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => handleTimeRangeChange('week')}
                >
                  Week
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    timeRange === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => handleTimeRangeChange('month')}
                >
                  Month
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1 cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <DatePicker
                    selected={dateRange.from}
                    onChange={date => setDateRange(prev => ({ ...prev, from: date }))}
                    dateFormat="MMM dd"
                    className="bg-transparent w-24 cursor-pointer"
                    placeholderText="From date"
                  />
                </div>
                <span>|</span>
                <div className="flex items-center gap-1 cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <DatePicker
                    selected={dateRange.to}
                    onChange={date => setDateRange(prev => ({ ...prev, to: date }))}
                    dateFormat="MMM dd"
                    className="bg-transparent w-24 cursor-pointer"
                    placeholderText="To date"
                    minDate={dateRange.from}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 