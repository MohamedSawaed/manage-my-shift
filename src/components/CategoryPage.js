// src/components/CategoryPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryPage = ({ category }) => (
  <div className="category-page">
    <h2>{category === 'departments' ? 'Departments' : 'Workers'}</h2>
    <Link to={`/add-${category.slice(0, -1)}`}>Add {category.slice(0, -1)}</Link>
  </div>
);

export default CategoryPage;
