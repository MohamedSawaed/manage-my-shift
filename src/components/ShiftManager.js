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
  const [workerTimes, setWorkerTimes] = useState(loadFromLocalStorage('workerTimes') || {});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedShift, setSelectedShift] = useState('morning');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [assignedWorkers, setAssignedWorkers] = useState(new Set(loadFromLocalStorage('assignedWorkers') || []));
  const [notes, setNotes] = useState(loadFromLocalStorage('shiftNotes') || {
    morning: '',
    evening: '',
    night: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const shiftRefs = {
    morning: useRef(null),
    evening: useRef(null),
    night: useRef(null),
  };

  useEffect(() => {
    saveToLocalStorage('shifts', shifts);
    saveToLocalStorage('workerTimes', workerTimes);
  }, [shifts, workerTimes]);

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

  const shiftDefaultTimes = {
    morning: { start: '6:50', end: '16:00' },
    evening: { start: '15:30', end: '00:30' },
    night: { start: '18:50', end: '6:50' }
  };

  // Initialize workerTimes with default times if missing
  const initializeWorkerTime = (worker, shift) => {
    const defaultTime = shiftDefaultTimes[shift];
    setWorkerTimes((prev) => ({
      ...prev,
      [worker]: {
        start: prev[worker]?.start || defaultTime.start,
        end: prev[worker]?.end || defaultTime.end
      }
    }));
  };

  const handleAssign = () => {
    if (selectedDepartment && selectedWorker && selectedPrefix) {
      const isContractWorker = selectedWorker === "עובד קבלן";
      const prefixedWorker = `${prefixOptions[selectedPrefix]} ${selectedWorker}`;
      const uniqueWorkerName = isContractWorker ? `${prefixedWorker}-${Date.now()}` : prefixedWorker;

      setShifts((prev) => ({
        ...prev,
        [selectedShift]: {
          ...prev[selectedShift],
          [selectedDepartment]: [
            ...(prev[selectedShift][selectedDepartment] || []),
            uniqueWorkerName
          ]
        }
      }));

      // Initialize workerTimes for the newly assigned worker
      initializeWorkerTime(uniqueWorkerName, selectedShift);

      if (!isContractWorker) {
        setAssignedWorkers((prev) => new Set(prev).add(selectedWorker));
      }
      setSelectedWorker('');

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    }
  };

  const handleTimeAdjust = (worker, adjustment, type) => {
    setWorkerTimes((prev) => {
      const currentTimes = prev[worker] || shiftDefaultTimes[selectedShift];
      const [hours, minutes] = currentTimes[type].split(':').map(Number);

      const date = new Date();
      date.setHours(hours, minutes + adjustment);
      const newTime = date.toTimeString().slice(0, 5);

      return {
        ...prev,
        [worker]: {
          ...currentTimes,
          [type]: newTime
        }
      };
    });
  };

  const handleDownloadScreenshot = async (shiftName) => {
    const shiftRef = shiftRefs[shiftName].current;

    if (shiftRef) {
      shiftRef.classList.add('screenshot-mode');

      const canvas = await html2canvas(shiftRef, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      shiftRef.classList.remove('screenshot-mode');

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `shifts_${date}_${shiftNames[shiftName]}.png`;
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

  const handleDeleteWorker = (shift, department, worker) => {
    setShifts((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [department]: prev[shift][department].filter((w) => w !== worker)
      }
    }));

    const isContractWorker = worker.includes("עובד קבלן");
    if (!isContractWorker) {
      setAssignedWorkers((prev) => {
        const updatedWorkers = new Set(prev);
        updatedWorkers.delete(worker.split(' ')[1]);
        return updatedWorkers;
      });
    }

    setWorkerTimes((prev) => {
      const updatedTimes = { ...prev };
      delete updatedTimes[worker];
      return updatedTimes;
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

  const availableWorkers = ["עובד קבלן", ...workers.filter((worker) => !assignedWorkers.has(worker))];

  const currentDate = new Date().toLocaleDateString();

  const isAssignDisabled = !(selectedPrefix && selectedDepartment && selectedWorker);

  return (
    <div className="shift-manager">
      <h2>סידור עבודה</h2>
      
      <select onChange={(e) => setSelectedPrefix(e.target.value)} value={selectedPrefix}>
        <option value="">בחר קידומת</option>
        <option value="Dough">בצק</option>
        <option value="Machine">מכונה</option>
        <option value="Packing">אריזה</option>
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

      <button
        onClick={handleAssign}
        disabled={isAssignDisabled}
        className={`assign-button ${isAssignDisabled ? 'disabled' : ''}`}
      >
        לְהַקְצוֹת
      </button>

      {showSuccessMessage && <div className="success-message">העובד הוקצה בהצלחה!</div>}

      {Object.keys(filteredShifts).map((shiftKey) => (
        <button
          key={shiftKey}
          onClick={() => handleDownloadScreenshot(shiftKey)}
          style={{ marginTop: '1em', backgroundColor: '#4CAF50', color: 'white', padding: '0.8em 1.5em', border: 'none', borderRadius: '0.3em' }}
        >
          הורד סידור {shiftNames[shiftKey]}
        </button>
      ))}

      {Object.entries(filteredShifts).map(([shiftName, departments]) => (
        <div key={shiftName} className="shift" ref={shiftRefs[shiftName]}>
          <h3>
            משמרת {shiftNames[shiftName]} 
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
              {shiftTimings[shiftName]}
            </span>
          </h3>
          <div className="shift-columns">
            {Object.entries(departments).map(([department, workers]) => (
              <div key={department} className="shift-column">
                <div className="department-header">
                  <h4>{department}</h4>
                  <button
                    className="delete-department-button"
                    onClick={() => handleDeleteDepartmentFromShift(shiftName, department)}
                  >
                    ✕
                  </button>
                </div>
                <ul>
                  {workers.map((worker, idx) => (
                    <li
                      key={idx}
                      className="worker-entry"
                    >
                      <div className="worker-name-container">
                        {worker.includes("עובד קבלן") ? "עובד קבלן" : worker}
                        <button 
                          className="delete-button" 
                          onClick={() => handleDeleteWorker(shiftName, department, worker)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="worker-time-container">
                        {(workerTimes[worker]?.start || shiftDefaultTimes[shiftName].start)} - {(workerTimes[worker]?.end || shiftDefaultTimes[shiftName].end)}
                        <span className="time-adjust-buttons">
                          <button onClick={() => handleTimeAdjust(worker, 10, 'start')}>+</button>
                          <button onClick={() => handleTimeAdjust(worker, -10, 'start')}>-</button>
                          <button onClick={() => handleTimeAdjust(worker, 10, 'end')}>+</button>
                          <button onClick={() => handleTimeAdjust(worker, -10, 'end')}>-</button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="notes-section">
            <h4>הערות עבור משמרת {shiftNames[shiftName]}</h4>
            <textarea
              value={notes[shiftName]}
              onChange={(e) =>
                setNotes((prev) => ({ ...prev, [shiftName]: e.target.value }))
              }
              placeholder={`הוסף הערות עבור משמרת ${shiftNames[shiftName]}`}
              rows="3"
            />
          </div>
        </div>
      ))}

      <style>
        {`
          .worker-entry {
            position: relative;
            margin-bottom: 10px;
            cursor: pointer;
          }
          .worker-name-container {
            display: inline-flex;
            align-items: center;
          }
          .delete-button {
            display: none;
            margin-left: 5px;
            background: transparent;
            border: none;
            color: red;
            font-size: 0.8em;
            cursor: pointer;
          }
          .worker-entry:hover .delete-button {
            display: inline;
          }
          .department-header {
            display: flex;
            align-items: center;
          }
          .delete-department-button {
            display: none;
            margin-left: 10px;
            background: transparent;
            border: none;
            color: red;
            font-size: 0.9em;
            cursor: pointer;
          }
          .department-header:hover .delete-department-button {
            display: inline;
          }
          .worker-time-container {
            margin-top: 5px;
            font-weight: bold;
            position: relative;
          }
          .time-adjust-buttons {
            display: none;
            margin-left: 5px;
          }
          .worker-time-container:hover .time-adjust-buttons {
            display: inline-flex;
          }
          .time-adjust-buttons button {
            margin: 0 3px;
          }
          .screenshot-mode {
            box-shadow: none !important;
            filter: none !important;
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .screenshot-mode .worker-entry,
          .screenshot-mode .shift-columns {
            background-color: transparent !important;
            box-shadow: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default ShiftManager;
