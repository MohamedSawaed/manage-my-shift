// src/App.js
import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Departments from './components/Departments';
import Workers from './components/Workers';
import ShiftManager from './components/ShiftManager';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/localStorage';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [departments, setDepartments] = useState(loadFromLocalStorage('departments') || []);
  const [workers, setWorkers] = useState(loadFromLocalStorage('workers') || []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    saveToLocalStorage('departments', departments);
  }, [departments]);

  useEffect(() => {
    saveToLocalStorage('workers', workers);
  }, [workers]);

  const addDepartment = (name) => {
    setDepartments([...departments, name]);
  };

  const addWorker = (name) => {
    setWorkers([...workers, name]);
  };

  const deleteDepartment = (deptName) => {
    setDepartments(departments.filter((d) => d !== deptName));
  };

  const deleteWorker = (workerName) => {
    setWorkers(workers.filter((w) => w !== workerName));
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home setView={setView} />;
      case 'departments':
        return <Departments setView={setView} addDepartment={addDepartment} departments={departments} onDeleteDepartment={deleteDepartment} />;
      case 'workers':
        return <Workers setView={setView} addWorker={addWorker} workers={workers} onDeleteWorker={deleteWorker} />;
      case 'shifts':
        return <ShiftManager departments={departments} workers={workers} onDeleteDepartment={deleteDepartment} onDeleteWorker={deleteWorker} />;
      default:
        return <Home setView={setView} />;
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="app">
      <Navbar setView={setView} />
      {renderView()}
    </div>
  );
};

export default App;
