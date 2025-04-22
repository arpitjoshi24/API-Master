import React, { useState } from 'react';

const RequestEditor = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("http://localhost:5000/api/data");
  const [activeTab, setActiveTab] = useState("Query");
  const [queryParams, setQueryParams] = useState([{ key: '', value: '', enabled: true }]);
  const [bodyContent, setBodyContent] = useState('{}');
  const [response, setResponse] = useState(null);

  const handleQueryChange = (index, field, value) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '', enabled: true }]);
  };

  const buildUrlWithQuery = () => {
    const enabledParams = queryParams.filter(p => p.enabled && p.key.trim());
    if (enabledParams.length === 0) return url;

    const searchParams = new URLSearchParams();
    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value);
    });

    return `${url}?${searchParams.toString()}`;
  };

  const saveRequestToLocalStorage = (requestInfo) => {
    const existingRequests = JSON.parse(localStorage.getItem('previousRequests')) || [];
    const updatedRequests = [requestInfo, ...existingRequests.slice(0, 49)]; // keep only latest 50
    localStorage.setItem('previousRequests', JSON.stringify(updatedRequests));
  };

  const handleSendRequest = async () => {
    try {
      const finalUrl = buildUrlWithQuery();
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && method !== "DELETE") {
        options.body = bodyContent;
      }

      const res = await fetch(finalUrl, options);
      const data = await res.json();
      setResponse(data);

      saveRequestToLocalStorage({
        title: `${method} ${finalUrl}`,
        description: `Status: ${res.status} ${res.statusText}`,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      setResponse({ error: err.message });

      saveRequestToLocalStorage({
        title: `${method} ${url}`,
        description: `Failed: ${err.message}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white w-full h-full p-4 space-y-4">
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
          placeholder="Enter URL"
        />
        <button
          onClick={handleSendRequest}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm rounded"
        >
          Send
        </button>
      </div>

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

      {activeTab === "Query" && (
        <div className="px-2 py-4 space-y-2">
          <h2 className="text-sm mb-2">Query Parameters</h2>
          {queryParams.map((param, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 text-sm text-gray-300 items-center">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(e) => handleQueryChange(index, "enabled", e.target.checked)}
                  className="accent-blue-500"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleQueryChange(index, "key", e.target.value)}
                  placeholder="parameter"
                  className="w-full bg-gray-800 px-2 py-1 rounded placeholder-gray-500 text-white"
                />
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleQueryChange(index, "value", e.target.value)}
                  placeholder="value"
                  className="w-full bg-gray-800 px-2 py-1 rounded placeholder-gray-500 text-white"
                />
              </div>
            </div>
          ))}
          <button
            onClick={handleAddQueryParam}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            + Add Parameter
          </button> 
        </div>
      )}

      {activeTab === "Body" && (
        <div className="px-2 py-4">
          <h2 className="text-sm mb-2">Raw JSON Body</h2>
          <textarea
            rows={8}
            value={bodyContent}
            onChange={(e) => setBodyContent(e.target.value)}
            className="w-full bg-gray-800 text-white p-2 rounded text-sm font-mono"
            placeholder='{"name": "example"}'
          />
        </div>
      )}

      {response && (
        <div className="bg-gray-800 p-4 rounded text-sm overflow-auto">
          <h3 className="text-white mb-2">Response</h3>
          <pre className="text-green-300 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RequestEditor;
