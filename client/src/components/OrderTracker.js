import React, { useState, useEffect } from 'react';

const OrderTracker = ({ order, isOpen, onClose, onRateOrder }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0); // Progress within current stage (0-100%)

  // Calculate time divisions based on total estimated delivery time
  const getTimeDivisions = React.useMemo(() => {
    if (!order) return { totalMinutes: 30, stageMinutes: 10 };
    
    // Get total estimated delivery time in minutes
    let totalMinutes = 30; // Default fallback
    
    if (order.estimatedDeliveryMinutes) {
      totalMinutes = order.estimatedDeliveryMinutes;
    } else if (order.estimatedDeliveryTime) {
      const orderTime = new Date(order.orderPlacedTime || order.createdAt || new Date());
      const deliveryTime = new Date(order.estimatedDeliveryTime);
      totalMinutes = Math.max(1, Math.round((deliveryTime - orderTime) / (1000 * 60)));
    }
    
    // Divide total time into 3 equal parts for the 3 active stages
    const stageMinutes = Math.round(totalMinutes / 3);
    
    return { totalMinutes, stageMinutes };
  }, [order]);

  // Calculate remaining time for current stage
  const getRemainingTime = React.useMemo(() => {
    if (!order || currentStage >= 3) return null;
    
    const orderTime = new Date(order.orderPlacedTime || order.createdAt || new Date());
    const deliveryTime = new Date(order.estimatedDeliveryTime);
    const totalDeliveryTimeMs = deliveryTime - orderTime;
    const stageTimeMs = totalDeliveryTimeMs / 3;
    
    const now = new Date();
    
    // Calculate when current stage should end
    const stageEndTime = orderTime.getTime() + (stageTimeMs * (currentStage + 1));
    const remainingMs = stageEndTime - now.getTime();
    
    if (remainingMs <= 0) return null;
    
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    return remainingMinutes;
  }, [order, currentStage]);

  // Define the order stages
  const stages = React.useMemo(() => {
    return [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been confirmed',
        icon: 'bi-receipt',
        status: ['Placed', 'placed']
      },
      {
        id: 'preparing',
        title: 'Preparing Food',
        description: 'Chef is preparing your delicious meal',
        icon: 'bi-person-badge',
        status: ['Preparing', 'preparing', 'Confirmed']
      },
      {
        id: 'delivery',
        title: 'Out for Delivery',
        description: 'Your order is on its way',
        icon: 'bi-truck',
        status: ['On the Way', 'delivery', 'dispatched']
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Enjoy your meal!',
        icon: 'bi-check-circle-fill',
        status: ['Delivered', 'delivered', 'completed']
      }
    ];
  }, []);

  // Determine current stage based on order status
  useEffect(() => {
    if (order) {
      const orderStatus = order.orderStatus || order.status;
      const stageIndex = stages.findIndex(stage => 
        stage.status.some(status => 
          status.toLowerCase() === orderStatus.toLowerCase()
        )
      );
      setCurrentStage(stageIndex >= 0 ? stageIndex : 0);
    }
  }, [order, stages]);

  // Auto-progress stages based on estimated delivery time divided into equal parts
  useEffect(() => {
    if (order && order.orderStatus !== 'Delivered') {
      const orderTime = new Date(order.orderPlacedTime || order.createdAt || new Date());
      const deliveryTime = new Date(order.estimatedDeliveryTime);
      const totalDeliveryTimeMs = deliveryTime - orderTime;
      
      // Divide total delivery time into 3 equal parts for the first 3 stages
      const stageTimeMs = totalDeliveryTimeMs / 3;
      
      const updateStage = () => {
        const now = new Date();
        const elapsedTime = now - orderTime;
        
        // Determine which stage we should be in based on elapsed time
        let newStage = 0;
        let progressInStage = 0;
        
        if (elapsedTime >= totalDeliveryTimeMs) {
          // Delivered
          newStage = 3;
          progressInStage = 100;
        } else if (elapsedTime >= stageTimeMs * 2) {
          // Out for Delivery
          newStage = 2;
          progressInStage = Math.min(100, ((elapsedTime - stageTimeMs * 2) / stageTimeMs) * 100);
        } else if (elapsedTime >= stageTimeMs) {
          // Preparing Food
          newStage = 1;
          progressInStage = Math.min(100, ((elapsedTime - stageTimeMs) / stageTimeMs) * 100);
        } else {
          // Order Placed
          newStage = 0;
          progressInStage = Math.min(100, (elapsedTime / stageTimeMs) * 100);
        }
        
        setCurrentStage(newStage);
        setStageProgress(Math.max(0, progressInStage));
      };
      
      // Update immediately
      updateStage();
      
      // Update every 10 seconds for more responsive tracking
      const timer = setInterval(updateStage, 10000);
      
      return () => clearInterval(timer);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
              Track Your Order
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body px-4 py-3">
            {/* Live Status Banner */}
            <div className="alert alert-info border-0 mb-4" style={{ 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              borderLeft: '4px solid #2196f3'
            }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="spinner-grow text-primary me-3" role="status" style={{ width: '1rem', height: '1rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div>
                    <strong>Live Tracking Active</strong>
                    <div className="small text-muted">
                      Currently in: <span className="text-primary fw-bold">{stages[currentStage]?.title}</span>
                      {currentStage < 3 && (
                        <>
                          • <span className="text-success">{Math.round(stageProgress)}% complete</span>
                          {getRemainingTime && (
                            <> • <span className="text-warning">{getRemainingTime} min remaining</span></>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="small text-muted">Updated: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="text-center p-3 border rounded h-100">
                  <h6 className="text-muted mb-1">Order ID</h6>
                  <p className="fw-bold mb-0">{order._id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-center p-3 border rounded h-100 bg-primary text-white">
                  <h6 className="mb-1 opacity-75">Estimated Delivery</h6>
                  <p className="fw-bold mb-0 fs-5">
                    {getTimeDivisions.totalMinutes} minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="order-tracker mb-4">
              <div className="progress-container">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="stage-container">
                    {/* Progress Line */}
                    {index > 0 && (
                      <div className={`progress-line ${index <= currentStage ? 'active' : ''}`}>
                        <div className="progress-fill"></div>
                      </div>
                    )}
                    
                    {/* Stage Circle */}
                    <div className={`stage-circle ${
                      index === currentStage ? 'current' : 
                      index < currentStage ? 'completed' : 'pending'
                    }`}>
                      <i className={`${stage.icon} ${
                        index === currentStage ? 'animate-pulse' : ''
                      }`}></i>
                    </div>
                    
                    {/* Stage Info */}
                    <div className="stage-info">
                      <h6 className={`stage-title ${
                        index <= currentStage ? 'active' : 'inactive'
                      }`}>
                        {stage.title}
                      </h6>
                      <p className={`stage-description ${
                        index <= currentStage ? 'active' : 'inactive'
                      }`}>
                        {stage.description}
                      </p>
                      <small className={`stage-time ${
                        index <= currentStage ? 'text-primary' : 'text-muted'
                      }`}>
                        {stage.title}
                      </small>
                      {index === currentStage && (
                        <div className="current-stage-indicator">
                          <div className="progress mb-2" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar bg-primary" 
                              style={{ width: `${stageProgress}%` }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between small text-muted">
                            <span>{Math.round(stageProgress)}% Complete</span>
                            <span>Stage {index + 1}/4</span>
                          </div>
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items">
              <h6 className="fw-bold mb-3">Order Items</h6>
              {order.items?.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                  <img 
                    src={item.meal?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50'} 
                    alt={item.meal?.name}
                    className="rounded me-3"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <span className="fw-bold">{item.meal?.name || 'Meal'}</span>
                    <span className="text-muted ms-2">x{item.quantity}</span>
                  </div>
                  <span className="fw-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="delivery-address mt-3">
              <h6 className="fw-bold mb-2">Delivery Address</h6>
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt text-primary me-2 mt-1"></i>
                <div>
                  <p className="mb-1">{order.deliveryAddress?.street || '123 Default Street'}</p>
                  <p className="text-muted mb-0">
                    {order.deliveryAddress?.city || 'Mumbai'}, {order.deliveryAddress?.pincode || '400001'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {currentStage === stages.length - 1 && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  if (onRateOrder) {
                    onRateOrder(order);
                  }
                  onClose();
                }}
              >
                <i className="bi bi-star me-1"></i>
                Rate Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
