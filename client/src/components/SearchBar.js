import React, { useState, useEffect, useRef } from 'react';
import { mealService } from '../services/api';

const SearchBar = ({ onSearch, placeholder = "Search for restaurants, dishes, or cuisines..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await mealService.searchMeals(query);
      const suggestions = [
        ...response.data.meals.slice(0, 3).map(meal => ({
          type: 'meal',
          id: meal._id,
          name: meal.name,
          subtitle: meal.restaurant.name,
          price: meal.price
        })),
        ...response.data.restaurants.slice(0, 2).map(restaurant => ({
          type: 'restaurant',
          id: restaurant._id,
          name: restaurant.name,
          subtitle: restaurant.cuisine?.join(', ') || 'Restaurant',
          rating: restaurant.rating
        }))
      ];
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fallback to simple filtering
      const sampleSuggestions = [
        { type: 'meal', name: 'Butter Chicken', subtitle: 'Spice Paradise', price: 320 },
        { type: 'meal', name: 'Margherita Pizza', subtitle: 'Pizza Corner', price: 350 },
        { type: 'restaurant', name: 'Burger Junction', subtitle: 'American, Fast Food', rating: 4.2 }
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(sampleSuggestions);
      setShowSuggestions(sampleSuggestions.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery = query) => {
    onSearch(searchQuery);
    setShowSuggestions(false);
    setQuery(searchQuery);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    handleSearch(suggestion.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="search-bar position-relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="input-group input-group-lg">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            style={{ 
              boxShadow: 'none',
              borderColor: '#dee2e6'
            }}
          />
          {query && (
            <button
              type="button"
              className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={() => {
                setQuery('');
                handleSearch('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              style={{ zIndex: 10 }}
            >
              <i className="bi bi-x-circle text-muted"></i>
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="search-results position-absolute w-100 mt-1">
          {loading ? (
            <div className="search-result-item text-center">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Searching...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="search-result-item d-flex align-items-center"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="me-3">
                  {suggestion.type === 'meal' ? (
                    <i className="bi bi-cup-hot text-primary"></i>
                  ) : (
                    <i className="bi bi-shop text-success"></i>
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{suggestion.name}</div>
                  <small className="text-muted">{suggestion.subtitle}</small>
                </div>
                <div className="text-end">
                  {suggestion.type === 'meal' ? (
                    <small className="text-primary fw-bold">₹{suggestion.price}</small>
                  ) : (
                    <div className="d-flex align-items-center">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      <small>{suggestion.rating}</small>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* View All Results */}
          {query && !loading && (
            <div 
              className="search-result-item text-center border-top"
              onClick={() => handleSearch()}
            >
              <i className="bi bi-search me-2"></i>
              <strong>View all results for "{query}"</strong>
            </div>
          )}
        </div>
      )}

      {/* Popular Searches */}
      {!query && !showSuggestions && (
        <div className="mt-2">
          <small className="text-muted">Popular searches:</small>
          <div className="d-flex gap-2 flex-wrap mt-1">
            {['Pizza', 'Burger', 'Chinese', 'North Indian', 'Desserts'].map((term, index) => (
              <button
                key={index}
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleSearch(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
