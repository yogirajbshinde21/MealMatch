import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <div className="container-fluid">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
