import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bargainService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const BargainOffers = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responding, setResponding] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [networkStatus, setNetworkStatus] = useState('checking'); // checking, online, offline
  const { user } = useAuth();
  const { cart, addToCart } = useCart(); // Use cart context

  // Check network connectivity
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const response = await fetch('https://mealmatch-backend.onrender.com/api/health', {
          method: 'GET',
          cache: 'no-cache'
        });
        if (response.ok) {
          setNetworkStatus('online');
        } else {
          setNetworkStatus('offline');
        }
      } catch (error) {
        setNetworkStatus('offline');
      }
    };

    checkNetworkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserBargains();
      
      // Auto-refresh bargains every 30 seconds for real-time updates
      const interval = setInterval(() => {
        loadUserBargains();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUserBargains = async () => {
    try {
      setError('');
      const response = await bargainService.getUserBargains(user.id);
      setBargains(response.data.bargains || []);
    } catch (error) {
      console.error('Error loading bargains:', error);
      setError('Failed to load your bargain offers');
      // Fallback to sample data for demo
      setBargains(generateSampleBargains());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleBargains = () => [
    {
      _id: 'bargain1',
      meal: {
        _id: 'meal1',
        name: 'Butter Chicken',
        originalPrice: 350,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200'
      },
      originalPrice: 350,
      proposedPrice: 250,
      counterPrice: 300,
      status: 'countered',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      message: 'We can offer ₹300 for this premium dish'
    },
    {
      _id: 'bargain2',
      meal: {
        _id: 'meal2',
        name: 'Margherita Pizza',
        originalPrice: 320,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200'
      },
      originalPrice: 320,
      proposedPrice: 200,
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      _id: 'bargain3',
      meal: {
        _id: 'meal3',
        name: 'Chicken Biryani',
        originalPrice: 380,
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=200'
      },
      originalPrice: 380,
      proposedPrice: 280,
      status: 'accepted',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      message: 'Great offer! Deal accepted.'
    },
    {
      _id: 'bargain4',
      meal: {
        _id: 'meal4',
        name: 'Veggie Burger',
        originalPrice: 180,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'
      },
      originalPrice: 180,
      proposedPrice: 100,
      status: 'rejected',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      message: 'Sorry, this offer is too low for our costs.'
    }
  ];

  const handleCounterResponse = async (bargainId, response) => {
    setResponding(prev => ({ ...prev, [bargainId]: true }));
    try {
      // Convert 'accept'/'reject' to 'accepted'/'rejected' for backend
      const backendResponse = response === 'accept' ? 'accepted' : 'rejected';
      await bargainService.respondToCounter(bargainId, backendResponse);
      setError('');
      // Refresh bargains to show updated status
      await loadUserBargains();
    } catch (error) {
      console.error('Error responding to counter:', error);
      setError('Failed to respond to counter offer');
    } finally {
      setResponding(prev => ({ ...prev, [bargainId]: false }));
    }
  };

  const handleAddToCart = async (bargain) => {
    console.log('=== ADD TO CART FUNCTION CALLED ===');
    console.log('Bargain object:', bargain);
    console.log('User object:', user);
    
    setAddingToCart(prev => ({ ...prev, [bargain._id]: true }));
    setError('');
    setSuccess('');
    
    try {
      // Extensive validation
      if (!bargain) {
        throw new Error('Bargain object is null or undefined');
      }
      
      if (!bargain.meal) {
        throw new Error('Bargain meal is null or undefined');
      }
      
      if (!bargain.meal._id && !bargain.meal) {
        throw new Error('Bargain meal ID is null or undefined');
      }
      
      if (!user) {
        throw new Error('User is not logged in');
      }
      
      if (!user.id) {
        throw new Error('User ID is null or undefined');
      }
      
      // Get meal ID (handle both object and string references)
      const mealId = typeof bargain.meal === 'object' ? bargain.meal._id : bargain.meal;
      
      if (!mealId) {
        throw new Error('Could not determine meal ID');
      }
      
      const dealPrice = bargain.status === 'counter_accepted' ? bargain.counterPrice : bargain.proposedPrice;
      
      if (!dealPrice || dealPrice <= 0) {
        throw new Error(`Invalid deal price: ${dealPrice}`);
      }
      
      // Check if item is already in cart using cart context
      const existingItem = cart?.items?.find(item => {
        const itemMealId = typeof item.meal === 'object' ? item.meal._id : item.meal;
        return itemMealId === mealId;
      });
      
      if (existingItem) {
        setError(`${bargain.meal.name || 'This item'} is already in your cart!`);
        setTimeout(() => setError(''), 5000);
        return;
      }

      console.log('Adding to cart using cart context...');
      
      // Use cart context addToCart function
      await addToCart(bargain.meal, 1, dealPrice);
      
      // Show success message
      const mealName = bargain.meal.name || 'Item';
      setSuccess(`${mealName} added to cart at deal price of ₹${dealPrice}!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('=== ADD TO CART ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to add item to cart';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear error message after 8 seconds
      setTimeout(() => setError(''), 8000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [bargain._id]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark">⏳ Pending</span>;
      case 'countered':
        return <span className="badge bg-info text-white">🔄 Countered</span>;
      case 'accepted':
        return <span className="badge bg-success">✅ Accepted</span>;
      case 'rejected':
        return <span className="badge bg-danger">❌ Rejected</span>;
      case 'counter_accepted':
        return <span className="badge bg-success">✅ Counter Accepted</span>;
      case 'counter_rejected':
        return <span className="badge bg-danger">❌ Counter Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSavingsAmount = (originalPrice, finalPrice) => {
    return originalPrice - finalPrice;
  };

  const getSavingsPercentage = (originalPrice, finalPrice) => {
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold primary-text">
              <i className="bi bi-currency-exchange me-2"></i>
              My Bargain Offers
            </h4>
            <div className="text-muted">
              <small>{bargains.length} total offers</small>
            </div>
          </div>

          {/* Network Status Indicator */}
          {networkStatus === 'offline' && (
            <div className="alert alert-warning mb-4">
              <i className="bi bi-wifi-off me-2"></i>
              <strong>Connection Issue:</strong> Cannot connect to the server. Please ensure the backend is running on port 5000.
            </div>
          )}



          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex justify-content-between align-items-center" role="alert">
              <div>
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
              <Link to="/cart" className="btn btn-outline-success btn-sm">
                <i className="bi bi-cart me-1"></i>
                View Cart
              </Link>
            </div>
          )}

          {/* Bargain Statistics */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-warning">
                <div className="card-body text-center">
                  <h5 className="fw-bold text-warning">
                    {bargains.filter(b => b.status === 'pending').length}
                  </h5>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info bg-opacity-10 border-info">
                <div className="card-body text-center">
                  <h5 className="fw-bold text-info">
                    {bargains.filter(b => b.status === 'countered').length}
                  </h5>
                  <small className="text-muted">Awaiting Response</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-success">
                <div className="card-body text-center">
                  <h5 className="fw-bold text-success">
                    {bargains.filter(b => b.status === 'accepted' || b.status === 'counter_accepted').length}
                  </h5>
                  <small className="text-muted">Accepted</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-primary bg-opacity-10 border-primary">
                <div className="card-body text-center">
                  <h5 className="fw-bold text-primary">
                    ₹{bargains
                      .filter(b => b.status === 'accepted' || b.status === 'counter_accepted')
                      .reduce((total, b) => {
                        const finalPrice = b.status === 'counter_accepted' ? b.counterPrice : b.proposedPrice;
                        return total + getSavingsAmount(b.originalPrice, finalPrice);
                      }, 0)}
                  </h5>
                  <small className="text-muted">Total Saved</small>
                </div>
              </div>
            </div>
          </div>

          {/* Bargain Offers List */}
          {bargains.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-currency-exchange fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">No bargain offers yet</h5>
              <p className="text-muted">
                Start making offers on meals to see them here!
              </p>
            </div>
          ) : (
            <div className="row">
              {bargains.map((bargain) => (
                <div key={bargain._id} className="col-lg-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      {/* Header with status */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={bargain.meal?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80'}
                            alt={bargain.meal?.name || 'Unknown Meal'}
                            className="rounded me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="fw-bold mb-1">{bargain.meal?.name || 'Unknown Meal'}</h6>
                            <small className="text-muted">{formatDate(bargain.createdAt)}</small>
                          </div>
                        </div>
                        {getStatusBadge(bargain.status)}
                      </div>

                      {/* Price Information */}
                      <div className="row mb-3">
                        <div className="col-4">
                          <div className="text-center">
                            <div className="text-muted small">Original</div>
                            <div className="fw-bold text-decoration-line-through">₹{bargain.originalPrice}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div className="text-muted small">Your Offer</div>
                            <div className="fw-bold text-primary">₹{bargain.proposedPrice}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center">
                            <div className="text-muted small">
                              {bargain.counterPrice ? 'Counter Offer' : 'Final Price'}
                            </div>
                            <div className="fw-bold text-success">
                              ₹{bargain.counterPrice || bargain.proposedPrice}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Savings Display */}
                      {(bargain.status === 'accepted' || bargain.status === 'counter_accepted') && (
                        <div className="alert alert-success py-2 mb-3">
                          <i className="bi bi-piggy-bank me-2"></i>
                          <strong>You saved ₹{getSavingsAmount(
                            bargain.originalPrice, 
                            bargain.status === 'counter_accepted' ? bargain.counterPrice : bargain.proposedPrice
                          )} ({getSavingsPercentage(
                            bargain.originalPrice, 
                            bargain.status === 'counter_accepted' ? bargain.counterPrice : bargain.proposedPrice
                          )}%)</strong>
                        </div>
                      )}

                      {/* Admin Message */}
                      {bargain.message && (
                        <div className="alert alert-info py-2 mb-3">
                          <i className="bi bi-chat-quote me-2"></i>
                          <strong>Admin:</strong> {bargain.message}
                        </div>
                      )}

                      {/* Action Buttons for Countered Status */}
                      {bargain.status === 'countered' && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-fill"
                            disabled={responding[bargain._id]}
                            onClick={() => handleCounterResponse(bargain._id, 'accept')}
                          >
                            {responding[bargain._id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-1"></i>
                                Accept ₹{bargain.counterPrice}
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-outline-danger flex-fill"
                            disabled={responding[bargain._id]}
                            onClick={() => handleCounterResponse(bargain._id, 'reject')}
                          >
                            {responding[bargain._id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-x-circle me-1"></i>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Status-specific messages */}
                      {bargain.status === 'pending' && (
                        <div className="text-center text-muted">
                          <i className="bi bi-clock me-1"></i>
                          Waiting for admin response...
                        </div>
                      )}

                      {bargain.status === 'rejected' && (
                        <div className="text-center text-muted">
                          <i className="bi bi-x-circle me-1"></i>
                          Offer was declined
                        </div>
                      )}

                      {(bargain.status === 'accepted' || bargain.status === 'counter_accepted') && (
                        <div className="text-center mt-3">
                          {(() => {
                            const isInCart = cart?.items?.some(item => 
                              item.meal?._id === bargain.meal._id || item.meal === bargain.meal._id
                            );
                            const dealPrice = bargain.status === 'counter_accepted' ? bargain.counterPrice : bargain.proposedPrice;
                            
                            if (isInCart) {
                              return (
                                <div>
                                  <button className="btn btn-success btn-lg w-100 mb-2" disabled>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Already in Cart
                                  </button>
                                  <Link to="/cart" className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-cart me-1"></i>
                                    View Cart
                                  </Link>
                                </div>
                              );
                            }
                            
                            // Check if network is offline
                            if (networkStatus === 'offline') {
                              return (
                                <button className="btn btn-secondary btn-lg w-100" disabled>
                                  <i className="bi bi-wifi-off me-2"></i>
                                  Server Offline
                                </button>
                              );
                            }
                            
                            return (
                              <button 
                                className={`btn btn-primary btn-lg w-100 ${addingToCart[bargain._id] ? 'disabled' : ''}`}
                                disabled={addingToCart[bargain._id] || networkStatus === 'offline'}
                                onClick={() => {
                                  console.log('Button clicked for bargain:', bargain._id);
                                  handleAddToCart(bargain);
                                }}
                                style={{
                                  transition: 'all 0.2s ease',
                                  transform: addingToCart[bargain._id] ? 'scale(0.98)' : 'scale(1)',
                                  cursor: addingToCart[bargain._id] ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {addingToCart[bargain._id] ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </span>
                                    Adding to Cart...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-cart-plus me-2"></i>
                                    Add to Cart at Deal Price ₹{dealPrice}
                                  </>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BargainOffers;
