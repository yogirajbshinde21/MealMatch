import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mealService, bargainService, orderService, restaurantService, authService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
// import io from 'socket.io-client';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  // const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Data states
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalOrders: 0,
    pendingBargains: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [meals, setMeals] = useState([]);
  const [bargains, setBargains] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form states for meal management
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealForm, setMealForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    restaurant: '',
    isVeg: true,
    preparationTime: 20,
    image: '',
    isAvailable: true,
    isSurplus: false,
    surplusDiscount: 0
  });
  
  // Form states for restaurant management
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    location: '',
    phone: '',
    email: '',
    description: '',
    isActive: true
  });

  // Initialize socket and load data
  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
      // initializeSocket();
    }
    
    return () => {
      // socket?.disconnect();
    };
  }, [user]);

  // const initializeSocket = () => {
  //   const newSocket = io('http://localhost:5000');
  //   setSocket(newSocket);
    
  //   // Join admin room for notifications
  //   newSocket.emit('join-admin-room');
    
  //   // Listen for new bargains
  //   newSocket.on('bargain-received', (data) => {
  //     setBargains(prev => [data.bargain, ...prev]);
  //     addNotification(`New bargain: ₹${data.bargain.proposedPrice} for ${data.bargain.meal?.name}`, 'warning');
  //   });

  //   // Listen for new orders
  //   newSocket.on('new-order', (data) => {
  //     setOrders(prev => [data.order, ...prev]);
  //     addNotification(`New order: ₹${data.order.totalAmount}`, 'success');
  //   });
  // };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all admin data
      const [mealsRes, bargainsRes, ordersRes, restaurantsRes, usersRes] = await Promise.all([
        mealService.getAllMeals().catch(() => ({ data: { meals: getSampleMeals() } })),
        bargainService.getAllBargains().catch(() => ({ data: { bargains: getSampleBargains() } })),
        orderService.getAllOrders().catch(() => ({ data: { orders: getSampleOrders() } })),
        restaurantService.getAllRestaurants().catch(() => ({ data: { restaurants: getSampleRestaurants() } })),
        authService.getAllUsers().catch(() => ({ data: { users: getSampleUsers() } }))
      ]);

      const loadedMeals = mealsRes.data.meals || getSampleMeals();
      const loadedBargains = bargainsRes.data.bargains || getSampleBargains();
      const loadedOrders = ordersRes.data.orders || getSampleOrders();
      const loadedRestaurants = restaurantsRes.data.restaurants || getSampleRestaurants();
      const loadedUsers = usersRes.data.users || getSampleUsers();

      setMeals(loadedMeals);
      setBargains(loadedBargains);
      setOrders(loadedOrders);
      setRestaurants(loadedRestaurants);
      setUsers(loadedUsers);
      
      // Calculate stats
      const totalRevenue = loadedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      setStats({
        totalMeals: loadedMeals.length,
        totalOrders: loadedOrders.length,
        pendingBargains: loadedBargains.filter(b => b.status === 'pending').length,
        totalRevenue,
        activeUsers: loadedUsers.filter(u => u.lastActive > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      });
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      addNotification('Error loading data. Using sample data for demo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sample data functions
  const getSampleMeals = () => [
    {
      _id: '1',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken',
      price: 320,
      category: 'Main Course',
      restaurant: { _id: 'r1', name: 'Spice Paradise' },
      isVeg: false,
      isAvailable: true,
      preparationTime: 25,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300'
    },
    {
      _id: '2',
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella and basil',
      price: 350,
      category: 'Pizza',
      restaurant: { _id: 'r2', name: 'Pizza Corner' },
      isVeg: true,
      isAvailable: true,
      preparationTime: 15,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300'
    },
    {
      _id: '3',
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with spiced chicken',
      price: 280,
      category: 'Biryani',
      restaurant: { _id: 'r1', name: 'Spice Paradise' },
      isVeg: false,
      isAvailable: true,
      preparationTime: 30,
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300'
    }
  ];

  const getSampleBargains = () => [
    {
      _id: 'b1',
      user: { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
      meal: { _id: '1', name: 'Butter Chicken', price: 320, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=100' },
      restaurant: { _id: 'r1', name: 'Spice Paradise' },
      originalPrice: 320,
      proposedPrice: 250,
      status: 'pending',
      message: 'Can you please give this price? I am a regular customer.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      _id: 'b2',
      user: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
      meal: { _id: '2', name: 'Margherita Pizza', price: 350, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100' },
      restaurant: { _id: 'r2', name: 'Pizza Corner' },
      originalPrice: 350,
      proposedPrice: 200,
      status: 'pending',
      message: 'Please consider this offer.',
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  const getSampleOrders = () => [
    {
      _id: 'o1',
      user: { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
      items: [
        { meal: { name: 'Butter Chicken' }, quantity: 2, price: 320 },
        { meal: { name: 'Naan' }, quantity: 3, price: 60 }
      ],
      totalAmount: 820,
      status: 'preparing',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      deliveryAddress: { street: '123 Main St', city: 'Mumbai', pincode: '400001' }
    },
    {
      _id: 'o2',
      user: { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
      items: [
        { meal: { name: 'Margherita Pizza' }, quantity: 1, price: 350 }
      ],
      totalAmount: 400,
      status: 'delivered',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      deliveryAddress: { street: '456 Oak Ave', city: 'Mumbai', pincode: '400002' }
    }
  ];

  const getSampleRestaurants = () => [
    {
      _id: 'r1',
      name: 'Spice Paradise',
      cuisine: 'Indian',
      location: 'Bandra, Mumbai',
      phone: '+91 98765 43210',
      email: 'contact@spiceparadise.com',
      rating: 4.5,
      isActive: true
    },
    {
      _id: 'r2',
      name: 'Pizza Corner',
      cuisine: 'Italian',
      location: 'Andheri, Mumbai',
      phone: '+91 98765 43211',
      email: 'info@pizzacorner.com',
      rating: 4.2,
      isActive: true
    }
  ];

  const getSampleUsers = () => [
    {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      orders: 15,
      totalSpent: 4500,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      orders: 8,
      totalSpent: 2800,
      lastActive: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  // Meal management functions
  const handleCreateMeal = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        ...mealForm,
        price: parseFloat(mealForm.price),
        preparationTime: parseInt(mealForm.preparationTime)
      };
      
      const response = await mealService.createMeal(mealData);
      setMeals(prev => [response.data.meal, ...prev]);
      resetMealForm();
      addNotification('Meal created successfully!', 'success');
    } catch (error) {
      addNotification('Failed to create meal: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleUpdateMeal = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        ...mealForm,
        price: parseFloat(mealForm.price),
        preparationTime: parseInt(mealForm.preparationTime)
      };
      
      const response = await mealService.updateMeal(editingMeal._id, mealData);
      setMeals(prev => prev.map(m => m._id === editingMeal._id ? response.data.meal : m));
      resetMealForm();
      addNotification('Meal updated successfully!', 'success');
    } catch (error) {
      addNotification('Failed to update meal: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await mealService.deleteMeal(mealId);
        setMeals(prev => prev.filter(m => m._id !== mealId));
        addNotification('Meal deleted successfully!', 'success');
      } catch (error) {
        addNotification('Failed to delete meal: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const startEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealForm({
      name: meal.name,
      description: meal.description,
      price: meal.price.toString(),
      category: meal.category,
      restaurant: meal.restaurant?._id || '',
      isVeg: meal.isVeg,
      preparationTime: meal.preparationTime,
      image: meal.image || '',
      isAvailable: meal.isAvailable,
      isSurplus: meal.isSurplus || false,
      surplusDiscount: meal.surplusDiscount || 0
    });
    setShowMealForm(true);
  };

  const resetMealForm = () => {
    setMealForm({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      restaurant: '',
      isVeg: true,
      preparationTime: 20,
      image: '',
      isAvailable: true,
      isSurplus: false,
      surplusDiscount: 0
    });
    setEditingMeal(null);
    setShowMealForm(false);
  };

  // Bargain management functions
  const handleBargainResponse = async (bargainId, response, counterPrice = null) => {
    try {
      const responseData = {
        response,
        counterPrice: counterPrice ? parseFloat(counterPrice) : null
      };
      
      await bargainService.respondToBargain(bargainId, responseData);
      
      setBargains(prev => prev.map(b => 
        b._id === bargainId 
          ? { ...b, status: response, adminResponse: responseData }
          : b
      ));
      
      addNotification(`Bargain ${response} successfully!`, 'success');
      
      // Emit socket event for real-time update
      // if (socket) {
      //   socket.emit('bargain-response', { bargainId, response, counterPrice });
      // }
    } catch (error) {
      addNotification('Failed to respond to bargain: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Order management functions
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
      addNotification(`Order status updated to ${newStatus}!`, 'success');
    } catch (error) {
      addNotification('Failed to update order status: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Restaurant management functions
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await restaurantService.createRestaurant(restaurantForm);
      setRestaurants(prev => [response.data.restaurant, ...prev]);
      setRestaurantForm({
        name: '',
        cuisine: '',
        location: '',
        phone: '',
        email: '',
        description: '',
        isActive: true
      });
      setShowRestaurantForm(false);
      addNotification('Restaurant created successfully!', 'success');
    } catch (error) {
      addNotification('Failed to create restaurant: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderOverview = () => (
    <div className="row">
      {/* Stats Cards */}
      <div className="col-md-3 mb-4">
        <div className="card bg-primary text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Total Meals</h6>
                <h2>{stats.totalMeals}</h2>
              </div>
              <div className="align-self-center">
                <i className="fas fa-utensils fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-success text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Total Orders</h6>
                <h2>{stats.totalOrders}</h2>
              </div>
              <div className="align-self-center">
                <i className="fas fa-shopping-cart fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-warning text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Pending Bargains</h6>
                <h2>{stats.pendingBargains}</h2>
              </div>
              <div className="align-self-center">
                <i className="fas fa-handshake fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-3 mb-4">
        <div className="card bg-info text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="card-title">Revenue</h6>
                <h2>₹{stats.totalRevenue}</h2>
              </div>
              <div className="align-self-center">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h5>Recent Orders</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{order.user?.name}</td>
                      <td>₹{order.totalAmount}</td>
                      <td>
                        <span className={`badge bg-${
                          order.status === 'delivered' ? 'success' :
                          order.status === 'preparing' ? 'warning' : 'info'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header">
            <h5>Pending Bargains</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Meal</th>
                    <th>Original</th>
                    <th>Proposed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bargains.filter(b => b.status === 'pending').slice(0, 5).map(bargain => (
                    <tr key={bargain._id}>
                      <td>{bargain.meal?.name}</td>
                      <td>₹{bargain.originalPrice}</td>
                      <td>₹{bargain.proposedPrice}</td>
                      <td>
                        <button 
                          className="btn btn-success btn-sm me-1"
                          onClick={() => handleBargainResponse(bargain._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleBargainResponse(bargain._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeals = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Meal Management</h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowMealForm(true)}
        >
          <i className="fas fa-plus me-2"></i>Add New Meal
        </button>
      </div>

      {/* Meal Form Modal */}
      {showMealForm && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMeal ? 'Edit Meal' : 'Add New Meal'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={resetMealForm}
                ></button>
              </div>
              <form onSubmit={editingMeal ? handleUpdateMeal : handleCreateMeal}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Meal Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={mealForm.name}
                        onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={mealForm.price}
                        onChange={(e) => setMealForm({...mealForm, price: e.target.value})}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={mealForm.description}
                      onChange={(e) => setMealForm({...mealForm, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-control"
                        value={mealForm.category}
                        onChange={(e) => setMealForm({...mealForm, category: e.target.value})}
                      >
                        <option>Main Course</option>
                        <option>Starter</option>
                        <option>Dessert</option>
                        <option>Beverage</option>
                        <option>Pizza</option>
                        <option>Biryani</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Restaurant</label>
                      <select
                        className="form-control"
                        value={mealForm.restaurant}
                        onChange={(e) => setMealForm({...mealForm, restaurant: e.target.value})}
                        required
                      >
                        <option value="">Select Restaurant</option>
                        {restaurants.map(restaurant => (
                          <option key={restaurant._id} value={restaurant._id}>
                            {restaurant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Preparation Time (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={mealForm.preparationTime}
                        onChange={(e) => setMealForm({...mealForm, preparationTime: e.target.value})}
                        min="5"
                        max="120"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={mealForm.image}
                        onChange={(e) => setMealForm({...mealForm, image: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isVeg"
                          checked={mealForm.isVeg}
                          onChange={(e) => setMealForm({...mealForm, isVeg: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="isVeg">
                          Vegetarian
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isAvailable"
                          checked={mealForm.isAvailable}
                          onChange={(e) => setMealForm({...mealForm, isAvailable: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="isAvailable">
                          Available
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isSurplus"
                          checked={mealForm.isSurplus}
                          onChange={(e) => setMealForm({...mealForm, isSurplus: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="isSurplus">
                          Surplus Item
                        </label>
                      </div>
                    </div>
                    {mealForm.isSurplus && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Surplus Discount (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={mealForm.surplusDiscount}
                          onChange={(e) => setMealForm({...mealForm, surplusDiscount: e.target.value})}
                          min="0"
                          max="50"
                          placeholder="Additional discount for surplus"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetMealForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMeal ? 'Update Meal' : 'Create Meal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Meals Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Restaurant</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Surplus</th>
                    <th>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {meals.map(meal => (
                  <tr key={meal._id}>
                    <td>
                      <img 
                        src={meal.image || 'https://via.placeholder.com/50'} 
                        alt={meal.name}
                        className="rounded"
                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                      />
                    </td>
                    <td>
                      <strong>{meal.name}</strong>
                      <br />
                      <small className="text-muted">{meal.description?.slice(0, 50)}...</small>
                    </td>
                    <td>{meal.restaurant?.name}</td>
                    <td>{meal.category}</td>
                    <td>₹{meal.price}</td>
                    <td>
                      <span className={`badge ${meal.isVeg ? 'bg-success' : 'bg-danger'}`}>
                        {meal.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${meal.isAvailable ? 'bg-success' : 'bg-secondary'}`}>
                        {meal.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      {meal.isSurplus ? (
                        <span className="badge bg-warning text-dark">
                          Surplus {meal.surplusDiscount ? `${meal.surplusDiscount}% off` : ''}
                        </span>
                      ) : (
                        <span className="badge bg-light text-dark">Regular</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => startEditMeal(meal)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteMeal(meal._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBargains = () => (
    <div>
      <h4 className="mb-4">Bargain Management</h4>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Meal</th>
                  <th>Original Price</th>
                  <th>Proposed Price</th>
                  <th>Discount</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bargains.map(bargain => {
                  const discount = ((bargain.originalPrice - bargain.proposedPrice) / bargain.originalPrice * 100).toFixed(0);
                  return (
                    <tr key={bargain._id}>
                      <td>
                        <strong>{bargain.user?.name}</strong>
                        <br />
                        <small className="text-muted">{bargain.user?.email}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={bargain.meal?.image || 'https://via.placeholder.com/40'} 
                            alt={bargain.meal?.name}
                            className="rounded me-2"
                            style={{width: '40px', height: '40px', objectFit: 'cover'}}
                          />
                          <span>{bargain.meal?.name}</span>
                        </div>
                      </td>
                      <td>₹{bargain.originalPrice}</td>
                      <td>₹{bargain.proposedPrice}</td>
                      <td>
                        <span className={`badge ${discount > 30 ? 'bg-danger' : discount > 15 ? 'bg-warning' : 'bg-success'}`}>
                          {discount}% off
                        </span>
                      </td>
                      <td>
                        <small>{bargain.message?.slice(0, 50)}...</small>
                      </td>
                      <td>
                        <span className={`badge bg-${
                          bargain.status === 'accepted' ? 'success' :
                          bargain.status === 'rejected' ? 'danger' :
                          bargain.status === 'countered' ? 'info' : 'warning'
                        }`}>
                          {bargain.status}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(bargain.createdAt).toLocaleString()}</small>
                      </td>
                      <td>
                        {bargain.status === 'pending' && (
                          <div className="btn-group">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleBargainResponse(bargain._id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleBargainResponse(bargain._id, 'rejected')}
                            >
                              Reject
                            </button>
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => {
                                const counterPrice = prompt('Enter counter offer:');
                                if (counterPrice && !isNaN(counterPrice)) {
                                  handleBargainResponse(bargain._id, 'countered', counterPrice);
                                }
                              }}
                            >
                              Counter
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <h4 className="mb-4">Order Management</h4>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Address</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order._id.slice(-6)}</strong>
                    </td>
                    <td>
                      <strong>{order.user?.name}</strong>
                      <br />
                      <small className="text-muted">{order.user?.email}</small>
                    </td>
                    <td>
                      <small>
                        {order.items?.map((item, index) => (
                          <div key={index}>
                            {item.meal?.name} x{item.quantity}
                          </div>
                        ))}
                      </small>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <select 
                        className={`form-select form-select-sm badge bg-${
                          order.status === 'delivered' ? 'success' :
                          order.status === 'out_for_delivery' ? 'info' :
                          order.status === 'preparing' ? 'warning' : 'secondary'
                        }`}
                        value={order.status}
                        onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                        style={{border: 'none', color: 'white'}}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <small>
                        {order.deliveryAddress?.street}<br />
                        {order.deliveryAddress?.city} {order.deliveryAddress?.pincode}
                      </small>
                    </td>
                    <td>
                      <small>{new Date(order.createdAt).toLocaleString()}</small>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurants = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Restaurant Management</h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRestaurantForm(true)}
        >
          <i className="fas fa-plus me-2"></i>Add Restaurant
        </button>
      </div>

      {/* Restaurant Form Modal */}
      {showRestaurantForm && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Restaurant</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowRestaurantForm(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateRestaurant}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Restaurant Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cuisine Type</label>
                    <input
                      type="text"
                      className="form-control"
                      value={restaurantForm.cuisine}
                      onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={restaurantForm.location}
                      onChange={(e) => setRestaurantForm({...restaurantForm, location: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm({...restaurantForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={restaurantForm.description}
                      onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="restaurantActive"
                      checked={restaurantForm.isActive}
                      onChange={(e) => setRestaurantForm({...restaurantForm, isActive: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="restaurantActive">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRestaurantForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Restaurant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Restaurants Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Cuisine</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(restaurant => (
                  <tr key={restaurant._id}>
                    <td>
                      <strong>{restaurant.name}</strong>
                    </td>
                    <td>{restaurant.cuisine}</td>
                    <td>{restaurant.location}</td>
                    <td>
                      <small>
                        {restaurant.phone}<br />
                        {restaurant.email}
                      </small>
                    </td>
                    <td>
                      <span className="text-warning">
                        {'★'.repeat(Math.floor(restaurant.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(restaurant.rating || 0))}
                      </span>
                      <small className="text-muted"> ({restaurant.rating})</small>
                    </td>
                    <td>
                      <span className={`badge ${restaurant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h4 className="mb-4">User Management</h4>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.orders}</td>
                    <td>₹{user.totalSpent}</td>
                    <td>
                      <small>{new Date(user.lastActive).toLocaleString()}</small>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Admin Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">
            <i className="fas fa-cog me-2"></i>
            MealMatch Admin
          </span>
          
          {/* Notifications */}
          <div className="d-flex align-items-center">
            {notifications.length > 0 && (
              <div className="dropdown me-3">
                <button 
                  className="btn btn-outline-light position-relative"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-bell"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {notifications.map(notification => (
                    <li key={notification.id}>
                      <div className={`dropdown-item-text alert alert-${notification.type} mb-1`}>
                        <small>{notification.message}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <span className="text-light me-3">
              Welcome, {user?.name}
            </span>
            <button className="btn btn-outline-light" onClick={logout}>
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 bg-light sidebar py-3">
            <div className="nav flex-column nav-pills">
              <button 
                className={`nav-link text-start ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-pie me-2"></i>Overview
              </button>
              <button 
                className={`nav-link text-start ${activeTab === 'meals' ? 'active' : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                <i className="fas fa-utensils me-2"></i>Meals
              </button>
              <button 
                className={`nav-link text-start ${activeTab === 'bargains' ? 'active' : ''}`}
                onClick={() => setActiveTab('bargains')}
              >
                <i className="fas fa-handshake me-2"></i>Bargains
              </button>
              <button 
                className={`nav-link text-start ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="fas fa-shopping-cart me-2"></i>Orders
              </button>
              <button 
                className={`nav-link text-start ${activeTab === 'restaurants' ? 'active' : ''}`}
                onClick={() => setActiveTab('restaurants')}
              >
                <i className="fas fa-store me-2"></i>Restaurants
              </button>
              <button 
                className={`nav-link text-start ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users me-2"></i>Users
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 py-4">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'meals' && renderMeals()}
            {activeTab === 'bargains' && renderBargains()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'restaurants' && renderRestaurants()}
            {activeTab === 'users' && renderUsers()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
