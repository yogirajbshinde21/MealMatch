import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService, reviewService } from '../services/api';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meals');

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    setLoading(true);
    try {
      const [restaurantResponse, reviewsResponse] = await Promise.all([
        restaurantService.getRestaurantById(id),
        reviewService.getRestaurantReviews(id)
      ]);
      
      setRestaurant(restaurantResponse.data.restaurant);
      setMeals(restaurantResponse.data.meals || []);
      setReviews(reviewsResponse.data.reviews || []);
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      // Fallback data for demo
      setRestaurant(generateSampleRestaurant());
      setMeals(generateSampleMeals());
      setReviews(generateSampleReviews());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleRestaurant = () => ({
    _id: id,
    name: 'Spice Paradise',
    description: 'Authentic Indian cuisine with a modern twist, serving traditional recipes passed down through generations.',
    cuisine: ['Indian', 'North Indian', 'Punjabi'],
    address: {
      street: '789 Food Street',
      city: 'Mumbai',
      pincode: '400001'
    },
    phone: '+91 98765 43210',
    email: 'contact@spiceparadise.com',
    rating: 4.5,
    totalReviews: 150,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
    deliveryTime: 35,
    deliveryFee: 40,
    isActive: true
  });

  const generateSampleMeals = () => [
    {
      _id: '1',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      price: 320,
      discount: 10,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      restaurant: { _id: id, name: 'Spice Paradise' },
      rating: 4.6,
      totalReviews: 89,
      isVeg: false,
      isAvailable: true
    },
    {
      _id: '2',
      name: 'Paneer Tikka Masala',
      description: 'Grilled cottage cheese in rich spiced gravy',
      price: 280,
      discount: 15,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      restaurant: { _id: id, name: 'Spice Paradise' },
      rating: 4.4,
      totalReviews: 67,
      isVeg: true,
      isAvailable: true
    }
  ];

  const generateSampleReviews = () => [
    {
      _id: 'r1',
      user: { name: 'John Doe' },
      meal: { name: 'Butter Chicken' },
      rating: 5,
      comment: 'Absolutely delicious! The butter chicken was perfect and the delivery was quick.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 'r2',
      user: { name: 'Jane Smith' },
      meal: { name: 'Paneer Tikka Masala' },
      rating: 4,
      comment: 'Great vegetarian option. The paneer was fresh and the spices were well balanced.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'} text-warning`}
      ></i>
    ));
  };

  if (loading) {
    return <LoadingSpinner message="Loading restaurant details..." />;
  }

  if (!restaurant) {
    return (
      <div className="container py-5">
        <div className="empty-state">
          <i className="bi bi-shop-window" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
          <h3 className="mt-3">Restaurant not found</h3>
          <p className="text-muted">The restaurant you're looking for doesn't exist or is no longer available.</p>
          <Link to="/dashboard" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {/* Restaurant Header */}
      <div className="position-relative">
        <div 
          className="restaurant-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${restaurant.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px'
          }}
        >
          <div className="container h-100 d-flex align-items-end">
            <div className="text-white pb-4">
              <h1 className="display-4 fw-bold mb-2">{restaurant.name}</h1>
              <p className="lead mb-3">{restaurant.description}</p>
              <div className="d-flex align-items-center gap-4 flex-wrap">
                <div className="d-flex align-items-center">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  <span className="fw-bold me-1">{restaurant.rating}</span>
                  <span>({restaurant.totalReviews} reviews)</span>
                </div>
                <div>
                  <i className="bi bi-clock me-1"></i>
                  {restaurant.deliveryTime} mins delivery
                </div>
                <div>
                  <i className="bi bi-truck me-1"></i>
                  ₹{restaurant.deliveryFee} delivery fee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Restaurant Info */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Cuisine</h6>
                    <p className="text-muted">
                      {restaurant.cuisine?.join(', ') || 'Various cuisines'}
                    </p>
                    
                    <h6 className="fw-bold">Address</h6>
                    <p className="text-muted">
                      {restaurant.address?.street}<br/>
                      {restaurant.address?.city}, {restaurant.address?.pincode}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Contact</h6>
                    <p className="text-muted">
                      <i className="bi bi-telephone me-2"></i>
                      {restaurant.phone}
                    </p>
                    <p className="text-muted">
                      <i className="bi bi-envelope me-2"></i>
                      {restaurant.email}
                    </p>
                    
                    <div className="d-flex gap-2 mt-3">
                      {restaurant.isActive ? (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Open for delivery
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <i className="bi bi-x-circle me-1"></i>
                          Currently closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body text-center">
                <h6 className="fw-bold">Special Features</h6>
                <div className="d-flex justify-content-around mt-3">
                  <div className="text-center">
                    <i className="bi bi-currency-dollar text-success mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                    <small>Bargain Friendly</small>
                  </div>
                  <div className="text-center">
                    <i className="bi bi-people text-primary mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                    <small>Pool Delivery</small>
                  </div>
                  <div className="text-center">
                    <i className="bi bi-lightning text-warning mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                    <small>Fast Service</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs nav-fill">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'meals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('meals')}
                >
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Menu ({meals.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <i className="bi bi-star me-2"></i>
                  Reviews ({reviews.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row mt-4">
          <div className="col">
            {activeTab === 'meals' && (
              <div>
                {meals.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {meals.map(meal => (
                      <MealCard key={meal._id} meal={meal} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-cup-hot" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                    <h4 className="mt-3">No meals available</h4>
                    <p className="text-muted">This restaurant doesn't have any meals listed yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="row">
                    <div className="col-lg-8">
                      {reviews.map(review => (
                        <div key={review._id} className="card mb-3">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="fw-bold mb-1">{review.user?.name || 'Anonymous'}</h6>
                                <div className="d-flex align-items-center mb-1">
                                  {renderStars(review.rating)}
                                  <span className="ms-2 text-muted">for {review.meal?.name}</span>
                                </div>
                              </div>
                              <small className="text-muted">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                            {review.comment && (
                              <p className="text-muted mb-0">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="col-lg-4">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Rating Breakdown</h6>
                        </div>
                        <div className="card-body">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            
                            return (
                              <div key={star} className="d-flex align-items-center mb-2">
                                <span className="me-2">{star}</span>
                                <i className="bi bi-star-fill text-warning me-2"></i>
                                <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                  <div 
                                    className="progress-bar bg-warning" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <small className="text-muted">{count}</small>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-chat-left-quote" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                    <h4 className="mt-3">No reviews yet</h4>
                    <p className="text-muted">Be the first to review this restaurant after ordering!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
