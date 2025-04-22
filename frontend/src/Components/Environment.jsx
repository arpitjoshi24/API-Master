import React, { useState, useEffect } from 'react';

export default function Environment() {
  const [environments, setEnvironments] = useState(() => {
    const saved = localStorage.getItem('environments');
    return saved ? JSON.parse(saved) : [];
  });

  const [envName, setEnvName] = useState('');
  const [keyValuePairs, setKeyValuePairs] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    localStorage.setItem('environments', JSON.stringify(environments));
  }, [environments]);

  const handleAddPair = () => {
    setKeyValuePairs([...keyValuePairs, { key: '', value: '' }]);
  };

  const handleChangePair = (index, field, val) => {
    const updated = [...keyValuePairs];
    updated[index][field] = val;
    setKeyValuePairs(updated);
  };

  const handleAddEnvironment = () => {
    if (!envName.trim()) return;
    const envObject = {
      id: Date.now(),
      name: envName.trim(),
      variables: keyValuePairs.filter(pair => pair.key && pair.value)
    };
    setEnvironments([...environments, envObject]);
    setEnvName('');
    setKeyValuePairs([{ key: '', value: '' }]);
  };

  const handleDelete = (id) => {
    setEnvironments(environments.filter(env => env.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Environments</h2>

      {/* Add new environment */}
      <div className="mb-8">
        <input
          type="text"
          value={envName}
          onChange={(e) => setEnvName(e.target.value)}
          placeholder="Environment Name"
          className="w-full mb-4 px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-500 text-sm"
        />
        {keyValuePairs.map((pair, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Key"
              value={pair.key}
              onChange={(e) => handleChangePair(index, 'key', e.target.value)}
              className="w-1/2 px-2 py-1 rounded bg-gray-800 text-sm"
            />
            <input
              type="text"
              placeholder="Value"
              value={pair.value}
              onChange={(e) => handleChangePair(index, 'value', e.target.value)}
              className="w-1/2 px-2 py-1 rounded bg-gray-800 text-sm"
            />
          </div>
        ))}
        <div className="flex gap-3 mt-2">
          <button onClick={handleAddPair} className="bg-yellow-600 hover:bg-yellow-700 text-sm px-4 py-1 rounded">
            + Add Variable
          </button>
          <button onClick={handleAddEnvironment} className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-1 rounded">
            Save Environment
          </button>
        </div>
      </div>

      {/* Display Environments */}
      {environments.length === 0 ? (
        <p className="text-gray-400">No environments created yet.</p>
      ) : (
        <div className="space-y-6">
          {environments.map(env => (
            <div key={env.id} className="bg-gray-800 p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{env.name}</h3>
                <button onClick={() => handleDelete(env.id)} className="text-red-400 hover:underline text-sm">
                  Delete
                </button>
              </div>
              <ul className="text-sm text-gray-300">
                {env.variables.map((v, i) => (
                  <li key={i} className="flex justify-between border-b border-gray-700 py-1">
                    <span>{v.key}</span>
                    <span className="text-gray-400">{v.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
