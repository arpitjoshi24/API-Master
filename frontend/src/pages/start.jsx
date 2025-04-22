import { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import RequestEditor from '../Components/RequestEditor';
import OutputEditor from '../Components/OutputEditor';

export default function StartPage() {
  // Initialize state for storing response data, headers, status, time, test results, and loading state
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState({});
  const [status, setStatus] = useState({});
  const [time, setTime] = useState(0);
  const [testResults, setTestResults] = useState([]); // Track test results
  const [loading, setLoading] = useState(false); // New loading state

  // Callback to handle response after the request is sent
  const handleResponse = ({ body, headers, status, time, testResults }) => {
    setResponse(body);
    setHeaders(headers);
    setStatus(status);
    setTime(time);
    setTestResults(testResults); // Update test results
    setLoading(false); // Set loading to false when response is received
  };

  // Callback to handle when a request is sent (before response)
  const handleRequest = () => {
    setLoading(true); // Set loading to true when the request is being made
  };

  return (
    <div className="flex flex-row h-screen w-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-[300px] bg-gray-800 p-4">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto border-r border-gray-800">
        <RequestEditor
          onResponse={handleResponse} // Handle response
          onRequest={handleRequest}    // Handle request start
        />
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-lg text-gray-300">
            Loading...
          </div>
        ) : (
          <OutputEditor
            response={response}
            headers={headers}
            status={status}
            time={time}
            testResults={testResults} // Pass test results to OutputEditor
          />
        )}
      </div>
    </div>
  );
}
