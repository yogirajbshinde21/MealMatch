import React from 'react';

const PoolStatus = ({ pool, savings = 0 }) => {
  if (!pool) {
    return (
      <div className="card border-warning mb-3">
        <div className="card-body text-center">
          <i className="bi bi-people text-warning mb-2" style={{ fontSize: '2rem' }}></i>
          <h6 className="fw-bold">No Delivery Pool Yet</h6>
          <p className="text-muted small mb-0">
            Order now and we'll try to group you with nearby orders to save on delivery!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-success mb-3">
      <div className="card-body pool-status">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0 text-white">
            <i className="bi bi-people-fill me-2"></i>
            Delivery Pool Active
          </h6>
          <span className="badge bg-light text-dark">
            {pool.orders?.length || 1} orders
          </span>
        </div>
        
        <p className="text-white mb-2">
          Great news! Your order is part of a delivery pool with nearby customers.
        </p>
        
        <div className="row text-center">
          <div className="col-6">
            <div className="fw-bold text-white">₹{pool.feePerOrder || 25}</div>
            <small className="text-white-50">Your delivery fee</small>
          </div>
          <div className="col-6">
            <div className="fw-bold text-warning">₹{savings}</div>
            <small className="text-white-50">You saved</small>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-warning" 
              style={{ width: `${Math.min((pool.orders?.length || 1) * 25, 100)}%` }}
            ></div>
          </div>
          <small className="text-white-50 mt-1 d-block">
            Pool efficiency: {Math.min((pool.orders?.length || 1) * 25, 100)}%
          </small>
        </div>
      </div>
    </div>
  );
};

export default PoolStatus;
