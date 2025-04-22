import React, { useState, useEffect } from 'react';

export default function Collection() {
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('collections');
    return saved ? JSON.parse(saved) : [];
  });

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newApiData, setNewApiData] = useState({});

  // Save collections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
  }, [collections]);

  const handleDeleteCollection = (id) => {
    const filtered = collections.filter(col => col.id !== id);
    setCollections(filtered);
  };

  
  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCollection = {
      id: Date.now(),
      name: newCollectionName.trim(),
      requests: []
    };
    setCollections([...collections, newCollection]);
    setNewCollectionName('');
  };

  const handleApiInputChange = (id, field, value) => {
    setNewApiData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleAddApiToCollection = (collectionId) => {
    const data = newApiData[collectionId];
    if (!data?.title || !data?.description) return;

    const updated = collections.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: [...col.requests, {
            id: Date.now(),
            title: data.title,
            description: data.description
          }]
        };
      }
      return col;
    });

    setCollections(updated);
    setNewApiData(prev => ({ ...prev, [collectionId]: { title: '', description: '' } }));
  };

  return (
    <div className=" max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Collections</h2>

      {/* Add Collection */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="New Collection Name"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 text-sm"
        />
        <button
          onClick={handleAddCollection}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md"
        >
          Add
        </button>
      </div>

      {/* List Collections */}
      {collections.length === 0 ? (
        <p className="text-sm text-gray-400 text-center">No collections found.</p>
      ) : (
        <div className="space-y-6">
          {collections.map((collection) => (
           <div
           key={collection.id}
           className="bg-gray-800 p-5 rounded-lg shadow-md relative"
         >
           {/* Delete Button */}
           <button
             onClick={() => handleDeleteCollection(collection.id)}
             className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm"
           >
             &#10006; {/* Cross icon */}
           </button>
         
           <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
           <p className="text-sm text-gray-400 mb-3">{collection.requests.length} request(s)</p>
         
           {/* Add API form */}
           <div className="space-y-2 mb-4">
             <input
               type="text"
               placeholder="API Title"
               value={newApiData[collection.id]?.title || ''}
               onChange={(e) => handleApiInputChange(collection.id, 'title', e.target.value)}
               className="w-full px-3 py-1 rounded bg-gray-700 text-white placeholder-gray-400 text-sm"
             />
             <input
               type="text"
               placeholder="API Description"
               value={newApiData[collection.id]?.description || ''}
               onChange={(e) => handleApiInputChange(collection.id, 'description', e.target.value)}
               className="w-full px-3 py-1 rounded bg-gray-700 text-white placeholder-gray-400 text-sm"
             />
             <button
               onClick={() => handleAddApiToCollection(collection.id)}
               className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded"
             >
               Add API
             </button>
           </div>
         
           {/* Display Requests */}
           {collection.requests.map((req) => (
             <div key={req.id} className="border border-gray-700 rounded p-3 mb-2">
               <p className="text-white font-medium text-sm">{req.title}</p>
               <p className="text-gray-400 text-sm">{req.description}</p>
             </div>
           ))}
         </div>
         
          ))}
        </div>
      )}
    </div>
  );
}