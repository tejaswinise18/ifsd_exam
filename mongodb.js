const prompt = require('prompt-sync')();
const { MongoClient, ObjectId } = require('mongodb');

class Shop {
  constructor(name, rent) {
    this.name = name;
    this.rent = rent;
  }
}

class ShoppingComplex {
  constructor(collection) {
    this.collection = collection;
  }

  async addShop(shop) {
    await this.collection.insertOne(shop);
  }

  async getShops() {
    const shops = await this.collection.find().toArray();
    return shops;
  }

  async getShopById(shopId) {
    const shop = await this.collection.findOne({ _id: ObjectId(shopId) });
    return shop;
  }

  async updateShop(shopId, updatedShop) {
    await this.collection.updateOne({ _id: ObjectId(shopId) }, { $set: updatedShop });
  }

  async deleteShop(shopId) {
    await this.collection.deleteOne({ _id: ObjectId(shopId) });
  }

  async calculateTotalRent() {
    const result = await this.collection.aggregate([
      { $group: { _id: null, totalRent: { $sum: "$rent" } } }
    ]).toArray();

    return result[0].totalRent || 0;
  }
}

async function main() {
  const uri = 'mongodb+srv://tejaswinise22:teju0305@cluster0.gvq88oy.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection URI
  const dbName = 'complex'; // Replace with your database name
  const collectionName = 'shopping'; // Replace with your collection name
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const shoppingComplex = new ShoppingComplex(collection);

    const operation = parseInt(prompt("Select an operation:\n1. Add Shop\n2. Update Shop\n3. Delete Shop\n4. Calculate Total Rent\n5. Exit\n"));

    switch (operation) {
      case 1:
        console.log("Add Shop:");
        const name = prompt("Enter the name of the shop: ");
        const rent = parseFloat(prompt("Enter the rent of the shop: "));
        const shop = new Shop(name, rent);
        await shoppingComplex.addShop(shop);
        console.log("Shop added successfully.");
        break;

      case 2:
        console.log("Update Shop:");
        const shopIdToUpdate = prompt("Enter the ID of the shop to update: ");
        const updatedShop = await shoppingComplex.getShopById(shopIdToUpdate);
        if (updatedShop) {
          const newName = prompt("Enter the updated name of the shop: ");
          const newRent = parseFloat(prompt("Enter the updated rent of the shop: "));
          updatedShop.name = newName;
          updatedShop.rent = newRent;
          await shoppingComplex.updateShop(shopIdToUpdate, updatedShop);
          console.log("Shop updated successfully.");
        } else {
          console.log("Shop not found.");
        }
        break;

      case 3:
        console.log("Delete Shop:");
        const shopIdToDelete = prompt("Enter the ID of the shop to delete: ");
        const shopToDelete = await shoppingComplex.getShopById(shopIdToDelete);
        if (shopToDelete) {
          await shoppingComplex.deleteShop(shopIdToDelete);
          console.log("Shop deleted successfully.");
        } else {
          console.log("Shop not found.");
        }
        break;

      case 4:
        const totalRent = await shoppingComplex.calculateTotalRent();
        console.log(`The total rent of all shops in the shopping complex is: ${totalRent}`);
        break;

      case 5:
        console.log("Exiting...");
        break;

      default:
        console.log("Invalid operation.");
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main();
