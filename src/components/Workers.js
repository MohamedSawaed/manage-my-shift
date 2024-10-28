// src/components/Workers.js
import React, { useState } from 'react';
import './Workers.css';
const Workers = ({ setView, addWorker, workers, onDeleteWorker }) => {
  const [newWorker, setNewWorker] = useState('');

  const handleAdd = () => {
    if (newWorker.trim()) {
      addWorker(newWorker);
      setNewWorker('');
    }
  };

  return (
    <div className="workers">
      <h2>עובדים</h2>
      <input
        type="text"
        value={newWorker}
        onChange={(e) => setNewWorker(e.target.value)}
        placeholder="תכניס שם של עובד"
      />
      <button onClick={handleAdd}>תוסיף עובד</button>
      <button onClick={() => setView('home')}>חזרה לבית</button>
      <ul>
        {workers.map((worker, idx) => (
          <li key={idx} onDoubleClick={() => onDeleteWorker(worker)}>
            {worker}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Workers;
