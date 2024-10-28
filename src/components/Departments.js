// src/components/Departments.js
import React, { useState } from 'react';
import './Departments.css'; // Adjust path if in a different folder

const Departments = ({ setView, addDepartment, departments, onDeleteDepartment }) => {
  const [newDept, setNewDept] = useState('');

  const handleAdd = () => {
    if (newDept.trim()) {
      addDepartment(newDept);
      setNewDept('');
    }
  };

  return (
    <div className="departments">
      <h2>מחלקות</h2>
      <input
        type="text"
        value={newDept}
        onChange={(e) => setNewDept(e.target.value)}
        placeholder="תכניס שם של מחלקה"
      />
      <button onClick={handleAdd}>תוסיף מחלקה</button>
      <button onClick={() => setView('home')}>חזרה לבית</button>
      <ul>
        {departments.map((dept, idx) => (
          <li key={idx} onDoubleClick={() => onDeleteDepartment(dept)}>
            {dept}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Departments;
