import React, { useState, useEffect } from 'react';
import Collection from './Collection';
import Activity from './Activity';
import Environment from './Environment';

export default function Sidebar({ onNewRequest }) {
  const [activeTab, setActiveTab] = useState("Activity");
  const [previousRequests, setPreviousRequests] = useState([]);
  const [collections, setCollections] = useState([]);

  // Sample data
  const sampleRequests = [
    { id: 1, title: "Request 1", description: "Description of Request 1" },
    { id: 2, title: "Request 2", description: "Description of Request 2" }
  ];

;

  const fetchPreviousRequests = () => {
    if (activeTab === 'Activity') {
      setPreviousRequests(sampleRequests);
    }
  };



  useEffect(() => {
    fetchPreviousRequests();
   
  }, [activeTab]);

  const handleReload = () => {
    setPreviousRequests([]);
    
    setActiveTab('');
    setTimeout(() => setActiveTab('Activity'), 0);
  };

  return (
    <div className="w-full bg-gray-900 text-white h-full  flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold tracking-wide">API-Master</span>
        <button className="text-gray-400 hover:text-white" onClick={handleReload}>
          &#x21bb;
        </button>
      </div>

      {/* New Request Button */}
      <div className="px-4 py-3 border-b border-gray-700">
      <button
        className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-full hover:bg-blue-700"
        onClick={onNewRequest}
      >
        New Request
      </button>

      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 space-x-6 border-b border-gray-700 text-gray-400 text-sm">
        {["Activity", "Collections", "Env"].map(tab => (
          <button
            key={tab}
            className={`hover:text-white ${activeTab === tab ? 'text-white border-b-2 border-blue-500 pb-1' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>


      {/* Content */}
      <div className="px-4  flex-1 overflow-y-auto">
        {activeTab === 'Activity' && (
          <div className="px-4 py-8">
           <Activity/>
        </div>
          
        )}

{activeTab === 'Collections' && (
  <div className="px-4 py-8">
    <Collection />
  </div>
)}


        {activeTab === 'Env' && (
          <div className="text-center text-sm text-gray-400 space-y-2">
         <Environment/>
          </div>
        )}
      </div>
    </div>
  );
}
