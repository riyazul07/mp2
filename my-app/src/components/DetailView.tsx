import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mealService } from '../services/mealService';
import { Meal } from '../types/meal';
import './DetailView.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMealAndList = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const mealData = await mealService.getMealById(id);
        if (!mealData) {
          setError('Meal not found');
          return;
        }
        
        setMeal(mealData);
        
        
        const categoryMeals = await mealService.getMealsByCategory(mealData.strCategory);
        setAllMeals(categoryMeals);
        
        
        const index = categoryMeals.findIndex(m => m.idMeal === id);
        setCurrentIndex(index !== -1 ? index : 0);
        
      } catch (err) {
        setError('Failed to load meal details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMealAndList();
  }, [id]);

  const getIngredients = (meal: Meal): Array<{ ingredient: string; measure: string }> => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal] as string;
      const measure = meal[`strMeasure${i}` as keyof Meal] as string;
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  };

  const navigateToMeal = (direction: 'prev' | 'next') => {
    if (allMeals.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allMeals.length - 1;
    } else {
      newIndex = currentIndex < allMeals.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newMeal = allMeals[newIndex];
    navigate(`/meal/${newMeal.idMeal}`);
  };

  if (loading) {
    return <div className="detail-view loading">Loading meal details...</div>;
  }

  if (error || !meal) {
    return (
      <div className="detail-view error">
        <p>{error || 'Meal not found'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Search
        </button>
      </div>
    );
  }

  const ingredients = getIngredients(meal);

  return (
    <div className="detail-view">
      <div className="navigation-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Search
        </button>
        
        {allMeals.length > 1 && (
          <div className="meal-navigation">
            <button 
              onClick={() => navigateToMeal('prev')} 
              className="nav-button"
              title="Previous meal"
            >
              ← Previous
            </button>
            <span className="meal-counter">
              {currentIndex + 1} of {allMeals.length}
            </span>
            <button 
              onClick={() => navigateToMeal('next')} 
              className="nav-button"
              title="Next meal"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className="meal-header">
        <div className="meal-image">
          <img src={meal.strMealThumb} alt={meal.strMeal} />
        </div>
        <div className="meal-basic-info">
          <h1>{meal.strMeal}</h1>
          <div className="meal-tags">
            <span className="tag category">{meal.strCategory}</span>
            <span className="tag area">{meal.strArea}</span>
            {meal.strTags && meal.strTags.split(',').map(tag => (
              <span key={tag.trim()} className="tag">{tag.trim()}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="meal-content">
        <div className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {ingredients.map((item, index) => (
              <li key={index}>
                <span className="measure">{item.measure}</span>
                <span className="ingredient">{item.ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="instructions-section">
          <h2>Instructions</h2>
          <div className="instructions">
            {meal.strInstructions.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
        </div>

        {meal.strYoutube && (
          <div className="video-section">
            <h2>Video Tutorial</h2>
            <a 
              href={meal.strYoutube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="youtube-link"
            >
              Watch on YouTube →
            </a>
          </div>
        )}

        {meal.strSource && (
          <div className="source-section">
            <h2>Recipe Source</h2>
            <a 
              href={meal.strSource} 
              target="_blank" 
              rel="noopener noreferrer"
              className="source-link"
            >
              View Original Recipe →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;