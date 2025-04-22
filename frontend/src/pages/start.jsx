import { useState } from 'react';
import Split from 'react-split';
import Sidebar from '../Components/Sidebar';
import RequestEditor from '../Components/RequestEditor';
import OutputEditor from '../Components/OutputEditor';

export default function StartPage() {
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState({});
  const [status, setStatus] = useState({});
  const [time, setTime] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestEditorKey, setRequestEditorKey] = useState(0);
  const [outputEditorKey, setOutputEditorKey] = useState(0);

  const handleRequest = () => setLoading(true);

  const handleResponse = ({ body, headers, status, time, testResults }) => {
    setResponse(body);
    setHeaders(headers);
    setStatus(status);
    setTime(time);
    setTestResults(testResults);
    setLoading(false);
    setOutputEditorKey(prev => prev + 1);
  };

  const handleNewRequest = () => {
    setRequestEditorKey(prev => prev + 1);
    setResponse(null);
    setHeaders({});
    setStatus({});
    setTime(0);
    setTestResults([]);
    setOutputEditorKey(prev => prev + 1);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
      {/* Split into 3 resizable columns: Sidebar | Request | Output */}
      <Split
        className="flex h-full"
        sizes={[20, 40, 40]}
        minSize={[200, 300, 300]}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={0}
        dragInterval={1}
      >
        {/* Sidebar */}
        <div className="bg-gray-800 overflow-auto">
          <Sidebar onNewRequest={handleNewRequest} />
        </div>

        {/* Request Editor */}
        <div className="overflow-auto border-r border-gray-800">
          <RequestEditor
            key={requestEditorKey}
            onResponse={handleResponse}
            onRequest={handleRequest}
          />
        </div>

        {/* Output Editor */}
        <div className="overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full text-lg text-gray-300">
              Loading...
            </div>
          ) : (
            <OutputEditor
              key={outputEditorKey}
              response={response}
              headers={headers}
              status={status}
              time={time}
              testResults={testResults}
            />
          )}
        </div>
      </Split>
    </div>
  );
}
