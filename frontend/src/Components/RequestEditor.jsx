import React, { useState } from 'react';

const RequestEditor = ({ onResponse }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('Query');
  const [queryParams, setQueryParams] = useState([{ key: '', value: '', enabled: true }]);
  const [bodyType, setBodyType] = useState("none");
  const [bodyContent, setBodyContent] = useState('{}');
  const [formData, setFormData] = useState([{ key: '', value: '', enabled: true }]);
  const [headers, setHeaders] = useState([{ key: '', value: '', enabled: true }]);
  const [testScript, setTestScript] = useState('// Example:\n// pm.test("Status is 200", () => pm.response.to.have.status(200));');
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
      const start = performance.now();
      const finalUrl = buildUrlWithQuery();

      const requestHeaders = Object.fromEntries(
        headers.filter(h => h.enabled && h.key.trim()).map(h => [h.key, h.value])
      );

      const options = {
        method,
        headers: requestHeaders,
      };

      if (method !== "GET" && method !== "DELETE" && bodyType !== "none") {
        if (bodyType === "json") {
          options.headers['Content-Type'] = 'application/json';
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
      }

      const res = await fetch(finalUrl, options);
      const timeTaken = Math.round(performance.now() - start);
      const data = await res.json();

      const allHeaders = {};
      res.headers.forEach((value, key) => {
        allHeaders[key] = value;
      });

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

      try {
        const fn = new Function('pm', testScript);
        fn(pm);
      } catch (e) {
        testResults.push({ description: 'Script error', passed: false, error: e.message });
      }

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

      {activeTab === "Body" && (
        <div className="px-2 py-4 space-y-2">
          <select value={bodyType} onChange={handleBodyTypeChange} className="bg-gray-800 text-sm px-2 py-1 rounded">
            <option value="none">None</option>
            <option value="json">JSON</option>
            <option value="form">Form Data</option>
          </select>

          {bodyType === "json" && (
            <>
              <textarea
                value={bodyContent}
                onChange={handleBodyContentChange}
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
