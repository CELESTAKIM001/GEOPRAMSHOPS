// Simple in-memory database (replace with MongoDB/PostgreSQL for production)
const { v4: uuidv4 } = require('uuid');

const db = {
  products: [
    {
      id: uuidv4(),
      name: 'Premium Gift Hamper',
      description: 'Luxurious hamper filled with chocolates, wines, and treats',
      price: 2500,
      category: 'Hampers',
      image: 'https://raw.githubusercontent.com/geopramtech/assets/main/hamper1.jpg',
      stock: 15,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Birthday Bouquet',
      description: 'Beautiful fresh flower bouquet perfect for birthdays',
      price: 1200,
      category: 'Flowers',
      image: 'https://raw.githubusercontent.com/geopramtech/assets/main/bouquet1.jpg',
      stock: 30,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Chocolate Box Deluxe',
      description: 'Assorted premium chocolates in elegant packaging',
      price: 800,
      category: 'Chocolates',
      image: 'https://raw.githubusercontent.com/geopramtech/assets/main/choco1.jpg',
      stock: 50,
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  orders: [],
  callbacks: []
};

module.exports = db;
