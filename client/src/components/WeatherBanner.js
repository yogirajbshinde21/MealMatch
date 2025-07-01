import React from 'react';
import { useWeather } from '../context/WeatherContext';

const WeatherBanner = () => {
  const { 
    weather,            
    discountPercent, 
    loading, 
    error, 
    currentCity,
    hasDiscount,
    currentCondition
  } = useWeather();

  // Get simple weather icon for condition badge
  const getWeatherIcon = () => {
    if (!weather?.current) return '🌦️';
    
    const condition = currentCondition || weather.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return '🌧️';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      return '❄️';
    } else if (condition.includes('sunny') || condition.includes('clear')) {
      return '☀️';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return '☁️';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
      return '⛈️';
    } else {
      return '🌤️';
    }
  };

  // Get food-themed icon based on weather condition
  const getFoodWeatherIcon = () => {
    if (!weather?.current) return '🍽️';
    
    const condition = currentCondition || weather.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return '🥘'; // Hot comfort food
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      return '🍲'; // Warm soup/stew
    } else if (condition.includes('hot') || condition.includes('sunny')) {
      return '🥗'; // Fresh salads
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return '🍜'; // Noodles/warm comfort food
    } else {
      return '🍽️'; // General dining
    }
  };

  // Get food-delivery focused message
  const getFoodDeliveryMessage = () => {
    if (!weather?.current) return 'Smart Pricing Active!';
    
    const condition = currentCondition || weather.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'Rainy Day Special!';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      return 'Winter Comfort Food!';
    } else if (condition.includes('hot') || condition.includes('sunny')) {
      return 'Sunny Day Fresh!';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return 'Perfect Comfort Food Weather!';
    } else {
      return 'Great Weather for Food Delivery!';
    }
  };

  // Get subtitle message
  const getSubtitleMessage = () => {
    if (!weather?.current) return 'Enjoy great food with smart pricing';
    
    const condition = currentCondition || weather.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'Perfect weather for hot comfort food delivery';
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      return 'Stay warm with hot meals delivered to your door';
    } else if (condition.includes('hot') || condition.includes('sunny')) {
      return 'Beat the heat with fresh meals and cold drinks';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      return 'Stay cozy indoors while we bring you delicious meals';
    } else {
      return 'Perfect weather for enjoying great food at home';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="modern-food-banner loading-banner" role="alert">
        <div className="banner-content">
          <div className="food-icon-container">
            <div className="food-icon loading">🍽️</div>
          </div>
          <div className="banner-text">
            <h6 className="banner-title">Checking for special offers...</h6>
            <small className="banner-subtitle">We're finding the best deals for you based on current conditions</small>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error) {
    return (
      <div className="modern-food-banner error-banner" role="alert">
        <div className="banner-content">
          <div className="food-icon-container">
            <div className="food-icon">🍽️</div>
          </div>
          <div className="banner-text">
            <h6 className="banner-title">Standard pricing in effect</h6>
            <small className="banner-subtitle">Great food at regular prices - special weather deals will return soon!</small>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if no weather data
  if (!weather || !weather.current) {
    return (
      <div className="modern-food-banner info-banner" role="alert">
        <div className="banner-content">
          <div className="food-icon-container">
            <div className="food-icon">🍽️</div>
          </div>
          <div className="banner-text">
            <h6 className="banner-title">Smart Pricing Active!</h6>
            <small className="banner-subtitle">Set your location in profile to unlock personalized food deals</small>
          </div>
        </div>
      </div>
    );
  }

  const foodIcon = getFoodWeatherIcon();
  const mainTitle = getFoodDeliveryMessage();
  const subtitle = getSubtitleMessage();

  return (
    <div className={`modern-food-banner ${hasDiscount ? 'special-offer' : 'regular-pricing'}`} role="alert">
      {/* Special Offer Header */}
      {hasDiscount && (
        <div className="special-offer-header">
          <span className="offer-badge">🎉 Special Deal Active!</span>
        </div>
      )}
      
      {/* Main Banner Content */}
      <div className="banner-content">
        <div className="food-icon-container">
          <div className="food-icon animated">{foodIcon}</div>
          <div className="floating-food-icons">
            <span className="floating-icon icon-1">🥘</span>
            <span className="floating-icon icon-2">🍲</span>
            <span className="floating-icon icon-3">�</span>
            <span className="floating-icon icon-4">🥗</span>
          </div>
        </div>
        
        <div className="banner-text">
          <h4 className="banner-title">{mainTitle}</h4>
          <p className="banner-subtitle">{subtitle}</p>
          
          {/* Location and Deal Info */}
          <div className="banner-info">
            <span className="location-badge">
              📍 {currentCity || weather.location?.name || 'Your City'}
            </span>
            {/* Weather Condition Display */}
            <span className="weather-condition-badge">
              {getWeatherIcon()} {currentCondition || weather.current?.condition?.text || 'Light Rain'}
            </span>
            {/* Temperature Display */}
            <span className="temperature-badge">
              🌡️ {weather.current?.temp_c || 24}°C
            </span>
            {hasDiscount && (
              <span className="deal-badge pulsing">
                💰 {discountPercent}% OFF All Orders
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar for Discount */}
      {hasDiscount && (
        <div className="discount-progress">
          <div className="progress-header">
            <span className="progress-label">Deal Level</span>
            <span className="progress-value">{discountPercent}% OFF</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(discountPercent / 15) * 100}%` }}
            ></div>
          </div>
          <div className="progress-footer">
            <span>Standard</span>
            <span>Maximum Deal</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherBanner;
