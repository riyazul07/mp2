import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mealService } from '../services/mealService';
import { Meal } from '../types/meal';
import './ListView.css';

type SortField = 'strMeal' | 'strCategory' | 'strArea';
type SortOrder = 'asc' | 'desc';

const ListView: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('strMeal');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMeals = async (query: string) => {
    if (!query.trim()) {
      setMeals([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await mealService.searchMeals(query);
      setMeals(results);
    } catch (err) {
      setError('Failed to search meals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMeals(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const sortedMeals = useMemo(() => {
    return [...meals].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [meals, sortField, sortOrder]);

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="list-view">
      <div className="search-section">
        <h1>Search Meals</h1>
        <input
          type="text"
          placeholder="Search for meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {searchQuery && (
        <div className="sort-section">
          <span>Sort by:</span>
          <button
            onClick={() => handleSortChange('strMeal')}
            className={sortField === 'strMeal' ? 'active' : ''}
          >
            Name {sortField === 'strMeal' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('strCategory')}
            className={sortField === 'strCategory' ? 'active' : ''}
          >
            Category {sortField === 'strCategory' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('strArea')}
            className={sortField === 'strArea' ? 'active' : ''}
          >
            Area {sortField === 'strArea' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      )}

      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">{error}</div>}

      <div className="meals-grid">
        {sortedMeals.map((meal) => (
          <Link to={`/meal/${meal.idMeal}`} key={meal.idMeal} className="meal-card">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
            <div className="meal-info">
              <h3>{meal.strMeal}</h3>
              <p className="category">{meal.strCategory}</p>
              <p className="area">{meal.strArea}</p>
            </div>
          </Link>
        ))}
      </div>

      {searchQuery && !loading && sortedMeals.length === 0 && (
        <div className="no-results">No meals found for "{searchQuery}"</div>
      )}
    </div>
  );
};

export default ListView;