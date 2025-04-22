import React from 'react'

export default function Sidebar() {
  return (
  
      <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <span className="text-sm font-semibold tracking-wide">PostWomen</span>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white">&#x21bb;</button>
            <button className="text-gray-400 hover:text-white">⋯</button>
          </div>
        </div>
  
        {/* New Request Button */}
        <div className="px-4 py-3 border-b border-gray-700">
          <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-full hover:bg-blue-700">
            New Request
          </button>
        </div>
  
        {/* Tabs */}
        <div className="flex px-4 py-2 space-x-6 border-b border-gray-700 text-gray-400 text-sm">
          <button className="hover:text-white">Activity</button>
          <button className="hover:text-white">Collections</button>
          <button className="text-white border-b-2 border-blue-500 pb-1">Env</button>
        </div>
  
        {/* Filter Input */}
        <div className="px-4 py-2 border-b border-gray-700">
          <input
            type="text"
            placeholder="filter environment"
            className="w-full px-2 py-1 bg-gray-800 text-sm text-white placeholder-gray-500 rounded"
          />
        </div>
  
        {/* No Environments Text */}
        <div className="px-4 py-8 text-center text-sm text-gray-400 space-y-2">
          <p>No Environments Available...</p>
          <p>Save sensitive information here...</p>
        </div>
      </div>
  )
}
