import { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import RequestEditor from '../Components/RequestEditor';
import OutputEditor from '../Components/OutputEditor';

export default function StartPage() {
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState({});
  const [status, setStatus] = useState({});
  const [time, setTime] = useState(0);

  return (
    <div className="flex flex-row h-screen w-screen bg-gray-900 text-white">
      <div className="w-[300px] bg-gray-800">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto border-r border-gray-800">
        <RequestEditor
          onResponse={({ body, headers, status, time }) => {
            setResponse(body);
            setHeaders(headers);
            setStatus(status);
            setTime(time);
          }}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <OutputEditor
          response={response}
          headers={headers}
          status={status}
          time={time}
        />
      </div>
    </div>
  );
}
