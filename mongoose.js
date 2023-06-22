const prompt = require('prompt-sync')();
const mongoose = require('mongoose');

// Shop Schema
const shopSchema = new mongoose.Schema({
  name: String,
  rent: Number,
});

// Shop model
const Shop = mongoose.model('Shop', shopSchema);

class SumOfNShopRents {
  constructor() {
    this.shops = [];
  }

  addShop(shop) {
    this.shops.push(shop);
  }

  getSumOfNShops(n) {
    const sortedRents = this.shops
      .map(shop => shop.rent)
      .sort((a, b) => a - b);
    const sumOfNShops = sortedRents.slice(0, n).reduce((acc, rent) => acc + rent, 0);
    return sumOfNShops;
  }
}

async function connectToDatabase() {
  try {
    const uri = 'mongodb+srv://tejaswinise22:teju0305@cluster0.gvq88oy.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection URI
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

async function saveShopsToDatabase(shops) {
  try {
    await Shop.insertMany(shops);

    console.log('Shops saved to MongoDB successfully.');
  } catch (error) {
    console.error('Error saving shops to MongoDB:', error);
  }
}

async function readShopsFromDatabase() {
  try {
    const shops = await Shop.find();
    return shops;
  } catch (error) {
    console.error('Error reading shops from MongoDB:', error);
    return [];
  }
}

async function saveTotalRentToDatabase(totalRent) {
  try {
    await Shop.create({ name: 'Total Rent', rent: totalRent });

    console.log('Total rent saved to MongoDB successfully.');
  } catch (error) {
    console.error('Error saving total rent to MongoDB:', error);
  }
}

async function updateShopInDatabase(shop) {
  try {
    await Shop.updateOne({ name: shop.name }, { rent: shop.rent });

    console.log(`Shop '${shop.name}' updated successfully.`);
  } catch (error) {
    console.error(`Error updating shop '${shop.name}' in MongoDB:`, error);
  }
}

async function deleteShopFromDatabase(shopName) {
  try {
    await Shop.deleteOne({ name: shopName });

    console.log(`Shop '${shopName}' deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting shop '${shopName}' from MongoDB:`, error);
  }
}

async function main() {
  const sumOfNShopRents = new SumOfNShopRents();

  const numberOfShops = parseInt(prompt("Enter the number of shops:"));

  for (let i = 0; i < numberOfShops; i++) {
    const shopName = prompt(`Enter the name of shop ${i + 1}:`);
    const rent = parseFloat(prompt(`Enter the rent for shop ${i + 1}:`));

    const shop = new Shop({ name: shopName, rent });
    sumOfNShopRents.addShop(shop);
  }

  const n = parseInt(prompt("Enter the value of 'n':"));
  const sum = sumOfNShopRents.getSumOfNShops(n);
  console.log(`The sum of rents for the top ${n} shops is: ${sum}`);

  await connectToDatabase();

  await saveShopsToDatabase(sumOfNShopRents.shops);
  await saveTotalRentToDatabase(sum);

  const shopsFromDB = await readShopsFromDatabase();
  console.log('Shops retrieved from MongoDB:', shopsFromDB);

  // Prompt user for CRUD operations
  const operation = prompt("Enter the CRUD operation to perform (C: Create, R: Read, U: Update, D: Delete):");
  switch (operation.toUpperCase()) {
    case 'C':
      const shopName = prompt("Enter the name of the shop to create:");
      const rent = parseFloat(prompt("Enter the rent for the shop:"));
      const newShop = new Shop({ name: shopName, rent });
      await saveShopsToDatabase([newShop]);
      break;
    case 'R':
      const retrievedShops = await readShopsFromDatabase();
      console.log('Shops retrieved from MongoDB:', retrievedShops);
      break;
    case 'U':
      const shopToUpdateName = prompt("Enter the name of the shop to update:");
      const updatedRent = parseFloat(prompt("Enter the updated rent for the shop:"));
      const shopToUpdate = shopsFromDB.find(shop => shop.name === shopToUpdateName);
      if (shopToUpdate) {
        shopToUpdate.rent = updatedRent;
        await updateShopInDatabase(shopToUpdate);
      } else {
        console.log(`Shop '${shopToUpdateName}' not found.`);
      }
      break;
    case 'D':
      const shopToDeleteName = prompt("Enter the name of the shop to delete:");
      await deleteShopFromDatabase(shopToDeleteName);
      break;
    default:
      console.log("Invalid operation.");
  }

  await mongoose.disconnect();
}

main();
