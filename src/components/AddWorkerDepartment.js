// src/components/AddWorkerDepartment.js
import React, { useState } from 'react';

const AddWorkerDepartment = ({ type }) => {
  const [name, setName] = useState('');

  const handleAdd = () => {
    alert(`${type} added: ${name}`);
    setName('');
  };

  return (
    <div className="add-form">
      <h3>Add {type}</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`Enter ${type} name`}
      />
      <button onClick={handleAdd}>Add {type}</button>
    </div>
  );
};

export default AddWorkerDepartment;
