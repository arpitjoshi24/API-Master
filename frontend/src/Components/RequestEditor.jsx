import React, { useState } from 'react';

const RequestEditor = ({ onResponse, onRequest }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('Query');
  const [queryParams, setQueryParams] = useState([{ key: '', value: '', enabled: true }]);
  const [bodyType, setBodyType] = useState("none");
  const [bodyContent, setBodyContent] = useState('{}');
  const [formData, setFormData] = useState([{ key: '', value: '', enabled: true }]);;
  const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
  const [testScript, setTestScript] = useState('// Example:\n// pm.test("Status is 200", () => pm.response.to.have.status(200));');
  const [authType, setAuthType] = useState('none');
  const [authData, setAuthData] = useState({ token: '', username: '', password: '' });

  const handleQueryChange = (index, field, value) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  }

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
    if (e.target.value === 'none') setBodyContent('');
    else if (e.target.value === 'json') setBodyContent('{}');
  };

  const handleBodyContentChange = (e) => setBodyContent(e.target.value);

  const handleFormDataChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleAddFormField = () => {
    setFormData([...formData, { key: '', value: '', enabled: true }]);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonContent = JSON.parse(reader.result);
          setBodyContent(JSON.stringify(jsonContent, null, 2));
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
    const updatedRequests = [requestInfo, ...existingRequests.slice(0, 49)];
    localStorage.setItem('previousRequests', JSON.stringify(updatedRequests));
  };

  const handleSendRequest = async () => {
    try {
      onRequest?.(); // Notify that request is starting
  
      const start = performance.now();
      const constructedUrl = buildUrlWithQuery();

      const requestHeaders = Object.fromEntries(
        headers.filter(h => h.enabled && h.key.trim()).map(h => [h.key, h.value])
      );
  
      if (authType === 'bearer' && authData.token) {
        requestHeaders['Authorization'] = Bearer `${authData.token}`;
      }
  
      if (authType === 'basic' && authData.username && authData.password) {
        const encoded = btoa(`${authData.username}:${authData.password}`);
        requestHeaders['Authorization'] = Basic `${encoded}`;
      }
  
      if (!Object.keys(requestHeaders).some(h => h.toLowerCase() === 'content-type')) {
        requestHeaders['Content-Type'] = 'application/json';
      }
  
      const options = {
        method,
        headers: requestHeaders,
      };
  
      if (method !== "GET" && method !== "DELETE" && bodyType !== "none") {
        if (bodyType === "json") {
          try {
            JSON.parse(bodyContent); // ✅ Validate JSON before sending
          } catch {
            throw new Error("Invalid JSON in request body");
          }
          options.body = bodyContent;
        } else if (bodyType === "form") {
          const form = new URLSearchParams();
          formData.forEach(f => {
            if (f.enabled && f.key.trim()) {
              form.append(f.key, f.value);
            }
          });
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          options.body = form;
        }
        else {
          options.body = new URLSearchParams(bodyContent);
          options.headers['Content-Type'] = 'application/json';
          options.body = bodyContent;
        }
      }
  
      const res = await fetch(constructedUrl, options);  // Send the request
const timeTaken = Math.round(performance.now() - start);  // Measure request time

let data;
try {
  data = await res.json();  // Try parsing the response body as JSON
} catch {
  const text = await res.text();  // If it's not JSON, fallback to text
  try {
    data = JSON.parse(text);  // Try parsing text as JSON
  } catch {
    data = { raw: text };  // Fallback to storing raw text if all parsing fails
  }
}

const allHeaders = {};
res.headers.forEach((value, key) => { allHeaders[key] = value });  // Capture all headers

// Test runner block
const testResults = [];
const pm = {
  test: (description, fn) => {
    try {
      fn();  // Execute the test function
      testResults.push({ description, passed: true });  // If no error, test passes
    } catch (e) {
      testResults.push({ description, passed: false, error: e.message });  // If error, test fails
    }
  },

  response: {
    to: {
      have: {
        status: (expected) => {
          if (res.status !== expected) {
            throw new Error(`Expected status ${expected}, but got ${res.status}`);
          }
        },
        jsonBody: (expectedBody) => {
          try {
            const body = JSON.parse(res.body);  // Parse the response body
            Object.keys(expectedBody).forEach((key) => {
              if (body[key] !== expectedBody[key]) {
                throw new Error(`Expected body['${key}'] to be '${expectedBody[key]}', got '${body[key]}'`);
              }
            });
          } catch (e) {
            throw new Error('Failed to parse response body or mismatched body structure.');
          }
        },
      },
    },
  },

  // Assign the response (res) to the pm object for it to be accessible in the tests
  res: res,  // Make res available globally within pm object
};

try {
  // Running the custom test script (this is user-provided)
  const fn = new Function('pm', testScript);  // Create a function from the provided test script
  fn(pm);  // Execute the test script
} catch (e) {
  // If there's an error in the test script itself
  testResults.push({ description: 'Script error', passed: false, error: e.message });
}

// Save request to local storage (for historical tracking)
saveRequestToLocalStorage({
  title: `${method} ${constructedUrl}`,
  description: `Status: ${res.status} ${res.statusText}`,
  timestamp: new Date().toISOString(),
});

// Return the response data and test results
onResponse?.({
  body: data,
  headers: allHeaders,
  status: { code: res.status, text: res.statusText },
  time: timeTaken,
  testResults,
});

} catch (err) {
  // In case of any network or other errors
  onResponse?.({
    body: { error: err.message },
    headers: {},
    status: { code: 0, text: 'Network Error' },
    time: 0,
    testResults: [],
  });
}
  };
      
  return (
    <div className="flex flex-col bg-gray-900 text-white w-full h-full p-4 space-y-4">
      <div className="flex space-x-2 items-center">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-gray-800 text-sm px-2 py-1 rounded">
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
        <button onClick={handleSendRequest} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm rounded">Send</button>
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

      {/* Auth Tab */}
      {activeTab === 'Auth' && (
        <div className="px-2 py-4 space-y-2">
          <label className="text-sm">Authentication Type</label>
          <select
            value={authType}
            onChange={(e) => setAuthType(e.target.value)}
            className="w-full bg-gray-800 text-sm px-2 py-1 rounded mt-2"
          >
            <option value="none">None</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
          </select>

          {authType === 'bearer' && (
            <div className="mt-4">
              <label className="text-sm">Bearer Token</label>
              <input
                type="text"
                value={authData.token}
                onChange={(e) => setAuthData({ ...authData, token: e.target.value })}
                className="w-full bg-gray-800 text-sm px-2 py-1 rounded mt-2"
                placeholder="Enter Bearer Token"
              />
            </div>
          )}
          {authType === 'basic' && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
                className="w-full bg-gray-800 text-sm px-2 py-1 rounded"
                placeholder="Enter Username"
              />
              <input
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="w-full bg-gray-800 text-sm px-2 py-1 rounded"
                placeholder="Enter Password"
              />
            </div>
          )}
        </div>
      )}

      {/* Body Tab */}
      {activeTab === "Body" && (
  <div className="px-2 py-4 space-y-2">
    <select
      value={bodyType}
      onChange={handleBodyTypeChange}
      className="bg-gray-800 text-sm px-2 py-1 rounded"
    >
      <option value="none">None</option>
      <option value="json">JSON</option>
      <option value="form">Form Data</option>
    </select>

    {bodyType === "json" && (
      <>
        <textarea
          value={bodyContent}
          onChange={handleBodyContentChange}
          placeholder="Enter JSON content"
          rows="6"
          className="w-full bg-gray-800 px-2 py-1 rounded"
        />
        <input
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm text-white px-4 py-2 rounded"
        />
      </>
    )}

    {bodyType === "form" && (
      <div className="space-y-2">
        {formData.map((param, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={(e) => handleFormDataChange(index, 'enabled', e.target.checked)}
              className="accent-blue-500"
            />
            <input
              type="text"
              placeholder="Key"
              value={param.key}
              onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-800 rounded"
            />
            <input
              type="text"
              placeholder="Value"
              value={param.value}
              onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-800 rounded"
            />
          </div>
        ))}
        <button
          onClick={handleAddFormField}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded"
        >
          + Add Form Field
        </button>
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
            Scripts run after response is received. Use pseudo-PostWomen syntax.
          </div>
          {bodyType === "form" && (
            <div className="space-y-2">
              {formData.map((param, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => handleFormDataChange(index, 'enabled', e.target.checked)}
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  />
                </div>
              ))}
              <button
                onClick={handleAddFormField}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded"
              >
                + Add Form Field
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    );
};

export default RequestEditor;