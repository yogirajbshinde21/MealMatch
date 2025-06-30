import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [cartCountClass, setCartCountClass] = useState('');

  // Animate cart count when it changes
  useEffect(() => {
    if (getTotalItems() > 0) {
      setCartCountClass('animate__animated animate__pulse');
      const timer = setTimeout(() => {
        setCartCountClass('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [getTotalItems()]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark primary-color sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <i className="bi bi-shop me-2"></i>
          MealMatch
        </Link>

        {/* Toggle button for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user?.role !== 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-house me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    <i className="bi bi-person-circle me-1"></i>
                    My Account
                  </Link>
                </li>
              </>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  <i className="bi bi-gear me-1"></i>
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {/* Cart - Only for regular users */}
            {user?.role !== 'admin' && (
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/cart">
                  <i className="bi bi-cart3 me-1"></i>
                  Cart
                  {getTotalItems() > 0 && (
                    <span className={`position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark ${cartCountClass}`}>
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {/* User Menu */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.name || 'User'}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">Signed in as</small><br />
                    <strong>{user?.email}</strong>
                    {user?.role === 'admin' && (
                      <span className="badge bg-danger ms-2">Admin</span>
                    )}
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                {user?.role !== 'admin' && (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/orders">
                        <i className="bi bi-person-circle me-2"></i>
                        My Account
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
