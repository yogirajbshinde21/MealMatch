import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

const WeatherBanner = () => {
  const { 
    weather, 
    discountPercent, 
    loading, 
    error, 
    getWeatherBanner,
    getWeatherEmoji,
    currentCity,
    currentTemp,
    hasDiscount,
    currentCondition
  } = useWeather();
  
  const { user } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="alert alert-light border-0 shadow-sm mb-4" role="alert">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>
            <h6 className="mb-0">🌤️ Fetching weather data for dynamic pricing...</h6>
            <small className="text-muted">Please wait while we get current weather conditions</small>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error) {
    return (
      <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
        <div className="d-flex align-items-center">
          <div className="me-3" style={{ fontSize: '1.5rem' }}>⚠️</div>
          <div>
            <h6 className="mb-0 fw-bold">Weather service temporarily unavailable</h6>
            <small className="text-muted">Using standard pricing for now. Weather-based discounts will resume shortly.</small>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if no weather data
  if (!weather || !weather.current) {
    return (
      <div className="alert alert-info border-0 shadow-sm mb-4" role="alert">
        <div className="d-flex align-items-center">
          <div className="me-3" style={{ fontSize: '1.5rem' }}>🌍</div>
          <div>
            <h6 className="mb-0 fw-bold">Weather-Based Pricing Active!</h6>
            <small className="text-muted">Set your city in profile to get personalized weather discounts</small>
          </div>
        </div>
      </div>
    );
  }

  const weatherEmoji = getWeatherEmoji();
  
  // Determine banner style and colors based on discount
  const getBannerStyle = () => {
    if (discountPercent === 15) {
      return {
        bgClass: 'alert-success',
        badgeClass: 'bg-success',
        borderColor: '#28a745',
        textColor: '#155724'
      };
    } else if (discountPercent === 5) {
      return {
        bgClass: 'alert-info',
        badgeClass: 'bg-info',
        borderColor: '#17a2b8',
        textColor: '#0c5460'
      };
    } else {
      return {
        bgClass: 'alert-light',
        badgeClass: 'bg-secondary',
        borderColor: '#6c757d',
        textColor: '#495057'
      };
    }
  };

  const style = getBannerStyle();

  return (
    <div 
      className={`alert ${style.bgClass} border-0 shadow-lg mb-4 position-relative`} 
      role="alert"
      style={{ 
        borderLeft: `5px solid ${style.borderColor}`,
        background: hasDiscount ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05))' : undefined
      }}
    >
      {/* Main Weather Display */}
      <div className="row align-items-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center">
            {/* Large Weather Icon */}
            <div 
              className="me-4 text-center"
              style={{ 
                fontSize: '3rem',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
              }}
            >
              {weatherEmoji}
            </div>
            
            {/* Weather Info */}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-2">
                <h4 className="mb-0 fw-bold" style={{ color: style.textColor }}>
                  {currentCondition || weather.current.condition.text}
                </h4>
                <span className="badge bg-dark ms-3 fs-6">
                  {currentCity || weather.location?.name || 'Your City'}
                </span>
              </div>
              
              <div className="d-flex align-items-center gap-3 mb-2">
                <span className="fs-5 fw-semibold text-primary">
                  <i className="bi bi-thermometer-half me-1"></i>
                  {currentTemp || Math.round(weather.current.temp_c)}°C
                </span>
                <span className="text-muted">
                  <i className="bi bi-droplet me-1"></i>
                  {weather.current.humidity}% humidity
                </span>
                <span className="text-muted">
                  <i className="bi bi-eye me-1"></i>
                  {weather.current.vis_km || 10}km visibility
                </span>
              </div>

              {/* Pricing Impact Message */}
              <div className="pricing-impact">
                {hasDiscount ? (
                  <div className="d-flex align-items-center">
                    <span className={`badge ${style.badgeClass} fs-6 me-2`}>
                      🎉 {discountPercent}% OFF
                    </span>
                    <span className="fw-semibold text-success">
                      {discountPercent === 15 
                        ? '🌧️ Rainy weather special! All meals 15% cheaper!' 
                        : '🌤️ Weather discount active! Save 5% on all orders!'
                      }
                    </span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <span className="badge bg-light text-dark fs-6 me-2">
                      ☀️ Standard Pricing
                    </span>
                    <span className="text-muted">
                      Perfect weather for dining! Regular prices apply.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Weather Stats */}
        <div className="col-md-4 text-end d-none d-md-block">
          <div className="weather-stats">
            <div className="row text-center">
              <div className="col-4">
                <div className="bg-white rounded p-2 shadow-sm">
                  <div className="fw-bold text-primary">{currentTemp || Math.round(weather.current.temp_c)}°</div>
                  <small className="text-muted">Temp</small>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-white rounded p-2 shadow-sm">
                  <div className="fw-bold text-info">{weather.current.humidity}%</div>
                  <small className="text-muted">Humidity</small>
                </div>
              </div>
              <div className="col-4">
                <div className="bg-white rounded p-2 shadow-sm">
                  <div className="fw-bold text-warning">{discountPercent}%</div>
                  <small className="text-muted">Discount</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar for Discount */}
      {hasDiscount && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="fw-semibold">Weather Discount Applied</small>
            <small className="badge bg-success">{discountPercent}% OFF</small>
          </div>
          <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
            <div 
              className={`progress-bar progress-bar-striped progress-bar-animated ${discountPercent === 15 ? 'bg-success' : 'bg-info'}`}
              role="progressbar" 
              style={{ 
                width: `${(discountPercent / 15) * 100}%`,
                borderRadius: '10px'
              }}
              aria-valuenow={discountPercent}
              aria-valuemin="0" 
              aria-valuemax="15"
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-1">
            
            <small className="text-muted">Maximum (15%)</small>
          </div>
        </div>
      )}


    </div>
  );
};

export default WeatherBanner;
