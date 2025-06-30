import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import weatherService from '../services/weatherService';

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  /**
   * Fetch weather data for user's city
   */
  const fetchWeather = useCallback(async (city) => {
    if (!city) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('🌤️ Fetching weather for:', city);
      const weatherData = await weatherService.getCurrentWeather(city);
      
      if (weatherData && weatherData.current) {
        setWeather(weatherData);
        
        // Calculate discount based on weather condition
        const discount = weatherService.calculateWeatherDiscount(
          weatherData.current.condition.text
        );
        setDiscountPercent(discount);
        
        console.log('🌤️ Weather data loaded successfully:', {
          city: city,
          condition: weatherData.current.condition.text,
          temperature: weatherData.current.temp_c + '°C',
          humidity: weatherData.current.humidity + '%',
          discount: discount + '%',
          location: weatherData.location.name,
          apiResponse: weatherData
        });
      } else {
        console.warn('🌤️ Invalid weather data received:', weatherData);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data');
      // Set default values for fallback
      setDiscountPercent(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load weather when user changes or component mounts
   */
  useEffect(() => {
    console.log('🌤️ WeatherContext: User changed', { user, city: user?.city });
    
    if (user && user.city) {
      fetchWeather(user.city);
    } else if (user && !user.city) {
      console.warn('🌤️ User logged in but no city set:', user);
      // For demo user or users without city, default to Mumbai
      if (user.email === 'demo@mealmatch.com') {
        console.log('🌤️ Demo user detected, forcing Mumbai weather');
        fetchWeather('Mumbai');
      }
    } else {
      // Reset weather data when no user
      setWeather(null);
      setDiscountPercent(0);
      setError(null);
    }
  }, [user, fetchWeather]);

  /**
   * Apply weather-based pricing to a meal price
   */
  const applyWeatherPricing = useCallback((basePrice) => {
    return weatherService.applyWeatherPricing(basePrice, discountPercent);
  }, [discountPercent]);

  /**
   * Get weather banner message for display
   */
  const getWeatherBanner = useCallback(() => {
    if (!weather) return null;
    
    return weatherService.generateWeatherBanner(weather, discountPercent);
  }, [weather, discountPercent]);

  /**
   * Get weather emoji for current conditions
   */
  const getWeatherEmoji = useCallback(() => {
    if (!weather) return '🌤️';
    
    return weatherService.getWeatherEmoji(weather.current.condition.text);
  }, [weather]);

  /**
   * Refresh weather data manually
   */
  const refreshWeather = useCallback(() => {
    if (user && user.city) {
      fetchWeather(user.city);
    }
  }, [user, fetchWeather]);

  const value = {
    // State
    weather,
    discountPercent,
    loading,
    error,
    
    // Functions
    applyWeatherPricing,
    getWeatherBanner,
    getWeatherEmoji,
    refreshWeather,
    
    // Weather info
    hasDiscount: discountPercent > 0,
    discountText: discountPercent > 0 ? `${discountPercent}% OFF` : null,
    currentCity: user?.city || null,
    currentCondition: weather?.current?.condition?.text || null,
    currentTemp: weather?.current?.temp_c || null
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherContext;
