// src/components/Home.js
import React from 'react';
import './Home.css';
const Home = ({ setView }) => (
  <div className="home">
    <h1>ברוכים הבאים למנהל המשמרות</h1>
    <button onClick={() => setView('departments')}>ניהול מחלקות</button>
    <button onClick={() => setView('workers')}>ניהול עובדים</button>
    <button onClick={() => setView('shifts')}>ניהול משמרות</button>
  </div>
);

export default Home;
