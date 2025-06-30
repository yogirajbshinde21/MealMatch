import React, { useState } from 'react';
import { reviewService } from '../services/api';

const ReviewForm = ({ meal, order, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData = {
        userId: order.user,
        mealId: meal._id,
        orderId: order._id,
        rating,
        comment
      };

      await reviewService.createReview(reviewData);
      onSubmit && onSubmit({ rating, comment });
    } catch (error) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  return (
    <div className="review-form">
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-star me-2"></i>
            Rate & Review: {meal.name}
          </h6>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Rating *</label>
              <div className="d-flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-outline-warning p-1"
                    style={{ 
                      fontSize: '1.5rem',
                      color: star <= rating ? '#ffc107' : '#dee2e6',
                      borderColor: star <= rating ? '#ffc107' : '#dee2e6'
                    }}
                    onClick={() => handleStarClick(star)}
                  >
                    <i className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                  </button>
                ))}
              </div>
              <small className="text-muted">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </small>
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label htmlFor="comment" className="form-label fw-semibold">
                Your Review (Optional)
              </label>
              <textarea
                id="comment"
                className="form-control"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this meal... How was the taste, presentation, and overall quality?"
                maxLength="500"
              />
              <small className="text-muted">
                {comment.length}/500 characters
              </small>
            </div>

            {/* Quick Review Tags */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Quick Tags (Optional)</label>
              <div className="d-flex flex-wrap gap-2">
                {[
                  'Delicious', 'Fresh', 'Hot', 'Well Packaged', 'Good Portion', 
                  'Value for Money', 'Quick Delivery', 'Spicy', 'Mild', 'Crispy'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      const newComment = comment.includes(tag) 
                        ? comment.replace(tag, '').trim()
                        : `${comment} ${tag}`.trim();
                      setComment(newComment);
                    }}
                    style={{
                      backgroundColor: comment.includes(tag) ? '#e9ecef' : 'transparent'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Info */}
            <div className="mb-3 p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <img
                  src={meal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'}
                  alt={meal.name}
                  className="rounded me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-1">{meal.name}</h6>
                  <p className="text-muted small mb-0">{meal.description}</p>
                  <small className="text-muted">
                    Order #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-grow-1"
                disabled={loading || rating === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Submit Review
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Review Guidelines */}
          <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              <strong>Review Guidelines:</strong> Please be honest and constructive. 
              Your reviews help other customers and restaurants improve their service.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
