import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService, reviewService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BargainOffers from '../components/BargainOffers';
import OrderTracker from '../components/OrderTracker';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'bargains'
  const [countdowns, setCountdowns] = useState({}); // Store countdown timers for each order
  const [showReviewForm, setShowReviewForm] = useState(null); // Order ID for which to show review form
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [trackingOrder, setTrackingOrder] = useState(null); // Order being tracked
  const [showTracker, setShowTracker] = useState(false); // Show/hide tracker modal
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders(user.id);
      
      // Check if backend is in mock mode
      if (response.data?.mockMode || !response.data?.orders) {
        console.log('OrderHistory: Backend in mock mode, loading from localStorage');
        // Load orders from localStorage for mock users
        const localOrders = localStorage.getItem(`orders_${user.id}`);
        if (localOrders) {
          try {
            const parsedOrders = JSON.parse(localOrders);
            setOrders(parsedOrders || []);
          } catch (parseError) {
            console.error('Error parsing localStorage orders:', parseError);
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      } else {
        // Backend returned real orders
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to localStorage for any error
      const localOrders = localStorage.getItem(`orders_${user.id}`);
      if (localOrders) {
        try {
          const parsedOrders = JSON.parse(localOrders);
          setOrders(parsedOrders || []);
        } catch (parseError) {
          console.error('Error parsing localStorage orders:', parseError);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  // Update countdown timers and automatically mark orders as delivered
  const updateCountdowns = React.useCallback(() => {
    const now = new Date().getTime();
    const newCountdowns = {};
    const updatedOrders = [...orders];
    let ordersChanged = false;

    orders.forEach((order, index) => {
      if (order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed') {
        const deliveryTime = new Date(order.estimatedDeliveryTime).getTime();
        const timeLeft = deliveryTime - now;

        if (timeLeft > 0) {
          // Calculate minutes and seconds left
          const minutesLeft = Math.floor(timeLeft / (1000 * 60));
          const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
          newCountdowns[order._id] = { minutes: minutesLeft, seconds: secondsLeft };
        } else {
          // Time is up, mark as delivered
          updatedOrders[index] = {
            ...order,
            orderStatus: 'Delivered',
            status: 'delivered',
            actualDeliveryTime: new Date()
          };
          ordersChanged = true;
        }
      }
    });

    setCountdowns(newCountdowns);

    // Update orders if any were marked as delivered
    if (ordersChanged) {
      setOrders(updatedOrders);
      // Update localStorage for mock users
      if (user.id.startsWith('user-') || user.id.startsWith('demo-') || user.id.startsWith('admin-')) {
        localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
      }
    }
  }, [orders, user.id]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [updateCountdowns]);

  // Handle review submission
  const handleReviewSubmit = async (orderId) => {
    if (!reviewData.rating) {
      alert('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const order = orders.find(o => o._id === orderId);
      
      // Submit review for each meal in the order
      for (const item of order.items) {
        const reviewPayload = {
          userId: user.id,
          mealId: item.meal._id,
          orderId: orderId,
          rating: reviewData.rating,
          comment: reviewData.comment
        };
        
        try {
          await reviewService.createReview(reviewPayload);
        } catch (error) {
          console.warn('API review failed, updating locally:', error);
        }
      }

      // Update meal review counts
      try {
        await reviewService.updateMealReviewCounts();
      } catch (error) {
        console.warn('Failed to update meal review counts:', error);
      }

      // Update the order with review status
      const updatedOrders = orders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            review: {
              rating: reviewData.rating,
              comment: reviewData.comment,
              reviewed: true,
              reviewedAt: new Date()
            }
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      
      // Update localStorage for mock users
      if (user.id.startsWith('user-') || user.id.startsWith('demo-') || user.id.startsWith('admin-')) {
        localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
      }

      // Reset review form
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
      
      alert('Thank you for your review! 🌟');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle reorder functionality
  const handleReorder = async (order) => {
    try {
      console.log('Reordering:', order);
      
      // Add each item from the order to cart
      for (const item of order.items) {
        await addToCart(item.meal, item.quantity, null);
      }
      
      alert('Items added to cart! Redirecting to cart...');
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  // Handle rate order from tracker modal
  const handleRateOrderFromTracker = (order) => {
    setShowReviewForm(order._id);
  };

  // Handle track order
  const handleTrackOrder = (order) => {
    setTrackingOrder(order);
    setShowTracker(true);
  };

  // Close tracker modal
  const closeTracker = () => {
    setShowTracker(false);
    setTrackingOrder(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'out for delivery': return 'status-out_for_delivery';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'bi-clock';
      case 'confirmed': return 'bi-check-circle';
      case 'preparing': return 'bi-fire';
      case 'out for delivery': return 'bi-truck';
      case 'delivered': return 'bi-check-circle-fill';
      case 'cancelled': return 'bi-x-circle';
      default: return 'bi-clock';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  return (
    <div className="order-history-page">
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold primary-text">
                <i className="bi bi-clock-history me-2"></i>
                My Account
              </h2>
              <Link to="/dashboard" className="btn btn-outline-primary">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Menu
              </Link>
            </div>
            
            {/* Tabs Navigation */}
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-bag-check me-2"></i>
                  Order History
                  {orders.length > 0 && (
                    <span className="badge bg-primary ms-2">{orders.length}</span>
                  )}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'bargains' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bargains')}
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-currency-exchange me-2"></i>
                  Bargain Offers
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-pane fade show active">
              {loading ? (
                <LoadingSpinner message="Loading your orders..." />
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-bag-x" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <h3 className="mt-3">No orders yet</h3>
                  <p className="text-muted">You haven't placed any orders yet. Start exploring delicious meals!</p>
                  <Link to="/dashboard" className="btn btn-primary">
                    <i className="bi bi-shop me-2"></i>
                    Start Ordering
                  </Link>
                </div>
              ) : (
          <div className="row">
            {/* Orders List */}
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Your Orders ({orders.length})</h4>
                <div className="dropdown">
                  <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="bi bi-filter me-1"></i>
                    Filter
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item" type="button">All Orders</button></li>
                    <li><button className="dropdown-item" type="button">Delivered</button></li>
                    <li><button className="dropdown-item" type="button">In Progress</button></li>
                    <li><button className="dropdown-item" type="button">Cancelled</button></li>
                  </ul>
                </div>
              </div>

              {orders.map(order => (
                <div key={order._id} className="card mb-3">
                  <div className="card-body">
                    {/* Order Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">Order #{order._id.slice(-6)}</h6>
                        <small className="text-muted">{formatDate(order.createdAt || order.orderPlacedTime)}</small>
                      </div>
                      <div className="text-end">
                        <span className={`order-status ${getStatusBadgeClass(order.orderStatus || order.status)}`}>
                          <i className={`bi ${getStatusIcon(order.orderStatus || order.status)} me-1`}></i>
                          {order.orderStatus || formatStatus(order.status)}
                        </span>
                        
                        {/* Countdown Timer for active orders */}
                        {(order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed') && countdowns[order._id] && (
                          <div className="mt-2">
                            <div className="badge bg-info">
                              <i className="bi bi-clock me-1"></i>
                              Arriving in ~{countdowns[order._id].minutes}m {countdowns[order._id].seconds}s
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="row">
                      <div className="col-md-8">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="d-flex align-items-center mb-2">
                            <img
                              src={item.meal?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50'}
                              alt={item.meal?.name || 'Unknown Item'}
                              className="rounded me-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{item.meal?.name || 'Unknown Item'}</div>
                              <small className="text-muted">Qty: {item.quantity} × ₹{item.price}</small>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <small className="text-muted">+{order.items.length - 2} more items</small>
                        )}
                      </div>

                      <div className="col-md-4 text-md-end">
                        <div className="fw-bold fs-5 primary-text mb-2">
                          ₹{order.totalAmount}
                        </div>
                        
                        {/* Estimated delivery time */}
                        {order.estimatedDeliveryMinutes && (
                          <div className="badge bg-secondary mb-1 d-block">
                            <i className="bi bi-clock me-1"></i>
                            ETA: {order.estimatedDeliveryMinutes} mins
                          </div>
                        )}
                        
                        {/* Savings indicators */}
                        {order.items.some(item => item.bargainPrice) && (
                          <div className="badge bg-warning text-dark mb-1 d-block">
                            <i className="bi bi-currency-dollar me-1"></i>
                            Bargain Deal
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Section - Show after delivery */}
                    {order.orderStatus === 'Delivered' && !order.review?.reviewed && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6 className="fw-bold mb-3">
                          <i className="bi bi-star me-2 text-warning"></i>
                          Rate Your Experience
                        </h6>
                        
                        {showReviewForm === order._id ? (
                          <div>
                            <div className="mb-3">
                              <label className="form-label">Rating</label>
                              <div className="d-flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={`btn btn-sm ${reviewData.rating >= star ? 'btn-warning' : 'btn-outline-warning'}`}
                                    onClick={() => setReviewData({...reviewData, rating: star})}
                                  >
                                    <i className="bi bi-star-fill"></i>
                                  </button>
                                ))}
                              </div>
                              <small className="text-muted">Selected: {reviewData.rating} stars</small>
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Review (Optional)</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Tell us about your experience..."
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                maxLength="500"
                              />
                              <small className="text-muted">{reviewData.comment.length}/500 characters</small>
                            </div>
                            
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleReviewSubmit(order._id)}
                                disabled={submittingReview}
                              >
                                {submittingReview ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check me-1"></i>
                                    Submit Review
                                  </>
                                )}
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowReviewForm(null)}
                                disabled={submittingReview}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => setShowReviewForm(order._id)}
                          >
                            <i className="bi bi-star me-1"></i>
                            Write Review
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Show existing review */}
                    {order.review?.reviewed && (
                      <div className="mt-3 p-3 bg-success bg-opacity-10 rounded">
                        <h6 className="fw-bold mb-2 text-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Your Review
                        </h6>
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <i
                                key={star}
                                className={`bi bi-star-fill ${star <= order.review.rating ? 'text-warning' : 'text-muted'}`}
                              ></i>
                            ))}
                          </div>
                          <small className="text-muted">
                            Reviewed on {formatDate(order.review.reviewedAt)}
                          </small>
                        </div>
                        {order.review.comment && (
                          <p className="mb-0 text-muted">"{order.review.comment}"</p>
                        )}
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </button>
                      
                      {order.orderStatus === 'Delivered' && (
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleReorder(order)}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i>
                          Reorder
                        </button>
                      )}
                      
                      {(order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed' || order.orderStatus === 'Preparing' || order.orderStatus === 'On the Way') && (
                        <button 
                          className="btn btn-outline-info btn-sm" 
                          onClick={() => handleTrackOrder(order)}
                        >
                          <i className="bi bi-geo-alt me-1"></i>
                          Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="col-lg-4">
              <div className="card sticky-top" style={{ top: '100px' }}>
                <div className="card-header">
                  <h6 className="mb-0">Order Statistics</h6>
                </div>
                <div className="card-body">
                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <div className="fw-bold fs-4 primary-text">{orders.length}</div>
                      <small className="text-muted">Total Orders</small>
                    </div>
                    <div className="col-6">
                      <div className="fw-bold fs-4 text-success">
                        {orders.filter(o => o.status === 'delivered').length}
                      </div>
                      <small className="text-muted">Delivered</small>
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <div className="fw-bold fs-5 text-warning">
                      ₹{orders.reduce((total, order) => total + order.totalAmount, 0)}
                    </div>
                    <small className="text-muted">Total Spent</small>
                  </div>

                  {/* Savings Summary */}
                  <div className="border-top pt-3">
                    <h6 className="fw-bold mb-2">Your Savings</h6>
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span className="small">Bargain Savings:</span>
                      <span className="small text-success">
                        ₹{orders.filter(o => o.items.some(item => item.price < 300)).length * 50}
                      </span>
                    </div>
                    
                    <hr className="my-2" />
                    
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total Saved:</span>
                      <span className="text-success">
                        ₹{orders.filter(o => o.items.some(item => item.price < 300)).length * 50}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              )}
            </div>
          )}

          {/* Bargains Tab */}
          {activeTab === 'bargains' && (
            <div className="tab-pane fade show active">
              <BargainOffers />
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Order Details #{selectedOrder._id.slice(-6)}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSelectedOrder(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Order Status */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h6 className="fw-bold">Order Status</h6>
                      <span className={`order-status ${getStatusBadgeClass(selectedOrder.status)}`}>
                        <i className={`bi ${getStatusIcon(selectedOrder.status)} me-1`}></i>
                        {formatStatus(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Ordered on</div>
                      <div className="fw-semibold">{formatDate(selectedOrder.createdAt)}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <h6 className="fw-bold mb-3">Items Ordered</h6>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <img
                          src={item.meal?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'}
                          alt={item.meal?.name || 'Unknown Item'}
                          className="rounded me-3"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-semibold">{item.meal?.name || 'Unknown Item'}</div>
                          <div className="text-muted small">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">₹{item.price * item.quantity}</div>
                        <div className="text-muted small">₹{item.price} each</div>
                      </div>
                    </div>
                  ))}

                  {/* Bill Details */}
                  <div className="border-top pt-3">
                    <h6 className="fw-bold mb-3">Bill Details</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Item Total</span>
                      <span>₹{selectedOrder.totalAmount - (selectedOrder.deliveryPool?.feePerOrder || selectedOrder.deliveryFee || 50)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Delivery Fee</span>
                      <span>₹{selectedOrder.deliveryFee || 50}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total Paid</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedOrder.status === 'delivered' && (
                    <>
                      <button className="btn btn-outline-warning">
                        <i className="bi bi-star me-1"></i>
                        Rate & Review
                      </button>
                      <button className="btn btn-primary">
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Reorder
                      </button>
                    </>
                  )}
                  <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Tracker Modal - new integrated modal */}
        {showTracker && trackingOrder && (
          <OrderTracker 
            order={trackingOrder}
            isOpen={showTracker}
            onClose={closeTracker}
            onRateOrder={handleRateOrderFromTracker}
          />
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
