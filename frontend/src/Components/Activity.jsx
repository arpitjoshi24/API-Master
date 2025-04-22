import React, { useEffect, useState } from 'react';

export default function Activity() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('previousRequests')) || [];
    setRequests(saved);
  }, []);

  const deleteRequest = (indexToRemove) => {
    const updated = requests.filter((_, index) => index !== indexToRemove);
    setRequests(updated);
    localStorage.setItem('previousRequests', JSON.stringify(updated));
  };

  return (
    <div className="px-2 overflow-y-hidden">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Activity History</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-gray-400 text-center">No activity yet.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req, index) => (
            <div
              key={index}
              className="bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 relative"
            >
              <h3 className="text-lg font-semibold text-white">{req.title}</h3>
              <p className="text-sm text-gray-300 mt-2">{req.description}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(req.timestamp).toLocaleString()}</p>
              <button
                onClick={() => deleteRequest(index)}
                className="absolute top-2 right-2 text-sm text-red-500 hover:text-red-300"
                title="Delete this request"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
