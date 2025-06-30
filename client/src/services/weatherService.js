// Weather API service for dynamic meal pricing
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const WEATHER_API_BASE_URL = process.env.REACT_APP_WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1/current.json';

// Validate that the API key is available
if (!WEATHER_API_KEY) {
  console.warn('Weather API key not found. Please add REACT_APP_WEATHER_API_KEY to your .env file');
}

/**
 * Fetch current weather for a given city
 * @param {string} city - City name (e.g., "Mumbai", "Delhi")
 * @returns {Promise} Weather data from API
 */
export const getCurrentWeather = async (city) => {
  try {
    // Check if API key is available
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not configured, using fallback weather data');
      return getFallbackWeather(city);
    }

    const response = await fetch(
      `${WEATHER_API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return default weather for fallback
    return getFallbackWeather(city);
  }
};

/**
 * Get fallback weather data when API is unavailable
 * @param {string} city - City name
 * @returns {object} Default weather data
 */
const getFallbackWeather = (city) => {
  return {
    current: {
      condition: {
        text: 'Clear',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
      },
      temp_c: 25,
      humidity: 60,
      vis_km: 10
    },
    location: {
      name: city || 'Unknown',
      region: '',
      country: 'India'
    }
  };
};

/**
 * Calculate discount percentage based on weather condition
 * @param {string} conditionText - Weather condition text from API
 * @returns {number} Discount percentage (0-15)
 */
export const calculateWeatherDiscount = (conditionText) => {
  if (!conditionText) return 0;
  
  const condition = conditionText.toLowerCase();
  
  // 15% discount for rainy/misty/foggy weather
  if (condition.includes('rain') || 
      condition.includes('mist') || 
      condition.includes('fog') ||
      condition.includes('drizzle') ||
      condition.includes('shower')) {
    return 15;
  }
  
  // No discount for sunny/clear weather
  if (condition.includes('sunny') || 
      condition.includes('clear')) {
    return 0;
  }
  
  // 5% discount for all other conditions
  return 5;
};

/**
 * Apply weather-based discount to meal price
 * @param {number} basePrice - Original meal price
 * @param {number} discountPercent - Discount percentage (0-15)
 * @returns {object} Price info with original and discounted price
 */
export const applyWeatherPricing = (basePrice, discountPercent) => {
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = basePrice - discountAmount;
  
  return {
    basePrice,
    discountPercent,
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    hasDiscount: discountPercent > 0
  };
};

/**
 * Get weather emoji based on condition
 * @param {string} conditionText - Weather condition text
 * @returns {string} Weather emoji
 */
export const getWeatherEmoji = (conditionText) => {
  if (!conditionText) return '☀️';
  
  const condition = conditionText.toLowerCase();
  
  if (condition.includes('rain') || condition.includes('drizzle')) return '🌧️';
  if (condition.includes('thunder') || condition.includes('storm')) return '⛈️';
  if (condition.includes('snow') || condition.includes('blizzard')) return '❄️';
  if (condition.includes('mist') || condition.includes('fog')) return '🌫️';
  if (condition.includes('cloud')) return '☁️';
  if (condition.includes('sunny') || condition.includes('clear')) return '☀️';
  if (condition.includes('partly')) return '⛅';
  
  return '🌤️';
};

/**
 * Generate weather banner message for dashboard
 * @param {object} weather - Weather data from API
 * @param {number} discountPercent - Applied discount percentage
 * @returns {string} Banner message
 */
export const generateWeatherBanner = (weather, discountPercent) => {
  if (!weather || !weather.current) return '';
  
  const emoji = getWeatherEmoji(weather.current.condition.text);
  const condition = weather.current.condition.text;
  const location = weather.location?.name || 'your city';
  const temp = Math.round(weather.current.temp_c);
  
  if (discountPercent === 15) {
    return `${emoji} ${condition} in ${location} (${temp}°C) – Enjoy 15% Off on all meals!`;
  } else if (discountPercent === 5) {
    return `${emoji} ${condition} in ${location} (${temp}°C) – Get 5% Off on all meals!`;
  } else {
    return `${emoji} ${condition} in ${location} (${temp}°C) – Perfect weather for ordering!`;
  }
};

const weatherService = {
  getCurrentWeather,
  calculateWeatherDiscount,
  applyWeatherPricing,
  getWeatherEmoji,
  generateWeatherBanner
};

export default weatherService;
