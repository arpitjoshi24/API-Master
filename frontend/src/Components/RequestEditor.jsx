import React, { useState } from 'react';

const RequestEditor = ({ onResponse }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
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

  // Function to handle JSON file import
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonContent = JSON.parse(reader.result);
          setBodyContent(JSON.stringify(jsonContent, null, 2)); // Format with indentation
        } catch (error) {
          alert('Error reading JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file');
    }
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

      runTests(data, finalUrl, res);

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

  const runTests = (response, finalUrl, res) => {
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
        {['Query', 'Headers', 'Auth', 'Body', 'Tests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

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
            <>
              <textarea
                value={bodyContent}
                onChange={handleBodyContentChange}
                placeholder="Enter JSON content"
                rows="6"
                className="w-full bg-gray-800 px-2 py-1 rounded"
              />
              <div className="mt-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="bg-blue-600 hover:bg-blue-700 text-sm text-white px-4 py-2 rounded"
                />
                <span className="ml-2 text-sm text-gray-400">Import JSON file</span>
              </div>
            </>
          )}
          {bodyType === "form" && (
            <div className="space-y-2">
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
    </div>
  );
};

export default RequestEditor;
