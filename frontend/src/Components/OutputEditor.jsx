import React from 'react';

const tabs = ['Response', 'Headers', 'Cookies', 'Results', 'Docs'];

export default function OutputEditor() {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      {/* Top status bar */}
      <div className="flex space-x-6 mb-4 text-sm">
        <div><span className="font-semibold">Status:</span> 200 OK</div>
        <div><span className="font-semibold">Size:</span> 1.2 KB</div>
        <div><span className="font-semibold">Time:</span> 128ms</div>
      </div>

      {/* Tab selector */}
      <div className="flex space-x-6 border-b border-gray-700 mb-4 text-sm">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`pb-2 cursor-pointer ${
              tab === 'Response' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-400'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Message Box */}
      <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-300">
        <div className="mb-4">
        </div>

      </div>
    </div>
  );
}

const Shortcut = ({ label, keys }) => (
  <div className="flex items-center justify-center space-x-4">
    <span className="w-40 text-right">{label}</span>
    <div className="flex space-x-2">
      {keys.map((key, idx) => (
        <span key={idx} className="bg-gray-700 text-xs px-2 py-1 rounded">{key}</span>
      ))}
    </div>
  </div>
);
