import React, { useState } from 'react';
import sampleData from '../data/sampleData.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast styles
const toastStyles = {
  success: {
    style: {
      background: '#f8fafc',
      borderLeft: '4px solid #3b82f6',
      borderRadius: '2px 16px 16px 2px',
      color: '#1e40af',
      padding: '12px 16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '360px',
      marginBottom: '10px',
      cursor: 'pointer'
    }
  },
  error: {
    style: {
      background: '#fef2f2',
      borderLeft: '4px solid #ef4444',
      borderRadius: '2px 16px 16px 2px',
      color: '#b91c1c',
      padding: '12px 16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '360px',
      marginBottom: '10px',
      cursor: 'pointer'
    }
  },
  processing: {
    style: {
      background: '#f8fafc',
      borderLeft: '4px solid #3b82f6',
      borderRadius: '2px 16px 16px 2px',
      color: '#1e40af',
      padding: '12px 16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '360px',
      marginBottom: '10px'
    }
  }
};

const RequestPage = () => {
  const [keyValue, setKeyValue] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('development');

  const environments = [
    { id: 'development', name: 'Development', baseUrl: 'https://dev-api.example.com' },
    { id: 'staging', name: 'Staging', baseUrl: 'https://staging-api.example.com' },
    { id: 'uat', name: 'UAT', baseUrl: 'https://uat-api.example.com' },
    { id: 'production', name: 'Production', baseUrl: 'https://api.example.com' }
  ];

  const showNotification = (type, method, requestId = '') => {
    const options = {
      position: "bottom-right",  // All notifications in bottom-right
      autoClose: type === 'processing' ? false : 3000,
      hideProgressBar: true,
      closeOnClick: type !== 'processing',
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      onClick: type !== 'processing' ? () => toast.dismiss() : undefined,
      ...toastStyles[type]
    };

    const content = (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {type === 'success' && (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {type === 'error' && (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          {type === 'processing' && (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          {type === 'processing' ? (
            <div>
              <p className="text-base font-semibold text-blue-700">
                {method} request processing
              </p>
              <p className="text-sm mt-0.5 text-blue-600 opacity-80">
                Request will be saved in API logs
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-blue-700">
                {method} request {type === 'success' ? 'completed' : 'failed'}
              </p>
              {requestId && (
                <p className="text-sm mt-0.5 text-blue-600 opacity-80">
                  ID: {requestId}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );

    return toast(content, options);
  };

  const logApiRequest = (method, key, status, endpoint) => {
    // Generate a model name based on the key
    const models = [
      'GPT-4',
      'GPT-3.5-Turbo',
      'DALL-E-3',
      'Claude-2',
      'Stable-Diffusion-XL',
      'Llama-2-70B',
      'PaLM-2',
      'Gemini-Pro'
    ];
    
    // Use the last two digits of the key to select a model
    const lastTwoDigits = key.slice(-2);
    const modelIndex = Math.abs(parseInt(lastTwoDigits)) % models.length;
    const selectedModel = models[modelIndex] || models[0]; // Fallback to first model if calculation fails

    const log = {
      id: Date.now(),
      domain_id: `dom_${Date.now()}`,
      model: selectedModel,
      method: method,
      status: status,
      endpoint: endpoint,
      time: new Date().toISOString(),
      value: key,
      request_id: `req_${key}_${Date.now()}`
    };

    // Save to localStorage for immediate display
    const existingLogs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
    existingLogs.unshift(log); // Add new log at the beginning
    localStorage.setItem('apiLogs', JSON.stringify(existingLogs));
    
    // Also save to backend API
    fetch('http://localhost:5001/api/save-api-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    })
    .then(response => response.json())
    .then(data => {
      console.log('API log saved to backend:', data);
      // Force a refresh of the logs display
      window.dispatchEvent(new Event('storage'));
    })
    .catch(error => {
      console.error('Error saving API log to backend:', error);
      // Still dispatch the event to update UI with localStorage data
      window.dispatchEvent(new Event('storage'));
    });

    // Updated notification calls
    const requestId = `req_${key}_${Date.now()}`;
    showNotification(status === 'success' ? 'success' : 'error', method, requestId);
  };

  const handleKeyChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
    setKeyValue(value);
  };

  const handleValidateSubmit = async (method, key) => {
    setKeyValue(key); // We'll keep this for UI state
    // Instead of calling handleSubmit, we'll implement the logic directly here
    setLoading(true);
    setError(null);
    setResponse(null);

    // Show processing notification in top-left
    const processingToast = showNotification('processing', method);

    try {
      if (key.length !== 13) {
        toast.dismiss(processingToast);
        throw new Error('Key must be exactly 13 digits');
      }

      console.log('Environment:', selectedEnv);
      console.log('Searching for key:', key);
      console.log('Available keys:', Object.keys(sampleData));
      console.log('Found data:', sampleData[key]);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (method === 'GET') {
        if (sampleData[key]) {
          console.log('GET Response:', sampleData[key]);
          setResponse({
            environment: selectedEnv,
            baseUrl: environments.find(env => env.id === selectedEnv).baseUrl,
            data: sampleData[key]
          });
          logApiRequest('GET', key, 'success', '/api/validate');
        } else {
          logApiRequest('GET', key, 'error', '/api/validate');
          throw new Error('Key not found');
        }
      } else if (method === 'POST') {
        if (sampleData[key]) {
          const responseData = { 
            environment: selectedEnv,
            baseUrl: environments.find(env => env.id === selectedEnv).baseUrl,
            message: 'Data updated successfully', 
            data: sampleData[key],
            timestamp: new Date().toISOString()
          };
          console.log('POST Response:', responseData);
          setResponse(responseData);
          logApiRequest('POST', key, 'success', '/api/validate');
        } else {
          logApiRequest('POST', key, 'error', '/api/validate');
          throw new Error('Invalid key');
        }
      }

      // Dismiss processing notification on success
      toast.dismiss(processingToast);

    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
      // Dismiss processing notification before showing error
      toast.dismiss(processingToast);
      showNotification('error', method);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
        <select
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="bg-white shadow rounded-lg p-6 w-full">
            <form className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-700"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Validate Request</h2>
              
              <div className="mb-6">
                <label htmlFor="key" className="block text-sm font-semibold text-gray-700 mb-2">
                  13-Digit Key
                </label>
                <input
                  type="text"
                  id="key"
                  value={keyValue}
                  onChange={handleKeyChange}
                  placeholder="Enter 13-digit key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={13}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleValidateSubmit('GET', keyValue)}
                  disabled={keyValue.length !== 13 || loading}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-0.5 transition-transform"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'GET'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleValidateSubmit('POST', keyValue)}
                  disabled={keyValue.length !== 13 || loading}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-0.5 transition-transform"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'POST'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:w-1/2">
          {response && (
            <div className="bg-white shadow rounded-lg p-6 h-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[500px]">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {error && !response && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 h-full">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!response && !error && (
            <div className="bg-white shadow rounded-lg p-6 h-full flex items-center justify-center text-gray-500">
              Make a request to see the response
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default RequestPage; 