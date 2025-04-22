import React, { useState } from 'react';

const RequestEditor = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://www.thunderclient.com/welcome");
  const [activeTab, setActiveTab] = useState("Query");

  return (
    <div className="flex flex-col bg-gray-900 text-white w-full h-full p-4 space-y-4">
      {/* Request Bar */}
      <div className="flex space-x-2 items-center">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-gray-800 text-sm text-white px-2 py-1 rounded"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-white text-sm placeholder-gray-400"
        />
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm rounded">
          Send
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 text-sm border-b border-gray-700">
        {["Query", "Headers", "Auth", "Body", "Tests", "Pre Run"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
            {tab === "Headers" && <span className="ml-1 text-blue-400">0</span>}
          </button>
        ))}
      </div>

      {/* Query Parameters Table */}
      {activeTab === "Query" && (
        <div className="px-2 py-4">
          <h2 className="text-sm mb-4">Query Parameters</h2>
          <div className="grid grid-cols-12 gap-4 text-sm text-gray-300">
            <div className="col-span-1">
              <input type="checkbox" className="accent-blue-500" />
            </div>
            <div className="col-span-5">
              <input
                type="text"
                placeholder="parameter"
                className="w-full bg-gray-800 px-2 py-1 rounded placeholder-gray-500 text-white"
              />
            </div>
            <div className="col-span-6">
              <input
                type="text"
                placeholder="value"
                className="w-full bg-gray-800 px-2 py-1 rounded placeholder-gray-500 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestEditor;
