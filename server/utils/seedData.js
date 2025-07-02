const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Meal = require('../models/Meal');

// Sample data
const sampleUsers = [
  {
    email: 'admin@mealmatch.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'user1@example.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      pincode: '400001'
    }
  },
  {
    email: 'user2@example.com',
    password: 'user123',
    name: 'Jane Smith',
    role: 'user',
    address: {
      street: '456 Oak St',
      city: 'Mumbai',
      pincode: '400002'
    }
  }
];

const sampleRestaurants = [
  {
    name: 'Spice Paradise',
    description: 'Authentic Indian cuisine with a modern twist',
    cuisine: ['Indian', 'North Indian', 'Punjabi'],
    address: {
      street: '789 Food Street',
      city: 'Mumbai',
      pincode: '400001'
    },
    phone: '+91 98765 43210',
    email: 'contact@spiceparadise.com',
    rating: 4.5,
    totalReviews: 150,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
    deliveryTime: 35,
    deliveryFee: 40
  },
  {
    name: 'Pizza Corner',
    description: 'Wood-fired pizzas and Italian delights',
    cuisine: ['Italian', 'Pizza', 'Continental'],
    address: {
      street: '321 Italian Lane',
      city: 'Mumbai',
      pincode: '400002'
    },
    phone: '+91 98765 43211',
    email: 'hello@pizzacorner.com',
    rating: 4.2,
    totalReviews: 89,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
    deliveryTime: 25,
    deliveryFee: 30
  },
  {
    name: 'Burger Junction',
    description: 'Gourmet burgers and fast food favorites',
    cuisine: ['American', 'Fast Food', 'Burgers'],
    address: {
      street: '654 Burger Blvd',
      city: 'Mumbai',
      pincode: '400003'
    },
    phone: '+91 98765 43212',
    email: 'info@burgerjunction.com',
    rating: 4.0,
    totalReviews: 67,
    image: 'https://images.unsplash.com/photo-1571091655789-405eb7a8c456?w=500',
    deliveryTime: 20,
    deliveryFee: 35
  },
  {
    name: 'Healthy Bites',
    description: 'Nutritious and delicious healthy meals',
    cuisine: ['Healthy', 'Salads', 'Vegan'],
    address: {
      street: '987 Health Street',
      city: 'Mumbai',
      pincode: '400004'
    },
    phone: '+91 98765 43213',
    email: 'contact@healthybites.com',
    rating: 4.3,
    totalReviews: 45,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
    deliveryTime: 30,
    deliveryFee: 45
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://yogirajbshinde21:Guru2109@cluster0.ttx13or.mongodb.net/mealmatch');
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Meal.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords and create users
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      users.push({
        ...userData,
        password: hashedPassword
      });
    }
    
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create restaurants
    const createdRestaurants = await Restaurant.insertMany(sampleRestaurants);
    console.log(`Created ${createdRestaurants.length} restaurants`);

    // Create meals for each restaurant
    const meals = [];
    
    // Spice Paradise meals
    const spiceParadise = createdRestaurants[0];
    meals.push(
      {
        name: 'Biryani',
        description: 'Fragrant basmati rice with aromatic spices and tender meat',
        price: 399,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1697155406055-2db32d47ca07?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        restaurant: spiceParadise._id,
        rating: 4.6,
        totalReviews: 156,
        tags: ['spicy', 'aromatic', 'popular'],
        preparationTime: 30,
        isVeg: false
      },
      {
        name: 'Dal Makhani',
        description: 'Rich, creamy black lentils slow-cooked with butter and cream',
        price: 249,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80',
        restaurant: spiceParadise._id,
        rating: 4.8,
        totalReviews: 203,
        tags: ['creamy', 'comfort', 'vegetarian'],
        preparationTime: 20,
        isVeg: true
      },
      {
        name: 'Paneer Tikka Masala',
        description: 'Chargrilled paneer cubes in rich, creamy tomato masala gravy',
        price: 299,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&q=80',
        restaurant: spiceParadise._id,
        rating: 4.7,
        totalReviews: 128,
        tags: ['vegetarian', 'spicy', 'creamy'],
        preparationTime: 20,
        isVeg: true
      },
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in velvety tomato-butter curry sauce',
        price: 349,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&q=80',
        restaurant: spiceParadise._id,
        rating: 4.9,
        totalReviews: 245,
        tags: ['creamy', 'mild', 'popular'],
        preparationTime: 25,
        isVeg: false
      }
    );

    // Pizza Corner meals
    const pizzaCorner = createdRestaurants[1];
    meals.push(
      {
        name: 'Margherita Pizza',
        description: 'Classic wood-fired pizza with fresh mozzarella, tomato sauce, and basil',
        price: 350,
        discount: 20,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80',
        restaurant: pizzaCorner._id,
        rating: 4.5,
        totalReviews: 123,
        tags: ['classic', 'vegetarian', 'cheese'],
        preparationTime: 15,
        isVeg: true
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni slices with melted mozzarella on crispy crust',
        price: 420,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop&q=80',
        restaurant: pizzaCorner._id,
        rating: 4.3,
        totalReviews: 87,
        tags: ['spicy', 'meat', 'popular'],
        preparationTime: 18,
        isVeg: false
      },
      {
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with eggs, cheese, and pancetta',
        price: 290,
        category: 'Pasta',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        restaurant: pizzaCorner._id,
        rating: 4.1,
        totalReviews: 45,
        tags: ['creamy', 'pasta', 'Italian'],
        preparationTime: 12,
        isVeg: false
      }
    );

    // Burger Junction meals
    const burgerJunction = createdRestaurants[2];
    meals.push(
      {
        name: 'Classic Beef Burger',
        description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce',
        price: 220,
        discount: 25,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80',
        restaurant: burgerJunction._id,
        rating: 4.2,
        totalReviews: 156,
        tags: ['classic', 'beef', 'cheese'],
        preparationTime: 8,
        isVeg: false
      },
      {
        name: 'Veggie Delight Burger',
        description: 'Grilled plant-based patty with fresh vegetables and avocado spread',
        price: 180,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop&q=80',
        restaurant: burgerJunction._id,
        rating: 3.9,
        totalReviews: 43,
        tags: ['vegetarian', 'healthy', 'plant-based'],
        preparationTime: 10,
        isVeg: true
      },
      {
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings with blue cheese dip',
        price: 250,
        category: 'Appetizer',
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400',
        restaurant: burgerJunction._id,
        rating: 4.4,
        totalReviews: 78,
        tags: ['spicy', 'chicken', 'wings'],
        preparationTime: 15,
        isVeg: false
      }
    );

    // Healthy Bites meals
    const healthyBites = createdRestaurants[3];
    meals.push(
      {
        name: 'Quinoa Bowl',
        description: 'Nutritious quinoa with roasted vegetables and tahini dressing',
        price: 320,
        category: 'Bowl',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        restaurant: healthyBites._id,
        rating: 4.5,
        totalReviews: 67,
        tags: ['healthy', 'vegan', 'protein'],
        preparationTime: 12,
        isVeg: true
      },
      {
        name: 'Grilled Chicken Salad',
        description: 'Fresh mixed greens with grilled chicken and vinaigrette',
        price: 280,
        discount: 10,
        category: 'Salad',
        image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        restaurant: healthyBites._id,
        rating: 4.3,
        totalReviews: 89,
        tags: ['healthy', 'protein', 'fresh'],
        preparationTime: 10,
        isVeg: false
      },
      {
        name: 'Acai Bowl',
        description: 'Superfood acai smoothie bowl with fresh fruits and granola',
        price: 240,
        category: 'Bowl',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        restaurant: healthyBites._id,
        rating: 4.6,
        totalReviews: 34,
        tags: ['superfood', 'healthy', 'fruits'],
        preparationTime: 8,
        isVeg: true
      }
    );

    const createdMeals = await Meal.insertMany(meals);
    console.log(`Created ${createdMeals.length} meals`);

    console.log('✅ Database seeded successfully!');
    console.log('Demo credentials:');
    console.log('Email: demo@mealmatch.com');
    console.log('Password: 123456');
    console.log('Admin Email: admin@mealmatch.com');
    console.log('Admin Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = { seedDatabase };
