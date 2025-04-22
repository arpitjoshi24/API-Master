import React, { useState, useEffect, useCallback } from 'react';

const tabs = ['Response', 'Headers', 'Cookies', 'Results'];

export default function OutputEditor({
  response = {},
  headers = {},
  status = {},
  time = 0,
  testResults = [],
  cookies = ''
}) {
  const [activeTab, setActiveTab] = useState('Response');
  const [formattedSize, setFormattedSize] = useState('0.00');
  const [maxLength, setMaxLength] = useState(500); // Default truncation length
  const [isTruncated, setIsTruncated] = useState(true); // State to toggle truncation

  useEffect(() => {
    const size = response && typeof response === 'object' ? JSON.stringify(response)?.length : 0;
    setFormattedSize((size / 1024).toFixed(2));
  }, [response]);

  const handleTabClick = useCallback((tab) => setActiveTab(tab), []);

  const toggleTruncation = () => {
    setIsTruncated(!isTruncated); // Toggle the truncation state
  };

  const truncateResponse = (response) => {
    const responseStr = JSON.stringify(response, null, 2);
    return isTruncated && responseStr.length > maxLength
      ? responseStr.slice(0, maxLength) + '...'
      : responseStr;
  };

  const parseCookies = (cookieStr) => {
    const cookies = cookieStr.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=').map((item) => item.trim());
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    return cookies;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Response':
        return (
          <div>
            <pre className="text-green-300 whitespace-pre-wrap">
              {truncateResponse(response) || 'No response received.'}
            </pre>
          </div>
        );

      case 'Headers':
        return (
          <pre className="text-yellow-300 whitespace-pre-wrap">
            {Object.keys(headers).length > 0
              ? JSON.stringify(headers, null, 2)
              : 'No headers available.'}
          </pre>
        );

      case 'Cookies': {
        const parsedCookies = parseCookies(cookies);
        return (
          <pre className="text-blue-300 whitespace-pre-wrap">
            {Object.keys(parsedCookies).length > 0
              ? JSON.stringify(parsedCookies, null, 2)
              : 'No cookies available.'}
          </pre>
        );
      }

      case 'Results':
        return Array.isArray(testResults) && testResults.length > 0 ? (
          <ul className="space-y-1">
            {testResults.map((test, index) => (
              <li key={index} className={`text-sm ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                ✔ {test.description}
                {!test.passed && test.error && (
                  <div className="ml-4 text-red-300 text-xs">Error: {test.error}</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No test results.</p>
        );

      default:
        return null;
    }
  };

  // Function to get the status color based on the status code
  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-400'; // Success
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-400'; // Redirection
    if (statusCode >= 400 && statusCode < 500) return 'text-red-400'; // Client error
    if (statusCode >= 500 && statusCode < 600) return 'text-red-600'; // Server error
    return 'text-gray-400'; // Default color
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      {/* Status Bar */}
      <div className="flex space-x-6 mb-4 text-sm">
        <div>
          <span className="font-semibold">Status:</span>{' '}
          <span className={getStatusColor(status?.code)}>
            {status?.code ? `${status.code} ${status?.text || ''}` : '—'}
          </span>
        </div>
        <div>
          <span className="font-semibold">Size:</span> {formattedSize} KB
        </div>
        <div>
          <span className="font-semibold">Time:</span> {time || '—'} ms
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-700 mb-4 text-sm">
        {tabs.map((tab) => (
          <div
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-2 cursor-pointer ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Toggle Button for Truncation/Formatted */}
      {activeTab === 'Response' && (
        <button
          onClick={toggleTruncation}
          className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          {isTruncated ? 'Truncated' : 'Formatted'}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded text-sm relative">
        {renderContent()}
      </div>
    </div>
  );
}