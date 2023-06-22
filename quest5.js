const express = require('express');
const mongoose = require('mongoose');
const prompt = require('prompt-sync')();

// Define Shop schema
const shopSchema = new mongoose.Schema({
  name: String,
  rent: Number
});

// Create Shop model
const ShopModel = mongoose.model('Shop', shopSchema);

// Connect to MongoDB
mongoose.connect('mongodb+srv://tejaswinise22:teju0305@cluster0.gvq88oy.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    startServer(); // Start the Express server after successful MongoDB connection
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

// Create Express server
function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint to add a shop
  app.post('/shops', async (req, res) => {
    const { name, rent } = req.body;

    try {
      const shop = new ShopModel({ name, rent });
      await shop.save();
      res.status(201).json({ message: 'Shop added successfully' });
    } catch (error) {
      console.error('Error adding shop:', error);
      res.status(500).json({ message: 'Failed to add shop' });
    }
  });

  // Start the server
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
}

// Rest of the code remains the same
class RentCalculator {
  constructor() {
    this.shops = [];
  }

  async addShop(name, rent) {
    const shop = new ShopModel({ name, rent });
    await shop.save();
    this.shops.push(shop);
  }

  async calculateTotalRent() {
    let totalRent = 0;
    for (const shop of this.shops) {
      totalRent += shop.rent;
    }
    return totalRent;
  }
}

async function main() {
  const calculator = new RentCalculator();

  // Taking user input for number of shops
  const numShops = parseInt(prompt('Enter the number of shops: '));

  // Taking user input for each shop's name and rent
  for (let i = 1; i <= numShops; i++) {
    const name = prompt(`Enter the name of shop ${i}: `);
    const rent = parseFloat(prompt(`Enter the rent of shop ${i}: `));
    await calculator.addShop(name, rent);
  }

  // Calculating total rent
  const totalRent = await calculator.calculateTotalRent();
  console.log("Total Rent:", totalRent);
}

// Calling the main function
main();
