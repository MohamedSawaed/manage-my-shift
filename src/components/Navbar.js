// src/components/Navbar.js
import React from 'react';
import './Navbar.css';

const Navbar = ({ setView }) => (
  <nav className="navbar">
    <button onClick={() => setView('home')}>בית</button>
    <button onClick={() => setView('departments')}>מחלקות</button>
    <button onClick={() => setView('workers')}>עובדים</button>
    <button onClick={() => setView('shifts')}>צור משמרות</button>
  </nav>
);

export default Navbar;
