import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mealService } from '../services/mealService';
import { Meal, Category } from '../types/meal';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [categoriesData, areasData] = await Promise.all([
          mealService.getCategories(),
          mealService.getAreas()
        ]);
        
        setCategories(categoriesData);
        setAreas(areasData);
        
        
        if (categoriesData.length > 0) {
          const initialMeals = await Promise.all(
            categoriesData.slice(0, 3).map(cat => 
              mealService.getMealsByCategory(cat.strCategory)
            )
          );
          setMeals(initialMeals.flat());
        }
      } catch (err) {
        setError('Failed to load gallery data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadFilteredMeals = async () => {
      if (selectedCategories.length === 0 && selectedAreas.length === 0) {
        // Load default meals if no filters
        if (categories.length > 0) {
          const defaultMeals = await Promise.all(
            categories.slice(0, 3).map(cat => 
              mealService.getMealsByCategory(cat.strCategory)
            )
          );
          setMeals(defaultMeals.flat());
        }
        return;
      }

      setLoading(true);
      try {
        const mealPromises: Promise<Meal[]>[] = [];
        
        selectedCategories.forEach(category => {
          mealPromises.push(mealService.getMealsByCategory(category));
        });
        
        selectedAreas.forEach(area => {
          mealPromises.push(mealService.getMealsByArea(area));
        });

        const results = await Promise.all(mealPromises);
        const allMeals = results.flat();
        
        // Remove duplicates based on meal ID
        const uniqueMeals = allMeals.filter((meal, index, self) => 
          index === self.findIndex(m => m.idMeal === meal.idMeal)
        );
        
        setMeals(uniqueMeals);
      } catch (err) {
        setError('Failed to filter meals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFilteredMeals();
  }, [selectedCategories, selectedAreas, categories]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAreaChange = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedAreas([]);
  };

  return (
    <div className="gallery-view">
      <h1>Meal Gallery</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <h3>Categories</h3>
          <div className="filter-options">
            {categories.map(category => (
              <label key={category.idCategory} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.strCategory)}
                  onChange={() => handleCategoryChange(category.strCategory)}
                />
                {category.strCategory}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Areas</h3>
          <div className="filter-options">
            {areas.map(area => (
              <label key={area} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedAreas.includes(area)}
                  onChange={() => handleAreaChange(area)}
                />
                {area}
              </label>
            ))}
          </div>
        </div>

        {(selectedCategories.length > 0 || selectedAreas.length > 0) && (
          <button onClick={clearFilters} className="clear-filters">
            Clear All Filters
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading meals...</div>}
      {error && <div className="error">{error}</div>}

      <div className="gallery-grid">
        {meals.map((meal) => (
          <Link to={`/meal/${meal.idMeal}`} key={meal.idMeal} className="gallery-item">
            <div className="image-container">
              <img src={meal.strMealThumb} alt={meal.strMeal} />
              <div className="overlay">
                <h3>{meal.strMeal}</h3>
                <p>{meal.strCategory}</p>
                <p>{meal.strArea}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && meals.length === 0 && (
        <div className="no-results">No meals found with current filters</div>
      )}
    </div>
  );
};

export default GalleryView;