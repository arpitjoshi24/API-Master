import React, { useState } from 'react';

const RequestEditor = ({ onResponse }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:5000/api/data');
  const [activeTab, setActiveTab] = useState('Query');
  const [queryParams, setQueryParams] = useState([{ key: '', value: '', enabled: true }]);
  const [bodyType, setBodyType] = useState("none"); // Body type selection (none, json, form)
  const [bodyContent, setBodyContent] = useState('{}'); // Body content (JSON, form data, etc.)
  const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
  const [testScript, setTestScript] = useState(`// Example:\n// tests.push(response.status === "success" ? "✅ Passed" : "❌ Failed");`);
  const [testResults, setTestResults] = useState(null);

  const handleQueryChange = (index, field, value) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '', enabled: true }]);
  };

  const buildUrlWithQuery = () => {
    const enabled = queryParams.filter(p => p.enabled && p.key.trim());
    const searchParams = new URLSearchParams();
    enabled.forEach(({ key, value }) => {
      searchParams.append(key, value);
    });
    return enabled.length ? `${url}?${searchParams.toString()}` : url;
  };

  const handleBodyTypeChange = (e) => {
    setBodyType(e.target.value);
    if (e.target.value === 'none') {
      setBodyContent('');
    } else if (e.target.value === 'json') {
      setBodyContent('{}');
    }
  };

  const handleBodyContentChange = (e) => {
    setBodyContent(e.target.value);
  };

  const saveRequestToLocalStorage = (requestInfo) => {
    const existingRequests = JSON.parse(localStorage.getItem('previousRequests')) || [];
    const updatedRequests = [requestInfo, ...existingRequests.slice(0, 49)]; // keep only latest 50
    localStorage.setItem('previousRequests', JSON.stringify(updatedRequests));
  };

  const handleSendRequest = async () => {
    try {
      const start = performance.now();
      const finalUrl = buildUrlWithQuery();

      // Include headers dynamically
      const requestHeaders = Object.fromEntries(
        headers.filter(h => h.enabled && h.key.trim()).map(h => [h.key, h.value])
      );

      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method !== "GET" && method !== "DELETE" && bodyType !== "none") {
        options.body = bodyType === "json" ? bodyContent : new URLSearchParams(bodyContent);
      }

      const res = await fetch(finalUrl, options);
      const timeTaken = Math.round(performance.now() - start);
      const data = await res.json();

      const allHeaders = {};
      res.headers.forEach((value, key) => {
        allHeaders[key] = value;
      });

      runTests(data);

      // Store test results
      const testResults = [];
      const pm = {
        test: (description, fn) => {
          try {
            fn();
            testResults.push({ description, passed: true });
          } catch (e) {
            testResults.push({ description, passed: false, error: e.message });
          }
        },
        response: {
          to: {
            have: {
              status: (expected) => {
                if (res.status !== expected) {
                  throw new Error(`Expected ${expected}, got ${res.status}`);
                }
              },
            },
          },
        },
      };

      // Evaluate test script from the Tests Tab
      try {
        const fn = new Function('pm', testScript);
        fn(pm);
      } catch (e) {
        testResults.push({ description: 'Script error', passed: false, error: e.message });
      }

      // Send results to OutputEditor
      onResponse?.({
        body: data,
        headers: allHeaders,
        status: { code: res.status, text: res.statusText },
        time: timeTaken,
        testResults,
      });
    } catch (err) {
      onResponse?.({
        body: { error: err.message },
        headers: {},
        status: { code: 0, text: 'Network Error' },
        time: 0,
        testResults: [],
      });
    }
  };

  const runTests = (response) => {
    const tests = [];
    try {
      const sandbox = { response, tests };
      const testFunction = new Function("response", "tests", testScript);
      testFunction(sandbox.response, sandbox.tests);
      setTestResults(tests.length > 0 ? tests : ["⚠️ No tests were executed."]);

      saveRequestToLocalStorage({
        title: `${method} ${finalUrl}`,
        description: `Status: ${res.status} ${res.statusText}`,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      setTestResults([`❌ Error while running tests: ${err.message}`]);
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white w-full h-full p-4 space-y-4">
      {/* Request Input */}
      <div className="flex space-x-2 items-center">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="bg-gray-800 text-sm px-2 py-1 rounded"
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
          className="flex-1 px-3 py-2 rounded bg-gray-800 text-sm"
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
        {['Query', 'Headers', 'Auth', 'Body', 'Tests', 'Pre Run'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Query Tab */}
      {activeTab === 'Query' && (
        <div className="px-2 py-4 space-y-2">
          {queryParams.map((param, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(e) => handleQueryChange(index, 'enabled', e.target.checked)}
                  className="accent-blue-500"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleQueryChange(index, 'key', e.target.value)}
                  placeholder="parameter"
                  className="w-full bg-gray-800 px-2 py-1 rounded"
                />
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleQueryChange(index, 'value', e.target.value)}
                  placeholder="value"
                  className="w-full bg-gray-800 px-2 py-1 rounded"
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

      {/* Headers Tab */}
      {activeTab === "Headers" && (
        <div className="px-2 py-4 space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => {
                    const updated = [...headers];
                    updated[index].enabled = e.target.checked;
                    setHeaders(updated);
                  }}
                  className="accent-blue-500"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => {
                    const updated = [...headers];
                    updated[index].key = e.target.value;
                    setHeaders(updated);
                  }}
                  placeholder="Header Name"
                  className="w-full bg-gray-800 px-2 py-1 rounded"
                />
              </div>
              <div className="col-span-6">
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => {
                    const updated = [...headers];
                    updated[index].value = e.target.value;
                    setHeaders(updated);
                  }}
                  placeholder="Header Value"
                  className="w-full bg-gray-800 px-2 py-1 rounded"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setHeaders([...headers, { key: '', value: '', enabled: true }])}
            className="mt-2 text-sm text-blue-400 hover:underline"
          >
            + Add Header
          </button>
        </div>
      )}

      {/* Body Tab */}
      {activeTab === "Body" && (
        <div className="px-2 py-4 space-y-2">
          <div className="flex items-center">
            <select
              value={bodyType}
              onChange={handleBodyTypeChange}
              className="bg-gray-800 text-sm px-2 py-1 rounded"
            >
              <option value="none">None</option>
              <option value="json">JSON</option>
              <option value="form">Form Data</option>
            </select>
          </div>
          {bodyType === "json" && (
            <textarea
              value={bodyContent}
              onChange={handleBodyContentChange}
              placeholder="Enter JSON content"
              rows="6"
              className="w-full bg-gray-800 px-2 py-1 rounded"
            />
          )}
          {bodyType === "form" && (
            <div className="space-y-2">
              {/* Form Data inputs can be added here */}
              <input
                type="text"
                value={bodyContent}
                onChange={handleBodyContentChange}
                placeholder="Form Data"
                className="w-full bg-gray-800 px-2 py-1 rounded"
              />
            </div>
          )}
        </div>
      )}

      {/* Tests Tab */}
      {activeTab === 'Tests' && (
        <div className="px-2 py-4 space-y-2">
          <label className="block text-sm text-gray-300 mb-1">Write your test scripts here:</label>
          <textarea
            value={testScript}
            onChange={(e) => setTestScript(e.target.value)}
            placeholder={`e.g. pm.test("Status code is 200", function () {\n  pm.response.to.have.status(200);\n});`}
            className="w-full min-h-[200px] bg-gray-800 text-white p-2 rounded resize-none"
          />

          <div className="text-xs text-gray-400 mt-1">
            Scripts run after response is received. Use pseudo-Postman syntax.
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestEditor;
