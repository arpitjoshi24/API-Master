import React, { useEffect, useState } from 'react';

export default function Activity() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('previousRequests')) || [];
    setRequests(saved);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Activity History</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-gray-400 text-center">No activity yet.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req, index) => (
            <div
              key={index}
              className="bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold text-white">{req.title}</h3>
              <p className="text-sm text-gray-300 mt-2">{req.description}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(req.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
