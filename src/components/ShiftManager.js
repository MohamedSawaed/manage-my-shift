// src/components/ShiftManager.js
import React, { useState, useEffect, useRef } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';
import html2canvas from 'html2canvas';

const ShiftManager = ({ departments, workers }) => {
  const [shifts, setShifts] = useState(loadFromLocalStorage('shifts') || {
    morning: {},
    evening: {},
    night: {}
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedShift, setSelectedShift] = useState('morning');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [assignedWorkers, setAssignedWorkers] = useState(new Set(loadFromLocalStorage('assignedWorkers') || [])); 
  const [notes, setNotes] = useState(loadFromLocalStorage('shiftNotes') || '');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Success message state

  const shiftsRef = useRef(null);

  useEffect(() => {
    saveToLocalStorage('shifts', shifts);
  }, [shifts]);

  useEffect(() => {
    saveToLocalStorage('assignedWorkers', Array.from(assignedWorkers));
  }, [assignedWorkers]);

  useEffect(() => {
    saveToLocalStorage('shiftNotes', notes);
  }, [notes]);

  const prefixOptions = {
    Dough: 'בצק',
    Machine: 'מכונה',
    Packing: 'אריזה'
  };

  const handleAssign = () => {
    if (selectedDepartment && selectedWorker && selectedPrefix) {
      const prefixedWorker = `${prefixOptions[selectedPrefix]} ${selectedWorker}`;
      setShifts((prev) => ({
        ...prev,
        [selectedShift]: {
          ...prev[selectedShift],
          [selectedDepartment]: [
            ...(prev[selectedShift][selectedDepartment] || []),
            prefixedWorker
          ]
        }
      }));
      
      setAssignedWorkers((prev) => new Set(prev).add(selectedWorker));
      setSelectedWorker('');

      // Show success message temporarily
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
  };

  const handleDownloadScreenshot = async () => {
    if (shiftsRef.current) {
      const canvas = await html2canvas(shiftsRef.current);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `shifts_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleDeleteDepartmentFromShift = (shift, department) => {
    setShifts((prev) => {
      const updatedShift = { ...prev[shift] };
      delete updatedShift[department];
      return { ...prev, [shift]: updatedShift };
    });
  };

  const handleDeleteWorkerFromDepartment = (shift, department, worker) => {
    setShifts((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [department]: prev[shift][department].filter((w) => w !== worker)
      }
    }));

    setAssignedWorkers((prev) => {
      const updatedWorkers = new Set(prev);
      updatedWorkers.delete(worker.split(' ')[1]);
      return updatedWorkers;
    });
  };

  const shiftNames = {
    morning: 'בוקר',
    evening: 'ערב',
    night: 'לילה'
  };

  const shiftTimings = {
    morning: '6:50 - 16:00',
    evening: '15:30 - 00:30',
    night: '18:50 - 6:50'
  };

  const filteredShifts = Object.entries(shifts).reduce((acc, [shiftName, departments]) => {
    if (Object.keys(departments).length > 0) {
      acc[shiftName] = departments;
    }
    return acc;
  }, {});

  const availableWorkers = workers.filter((worker) => !assignedWorkers.has(worker));

  const currentDate = new Date().toLocaleDateString();

  // Validation for enabling/disabling the Assign button
  const isAssignDisabled = !(selectedPrefix && selectedDepartment && selectedWorker);

  return (
    <div className="shift-manager">
      <h2>Assign Shifts</h2>
      
      <select onChange={(e) => setSelectedPrefix(e.target.value)} value={selectedPrefix}>
        <option value="">בחר קידומת</option>
        <option value="Dough">בצק</option>
        <option value="Machine">מכונה</option>
        <option value="Packing">אריזה</option>
        <option value="Packing">ניקיון</option>
      </select>

      <select onChange={(e) => setSelectedDepartment(e.target.value)} value={selectedDepartment}>
        <option value="">בחר מחלקה</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>

      <select onChange={(e) => setSelectedWorker(e.target.value)} value={selectedWorker}>
        <option value="">בחר עובד</option>
        {availableWorkers.map((worker) => (
          <option key={worker} value={worker}>{worker}</option>
        ))}
      </select>

      <select onChange={(e) => setSelectedShift(e.target.value)} value={selectedShift}>
        <option value="morning">בוקר (6:50 - 16:00)</option>
        <option value="evening">ערב (15:30 - 00:30)</option>
        <option value="night">לילה (18:50 - 6:50)</option>
      </select>

      {/* Assign Button with validation check */}
      <button
        onClick={handleAssign}
        disabled={isAssignDisabled}
        className={`assign-button ${isAssignDisabled ? 'disabled' : ''}`}
      >
        לְהַקְצוֹת
      </button>

      {/* Success Message */}
      {showSuccessMessage && <div className="success-message">העובד הוקצה בהצלחה!</div>}

      <button onClick={handleDownloadScreenshot} style={{ marginTop: '1em', backgroundColor: '#4CAF50', color: 'white', padding: '0.8em 1.5em', border: 'none', borderRadius: '0.3em' }}>
        להוריד את הסידור
      </button>

      <div className="shifts" ref={shiftsRef}>
        <div className="screenshot-header">
          <h3>{currentDate}</h3>
        </div>
        {Object.entries(filteredShifts).map(([shiftName, departments]) => (
          <div key={shiftName} className="shift">
            <h3>
              משמרת {shiftNames[shiftName]} 
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                {shiftTimings[shiftName]}
              </span>
            </h3>
            <div className="shift-columns">
              {Object.entries(departments).map(([department, workers]) => (
                <div key={department} className="shift-column">
                  <h4 onDoubleClick={() => handleDeleteDepartmentFromShift(shiftName, department)}>{department}</h4>
                  <ul>
                    {workers.map((worker, idx) => (
                      <li key={idx} onDoubleClick={() => handleDeleteWorkerFromDepartment(shiftName, department, worker)}>
                        {worker}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="notes-section">
          <h4>הערות</h4>
          <p>{notes}</p>
        </div>
      </div>

      <div className="notes-input">
        <h4>הערות</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="הוסף הערות כלליות כאן"
          rows="4"
        />
      </div>
    </div>
  );
};

export default ShiftManager;
