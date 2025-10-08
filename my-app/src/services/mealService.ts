import axios from 'axios';
import { Meal, MealResponse, Category, CategoryResponse, AreaResponse } from '../types/meal';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const mealService = {
  async searchMeals(query: string): Promise<Meal[]> {
    const cacheKey = `search_${query}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<MealResponse>(`${BASE_URL}/search.php?s=${query}`);
      const meals = response.data.meals || [];
      setCachedData(cacheKey, meals);
      return meals;
    } catch (error) {
      console.error('Error searching meals:', error);
      return [];
    }
  },

  async getMealById(id: string): Promise<Meal | null> {
    const cacheKey = `meal_${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<MealResponse>(`${BASE_URL}/lookup.php?i=${id}`);
      const meal = response.data.meals?.[0] || null;
      setCachedData(cacheKey, meal);
      return meal;
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<CategoryResponse>(`${BASE_URL}/categories.php`);
      const categories = response.data.categories || [];
      setCachedData(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async getMealsByCategory(category: string): Promise<Meal[]> {
    const cacheKey = `category_${category}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<MealResponse>(`${BASE_URL}/filter.php?c=${category}`);
      const meals = response.data.meals || [];
      setCachedData(cacheKey, meals);
      return meals;
    } catch (error) {
      console.error('Error fetching meals by category:', error);
      return [];
    }
  },

  async getAreas(): Promise<string[]> {
    const cacheKey = 'areas';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<AreaResponse>(`${BASE_URL}/list.php?a=list`);
      const areas = response.data.meals?.map(area => area.strArea) || [];
      setCachedData(cacheKey, areas);
      return areas;
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  },

  async getMealsByArea(area: string): Promise<Meal[]> {
    const cacheKey = `area_${area}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<MealResponse>(`${BASE_URL}/filter.php?a=${area}`);
      const meals = response.data.meals || [];
      setCachedData(cacheKey, meals);
      return meals;
    } catch (error) {
      console.error('Error fetching meals by area:', error);
      return [];
    }
  }
};