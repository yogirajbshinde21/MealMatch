import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bargainService } from '../services/api';
import io from 'socket.io-client';

const BargainForm = ({ meal, onClose, onSuccess }) => {
  const [proposedPrice, setProposedPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [bargainStatus, setBargainStatus] = useState(null);
  const [notification, setNotification] = useState('');

  const { user } = useAuth();

  // Calculate minimum price (50% of original)
  const minPrice = Math.ceil(meal.price * 0.5);
  const maxSavings = meal.price - minPrice;

  useEffect(() => {
    // Initialize socket connection for real-time bargaining
    const socketUrl = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Join user room for bargain updates
    newSocket.emit('join-user-room', user.id);

    // Listen for bargain updates
    newSocket.on('bargain-update', (data) => {
      setBargainStatus(data.bargain);
      setNotification(data.message);
    });

    newSocket.on('bargain-created', (data) => {
      setBargainStatus(data.bargain);
      setNotification('Bargain offer sent! Waiting for restaurant response...');
    });

    newSocket.on('bargain-error', (data) => {
      setError(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const price = parseFloat(proposedPrice);

    // Validation
    if (price < minPrice) {
      setError(`Minimum bargain price is ₹${minPrice}`);
      setLoading(false);
      return;
    }

    if (price >= meal.price) {
      setError('Proposed price should be less than the original price');
      setLoading(false);
      return;
    }

    try {
      // Emit bargain through socket for real-time handling
      socket.emit('new-bargain', {
        userId: user.id,
        mealId: meal._id,
        restaurantId: meal.restaurant._id || meal.restaurant,
        originalPrice: meal.price,
        proposedPrice: price,
        message
      });

    } catch (error) {
      setError('Failed to send bargain offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async () => {
    if (bargainStatus) {
      try {
        await bargainService.respondToCounter(bargainStatus._id, 'accepted');
        onSuccess(bargainStatus.counterPrice);
      } catch (error) {
        setError('Failed to accept counter offer');
      }
    }
  };

  const handleRejectCounter = async () => {
    if (bargainStatus) {
      try {
        await bargainService.respondToCounter(bargainStatus._id, 'rejected');
        setBargainStatus(null); // Allow new bargain
        setNotification('Counter offer rejected. You can make a new offer.');
      } catch (error) {
        setError('Failed to reject counter offer');
      }
    }
  };

  const calculateSavings = () => {
    const price = parseFloat(proposedPrice) || 0;
    return meal.price - price;
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-currency-dollar text-success me-2"></i>
              Bargain for {meal.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Notification */}
            {notification && (
              <div className="alert alert-info alert-dismissible fade show">
                <i className="bi bi-info-circle me-2"></i>
                {notification}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setNotification('')}
                ></button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Meal Info */}
            <div className="row mb-4">
              <div className="col-4">
                <img 
                  src={meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} 
                  alt={meal.name}
                  className="img-fluid rounded"
                />
              </div>
              <div className="col-8">
                <h6 className="fw-bold">{meal.name}</h6>
                <p className="text-muted small mb-2">{meal.description}</p>
                <div className="d-flex justify-content-between">
                  <span><strong>Original Price:</strong> ₹{meal.price}</span>
                  <span><strong>Min. Price:</strong> ₹{minPrice}</span>
                </div>
              </div>
            </div>

            {/* Bargain Status */}
            {bargainStatus && (
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Bargain Status</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Status:</span>
                    <span className={`badge ${
                      bargainStatus.status === 'accepted' ? 'bg-success' :
                      bargainStatus.status === 'rejected' ? 'bg-danger' :
                      bargainStatus.status === 'countered' ? 'bg-warning' :
                      'bg-secondary'
                    }`}>
                      {bargainStatus.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {bargainStatus.status === 'countered' && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between">
                        <span>Your Offer:</span>
                        <span>₹{bargainStatus.proposedPrice}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span><strong>Counter Offer:</strong></span>
                        <span className="text-success"><strong>₹{bargainStatus.counterPrice}</strong></span>
                      </div>
                      <div className="mt-3 d-grid gap-2">
                        <button 
                          className="btn btn-success"
                          onClick={handleAcceptCounter}
                        >
                          <i className="bi bi-check me-1"></i>Accept Counter Offer & Add to Cart
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={handleRejectCounter}
                        >
                          <i className="bi bi-x me-1"></i>Reject Counter Offer
                        </button>
                      </div>
                    </div>
                  )}

                  {bargainStatus.status === 'accepted' && (
                    <div className="mt-3">
                      <div className="text-success text-center">
                        <i className="bi bi-check-circle me-2"></i>
                        Great! Your offer was accepted!
                      </div>
                      <div className="d-grid mt-2">
                        <button 
                          className="btn btn-success"
                          onClick={() => onSuccess(bargainStatus.proposedPrice)}
                        >
                          Add to Cart at ₹{bargainStatus.proposedPrice}
                        </button>
                      </div>
                    </div>
                  )}

                  {bargainStatus.status === 'rejected' && (
                    <div className="mt-3 text-center">
                      <div className="text-danger mb-2">
                        <i className="bi bi-x-circle me-2"></i>
                        Offer was rejected
                      </div>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setBargainStatus(null)}
                      >
                        Try Different Price
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bargain Form */}
            {!bargainStatus && (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="proposedPrice" className="form-label">
                    Your Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    id="proposedPrice"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    min={minPrice}
                    max={meal.price - 1}
                    placeholder={`Minimum ₹${minPrice}`}
                    required
                  />
                  <div className="form-text">
                    You can save up to ₹{maxSavings} on this meal
                  </div>
                </div>

                {proposedPrice && (
                  <div className="alert alert-success">
                    <strong>Potential Savings: ₹{calculateSavings()}</strong>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message to convince the restaurant..."
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning btn-lg"
                    disabled={loading || !proposedPrice}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending Offer...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Bargain Offer
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tips */}
            <div className="mt-4">
              <h6 className="fw-bold">💡 Bargaining Tips:</h6>
              <ul className="small text-muted">
                <li>Be reasonable with your offer (minimum 50% of original price)</li>
                <li>Add a polite message to increase your chances</li>
                <li>Restaurants can accept, reject, or counter your offer</li>
                <li>Responses are real-time - you'll know immediately!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BargainForm;
