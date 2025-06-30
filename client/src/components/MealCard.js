import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWeather } from '../context/WeatherContext';
import BargainForm from './BargainForm';

const MealCard = ({ meal, showBargain = true }) => {
  const [showBargainForm, setShowBargainForm] = useState(false);
  const { addToCart, loading } = useCart();
  const { applyWeatherPricing, hasDiscount, discountPercent } = useWeather();

  const handleAddToCart = async () => {
    // Pass weather discount info to maintain consistent pricing in cart
    const weatherInfo = hasDiscount ? {
      discountPercent: discountPercent,
      finalPrice: Math.round(finalPrice),
      originalPrice: basePrice
    } : null;
    
    await addToCart(meal, 1, null, weatherInfo);
  };

  const handleBargainSuccess = async (bargainPrice) => {
    // Always use base price for bargaining, not weather-adjusted price
    await addToCart(meal, 1, bargainPrice);
    setShowBargainForm(false);
  };

  // Apply weather-based pricing to the base meal price
  const basePrice = meal.price; // Original restaurant price
  const weatherPricing = applyWeatherPricing(basePrice);
  
  // If meal has its own restaurant discount, apply it to the weather-adjusted price
  const restaurantDiscountAmount = meal.discount ? (weatherPricing.finalPrice * meal.discount / 100) : 0;
  const finalPrice = weatherPricing.finalPrice - restaurantDiscountAmount;
  
  // Calculate total savings (weather + restaurant discount)
  const totalSavings = basePrice - finalPrice;

  return (
    <div className="col">
      <div className="card meal-card h-100">
        {/* Meal Image */}
        <div className="position-relative">
          <img 
            src={meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop'} 
            className="card-img-top" 
            alt={meal.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
          
          {/* Badges */}
          <div className="position-absolute top-0 start-0 p-2">
            {meal.isVeg && (
              <span className="badge bg-success me-1">
                <i className="bi bi-circle-fill"></i> Veg
              </span>
            )}
            {meal.discount > 0 && (
              <span className="discount-badge">
                {meal.discount}% OFF
              </span>
            )}
            {hasDiscount && (
              <span className="badge bg-info me-1">
                <i className="bi bi-cloud-rain"></i> Weather {discountPercent}%
              </span>
            )}
            {meal.discount > 0 && (
              <span className="badge bg-warning me-1">
                <i className="bi bi-tag"></i> Restaurant {meal.discount}%
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="position-absolute top-0 end-0 p-2">
            <span className="badge bg-white text-dark">
              <i className="bi bi-star-fill rating-stars me-1"></i>
              {meal.rating || 4.0}
            </span>
          </div>
        </div>

        <div className="card-body d-flex flex-column">
          {/* Restaurant Info */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <small className="text-muted">
              {meal.restaurant?.name || 'Restaurant'}
            </small>
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {meal.preparationTime || 20} mins
            </small>
          </div>

          {/* Meal Name */}
          <h5 className="card-title fw-bold mb-2">{meal.name}</h5>
          
          {/* Description */}
          <p className="card-text text-muted small mb-3">
            {meal.description}
          </p>

          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <div className="mb-3">
              {meal.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="badge bg-light text-dark me-1 small">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price Section */}
          <div className="mt-auto">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="price-tag primary-text fs-4 fw-bold">
                    ₹{Math.round(finalPrice)}
                  </span>
                  {totalSavings > 0 && (
                    <span className="text-muted text-decoration-line-through fs-6">
                      ₹{basePrice}
                    </span>
                  )}
                  {totalSavings > 0 && (
                    <span className="badge bg-success fs-6">
                      SAVE ₹{Math.round(totalSavings)}
                    </span>
                  )}
                </div>
                
                {/* Discount Breakdown */}
                <div className="small">
                  {hasDiscount && (
                    <div className="text-success">
                      <i className="bi bi-cloud-rain me-1"></i>
                      Weather discount: ₹{Math.round(weatherPricing.discountAmount)}
                    </div>
                  )}
                  {meal.discount > 0 && (
                    <div className="text-info">
                      <i className="bi bi-tag me-1"></i>
                      Restaurant discount: ₹{Math.round(restaurantDiscountAmount)}
                    </div>
                  )}
                  {!hasDiscount && !meal.discount && (
                    <div className="text-muted small">
                      Regular pricing
                    </div>
                  )}
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted">
                  {meal.totalReviews || 0} reviews
                </small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={loading || !meal.isAvailable}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-cart-plus me-2"></i>
                )}
                Add to Cart
              </button>

              {showBargain && meal.isAvailable && (
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setShowBargainForm(true)}
                >
                  <i className="bi bi-currency-dollar me-1"></i>
                  Bargain from ₹{basePrice}
                </button>
              )}
            </div>

            {/* Availability Status */}
            {!meal.isAvailable && (
              <div className="text-center mt-2">
                <small className="text-danger">
                  <i className="bi bi-x-circle me-1"></i>
                  Currently Unavailable
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bargain Form Modal */}
      {showBargainForm && (
        <BargainForm
          meal={meal}
          onClose={() => setShowBargainForm(false)}
          onSuccess={handleBargainSuccess}
        />
      )}
    </div>
  );
};

export default MealCard;
