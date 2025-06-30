import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'large' }) => {
  const spinnerSize = size === 'small' ? 'spinner-border-sm' : '';
  
  return (
    <div className="loading-spinner">
      <div className="text-center">
        <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && (
          <div className="mt-2 text-muted">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
