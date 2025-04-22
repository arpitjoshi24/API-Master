import Sidebar from '../Components/Sidebar';
import RequestEditor from '../Components/RequestEditor';
import OutputEditor from '../Components/OutputEditor'
export default function App() {
  return (
    <div className="flex flex-row h-screen w-screen bg-gray-900 text-white">
      
      <div className="w-[300px] bg-gray-800">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <RequestEditor />
      </div>
      <div className="flex-1 overflow-auto">
        <OutputEditor />
      </div>
    </div>
  );
}
