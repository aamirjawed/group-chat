import React, { useState } from 'react';
import { ArrowRight, User, Lock, Mail, Check, X } from 'lucide-react';
import { Link, useNavigate

 } from 'react-router';
import './login.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      showToast("All fields are required");
      setIsLoading(false)
      return
    }
console.log("Attempting login..."); // Add this
    try {
      const response = await fetch('http://localhost:5000/user/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials:'include',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })

      const data = await response.json()
      console.log("Login response data:", data); // Add this

      if (!response.ok) {
        showToast('Invalid email or password')
        return;
      }

      showToast("Login Successful")
     setTimeout(() => {
      navigate('/dashboard')
     }, 1000)
      
      
     return data
      

    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }


  };

  return (
    <div className="container">
      {/* Left side - Form */}
      <div className="form-section">
        <div className="form-wrapper">
          <div className="logo">
            <h1>Chat Hub</h1>
          </div>

          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/" className="link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="background-section">
        <div className="background-overlay">
          <div className="background-content">
            <h3>Join our community</h3>
            <p>
              Discover amazing features and connect with thousands of users worldwide.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon">
                  <Check size={16} />
                </div>
                <span>Secure & encrypted</span>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <User size={16} />
                </div>
                <span>Trusted by 10,000+ users</span>
              </div>
              <div className="feature">
                <div className="feature-icon">
                  <Mail size={16} />
                </div>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;