import React, { useState, useEffect } from 'react';
import { mealService, restaurantService, reviewService } from '../services/api';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherBanner from '../components/WeatherBanner';

const Dashboard = () => {
  const [meals, setMeals] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    isVeg: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Update review counts first
      try {
        await reviewService.updateMealReviewCounts();
      } catch (error) {
        console.warn('Failed to update review counts:', error);
      }
      
      // Load meals and restaurants in parallel
      const [mealsResponse, restaurantsResponse] = await Promise.all([
        mealService.getAllMeals(),
        restaurantService.getAllRestaurants()
      ]);
      
      setMeals(mealsResponse.data.meals || []);
      setRestaurants(restaurantsResponse.data.restaurants || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback data for demo
      setMeals(generateSampleMeals());
      setRestaurants(generateSampleRestaurants());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    try {
      const response = await mealService.searchMeals(query);
      setSearchResults(response.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback search
      const filteredMeals = meals.filter(meal =>
        meal.name.toLowerCase().includes(query.toLowerCase()) ||
        meal.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults({ meals: filteredMeals, restaurants: [] });
      setShowSearchDropdown(true);
    }
  };

  const applyFilters = () => {
    let filteredMeals = meals;

    if (filters.category) {
      filteredMeals = filteredMeals.filter(meal => 
        meal.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.isVeg !== '') {
      filteredMeals = filteredMeals.filter(meal => 
        meal.isVeg === (filters.isVeg === 'true')
      );
    }

    if (filters.minPrice) {
      filteredMeals = filteredMeals.filter(meal => 
        meal.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filteredMeals = filteredMeals.filter(meal => 
        meal.price <= parseFloat(filters.maxPrice)
      );
    }

    return filteredMeals;
  };

  const generateSampleMeals = () => [
    {
      _id: '1',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      price: 320,
      discount: 10,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      restaurant: { _id: 'r1', name: 'Spice Paradise' },
      rating: 4.6,
      totalReviews: 89,
      tags: ['spicy', 'creamy', 'popular'],
      preparationTime: 25,
      isVeg: false,
      isAvailable: true
    },
    {
      _id: '2',
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
      price: 350,
      discount: 20,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      restaurant: { _id: 'r2', name: 'Pizza Corner' },
      rating: 4.5,
      totalReviews: 123,
      tags: ['classic', 'vegetarian', 'cheese'],
      preparationTime: 15,
      isVeg: true,
      isAvailable: true
    },
    {
      _id: '3',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheese, lettuce, and tomato',
      price: 220,
      discount: 25,
      category: 'Burger',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      restaurant: { _id: 'r3', name: 'Burger Junction' },
      rating: 4.2,
      totalReviews: 156,
      tags: ['classic', 'beef', 'cheese'],
      preparationTime: 8,
      isVeg: false,
      isAvailable: true
    }
  ];

  const generateSampleRestaurants = () => [
    {
      _id: 'r1',
      name: 'Spice Paradise',
      rating: 4.5,
      totalReviews: 150,
      cuisine: ['Indian', 'North Indian'],
      deliveryTime: 35
    },
    {
      _id: 'r2',
      name: 'Pizza Corner',
      rating: 4.2,
      totalReviews: 89,
      cuisine: ['Italian', 'Pizza'],
      deliveryTime: 25
    }
  ];

  const displayMeals = searchResults ? searchResults.meals : applyFilters();

  if (loading) {
    return <LoadingSpinner message="Loading delicious meals..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container py-4">
        {/* Weather Banner */}
        <WeatherBanner />
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-6 fw-bold primary-text">
              <i className="bi bi-shop me-2"></i>
              Discover Amazing Food
            </h1>
            <p className="lead text-muted">
              Use Bargain Bites to negotiate prices or enjoy Weather Pricing for automatic discounts!
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-lg-8 mx-auto">
            <div className="position-relative">
              <div className="input-group input-group-lg">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for restaurants, dishes, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  onFocus={() => searchResults && setShowSearchDropdown(true)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(null);
                      setShowSearchDropdown(false);
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults && (
                <div className="search-results">
                  {searchResults.meals.length > 0 && (
                    <div>
                      <div className="px-3 py-2 bg-light border-bottom">
                        <strong>Meals</strong>
                      </div>
                      {searchResults.meals.slice(0, 3).map(meal => (
                        <div
                          key={meal._id}
                          className="search-result-item d-flex align-items-center"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            // Scroll to meal or handle selection
                          }}
                        >
                          <img
                            src={meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50'}
                            alt={meal.name}
                            className="rounded me-3"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold">{meal.name}</div>
                            <small className="text-muted">₹{meal.price} • {meal.restaurant?.name}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.restaurants.length > 0 && (
                    <div>
                      <div className="px-3 py-2 bg-light border-bottom">
                        <strong>Restaurants</strong>
                      </div>
                      {searchResults.restaurants.slice(0, 2).map(restaurant => (
                        <div
                          key={restaurant._id}
                          className="search-result-item"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            // Navigate to restaurant page
                          }}
                        >
                          <div className="fw-semibold">{restaurant.name}</div>
                          <small className="text-muted">
                            {restaurant.cuisine?.join(', ')} • {restaurant.deliveryTime} mins
                          </small>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.meals.length === 0 && searchResults.restaurants.length === 0 && (
                    <div className="search-result-item text-center text-muted">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col">
            <div className="card">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-2">
                    <label className="form-label small">Category</label>
                    <select
                      className="form-select"
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                      <option value="">All Categories</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Burger">Burger</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label small">Diet</label>
                    <select
                      className="form-select"
                      value={filters.isVeg}
                      onChange={(e) => setFilters({...filters, isVeg: e.target.value})}
                    >
                      <option value="">All</option>
                      <option value="true">Vegetarian</option>
                      <option value="false">Non-Vegetarian</option>
                    </select>
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label small">Min Price</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="₹0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label small">Max Price</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="₹1000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', isVeg: '' })}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Restaurants */}
        {!searchResults && restaurants.length > 0 && (
          <div className="row mb-5">
            <div className="col">
              <h3 className="fw-bold mb-3">Popular Restaurants</h3>
              <div className="row g-3">
                {restaurants.slice(0, 4).map(restaurant => (
                  <div key={restaurant._id} className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <h5 className="fw-bold">{restaurant.name}</h5>
                        <div className="d-flex justify-content-center align-items-center mb-2">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <span>{restaurant.rating}</span>
                          <span className="text-muted ms-1">({restaurant.totalReviews})</span>
                        </div>
                        <p className="text-muted small">
                          {restaurant.cuisine?.join(', ')}
                        </p>
                        <div className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {restaurant.deliveryTime} mins
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Meals Grid */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold">
                {searchResults ? `Search Results (${displayMeals.length})` : 'Available Meals'}
              </h3>
              <div className="text-muted">
                {displayMeals.length} meals found
              </div>
            </div>
          </div>
        </div>

        {displayMeals.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {displayMeals.map(meal => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="bi bi-search" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
            <h4 className="mt-3">No meals found</h4>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
                setFilters({ category: '', minPrice: '', maxPrice: '', isVeg: '' });
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Features Highlight */}
        <div className="row mt-5">
          <div className="col">
            <div className="card primary-color text-white">
              <div className="card-body py-4">
                <div className="row text-center">
                  <div className="col-md-4">
                    <i className="bi bi-currency-dollar mb-2" style={{ fontSize: '2rem' }}></i>
                    <h5>Bargain Bites</h5>
                    <p className="small mb-0">Negotiate prices in real-time with restaurants</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-cloud-sun mb-2" style={{ fontSize: '2rem' }}></i>
                    <h5>Weather Pricing</h5>
                    <p className="small mb-0">Dynamic discounts based on current weather conditions</p>
                  </div>
                  <div className="col-md-4">
                    <i className="bi bi-lightning-charge mb-2" style={{ fontSize: '2rem' }}></i>
                    <h5>Fast Delivery</h5>
                    <p className="small mb-0">Quick and reliable food delivery service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
