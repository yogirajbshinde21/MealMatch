import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // For demo purposes, just show success message
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Profile Information
              </h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <div className="profile-avatar">
                    <i className="bi bi-person-circle" style={{ fontSize: '5rem', color: '#6c757d' }}></i>
                  </div>
                  <h5 className="mt-2">{user?.name}</h5>
                  <span className="badge bg-secondary">{user?.role}</span>
                </div>
                <div className="col-md-8">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        <i className="bi bi-person me-2"></i>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">
                        <i className="bi bi-telephone me-2"></i>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        <i className="bi bi-geo-alt me-2"></i>
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your delivery address"
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      {!isEditing ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setIsEditing(true)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                          >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleSave}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Save Changes
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="card shadow mt-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Account Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>User ID:</strong> {user?.id || user?._id}</p>
                  <p><strong>Account Type:</strong> {user?.role}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Last Login:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
