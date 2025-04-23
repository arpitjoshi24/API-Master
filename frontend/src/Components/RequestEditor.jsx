import { useState } from 'react';

const RequestEditor = ({ onResponse, onRequest }) => {
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
  const [authType, setAuthType] = useState('none');
  const [authData, setAuthData] = useState({ token: '', username: '', password: '' });

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
      onRequest?.();
  
      const start = performance.now();
      const constructedUrl = buildUrlWithQuery();

      const requestHeaders = Object.fromEntries(
        headers.filter(h => h.enabled && h.key.trim()).map(h => [h.key, h.value])
      );
  
      if (authType === 'bearer' && authData.token) {
        requestHeaders['Authorization'] = `Bearer ${authData.token}`;
      }
  
      if (authType === 'basic' && authData.username && authData.password) {
        const encoded = btoa(`${authData.username}:${authData.password}`);
        requestHeaders['Authorization'] = `Basic ${encoded}`;
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
            JSON.parse(bodyContent);
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
      }
  
      const res = await fetch(constructedUrl, options);
      const timeTaken = Math.round(performance.now() - start); 
  
      let data;
      try {
        data = await res.json(); 
      } catch {
        const text = await res.text(); 
        try {
          data = JSON.parse(text); 
        } catch {
          data = { raw: text };
        }
      }
  
      const allHeaders = {};
      res.headers.forEach((value, key) => { allHeaders[key] = value }); 

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
                  throw new Error(`Expected status ${expected}, but got ${res.status}`);
                }
              },
              jsonBody: (expectedBody) => {
                try {
                  const body = JSON.parse(res.body);
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
  
        
        res: res, 
      };
  
      try {
        
        const fn = new Function('pm', testScript);  
        fn(pm); 
      } catch (e) {
        testResults.push({ description: 'Script error', passed: false, error: e.message });
      }
  
      saveRequestToLocalStorage({
        title: `${method} ${constructedUrl}`,
        description: `Status: ${res.status} ${res.statusText}`,
        timestamp: new Date().toISOString(),
      });
  
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

    </div>
  );
};

export default RequestEditor;
