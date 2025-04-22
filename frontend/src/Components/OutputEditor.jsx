import React, { useState, useEffect } from 'react';

const tabs = ['Response', 'Headers', 'Cookies', 'Results', 'Docs'];

export default function OutputEditor({ response = {}, headers = {}, status = {}, time = 0 }) {
  const [activeTab, setActiveTab] = useState('Response');
  const [formattedSize, setFormattedSize] = useState('0.00');

  useEffect(() => {
    const size = JSON.stringify(response)?.length || 0;
    setFormattedSize((size / 1024).toFixed(2));
  }, [response]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Response':
        return (
          <pre className="text-green-300 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2) || 'No response received.'}
          </pre>
        );

      case 'Headers':
        return (
          <pre className="text-yellow-300 whitespace-pre-wrap">
            {Object.keys(headers).length > 0
              ? JSON.stringify(headers, null, 2)
              : 'No headers available.'}
          </pre>
        );

      case 'Cookies':
        return <p className="text-gray-400">Cookie parsing not implemented yet.</p>;

      case 'Results':
        return <p className="text-gray-400">You can add assertions or test results here later.</p>;

      case 'Docs':
        return <p className="text-gray-400">Documentation preview coming soon...</p>;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      {/* Status Bar */}
      <div className="flex space-x-6 mb-4 text-sm">
        <div>
          <span className="font-semibold">Status:</span>{' '}
          {status.code ? `${status.code} ${status.text || ''}` : '—'}
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
            onClick={() => setActiveTab(tab)}
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

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded text-sm">
        {renderContent()}
      </div>
    </div>
  );
}
