# 🍽️ MealMatch - Smart Food Delivery Platform

> **A modern food delivery app with real-time price negotiation and weather-based dynamic pricing**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=flat-square)](https://github.com/your-repo)
[![React](https://img.shields.io/badge/React-18.0+-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square&logo=mongodb)](https://mongodb.com/)

## 🎬 Demo Video

https://github.com/user-attachments/assets/1a60a309-a80a-4d36-99f9-e06e03404658

## � What Makes MealMatch Different

### **Top 3 Key Problems Solved:**

**1. Lack of Pricing Flexibility**
→ Introduced a user-to-admin bargaining system, allowing users to negotiate meal prices — a unique feature inspired by real-world ride-hailing apps.

**2. Static Pricing Irrespective of Weather**  
→ Integrated Weather API to offer dynamic discounts based on real-time conditions (e.g., lower prices during rain), adding a smart, real-world responsive pricing layer.

**3. Same UI/Functionality for Admin and User**
→ Designed separate dashboards with role-based access: users can order and bargain, while admins can manage offers, meals, users, and accept/reject deals — solving the problem of poor admin control in traditional apps.

## ⚡ Core Features

### 🎯 **Real-Time Bargaining System**
- Users can negotiate meal prices directly with admin/platform
- Live Socket.IO-powered communication for instant responses
- Smart minimum pricing ensures fair deals (50% of original price)

### �️ **Weather-Smart Pricing**
- Dynamic discounts based on real-time weather conditions
- Up to 15% off during rainy weather, 5% during sunny days
- City-specific weather data for accurate pricing

### 👥 **Role-Based Access Control**
- **Users**: Browse meals, place orders, negotiate prices
- **Admin**: Manage restaurants, meals, orders, and bargain requests
- **Demo Mode**: Full functionality without registration

## 🛠️ Technology Stack

| Frontend | Backend | Database | Real-Time |
|----------|---------|----------|-----------|
| React 18+ | Node.js + Express | MongoDB | Socket.IO |
| Context API | RESTful APIs | Mongoose ODM | Live Updates |
| Bootstrap 5 | Weather API | Aggregation | Real-time Chat |

## � Quick Start

### **Prerequisites**
- Node.js (v14+)
- MongoDB
- Weather API key from [WeatherAPI.com](https://www.weatherapi.com/)

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd MealMatch

# Install dependencies for all parts
npm run install-all

# Setup environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env

# Add your Weather API key to client/.env:
# REACT_APP_WEATHER_API_KEY=your_api_key_here

# Start development servers
npm run dev
```

### **Access the App**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎮 Demo Accounts

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Demo User | demo@mealmatch.com | 123456 | Order meals, negotiate prices |
| Admin | admin@mealmatch.com | admin123 | Manage platform, handle bargains |

## � How It Works

### **For Users:**
1. **Browse** restaurants and meals
2. **Negotiate** prices using the bargain feature  
3. **Save** with automatic weather discounts
4. **Order** with seamless checkout

## 🏗️ System Architecture

```
Frontend (React)  ←→  Backend (Express)  ←→  Database (MongoDB)
     ↓                     ↓                      ↓
• Modern UI          • RESTful APIs        • User Data
• Real-time          • Socket.IO           • Orders  
• State Mgmt         • Weather API         • Restaurants
• Responsive         • Authentication      • Bargains
```

## 🔧 Environment Setup

### **Client (.env)**
```bash
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### **Server (.env)**
```bash
MONGODB_URI=mongodb://localhost:27017/mealmatch
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🌟 **MealMatch - Where every meal is a perfect match!** 🍽️✨
