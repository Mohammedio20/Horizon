const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./../../models/productModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB, {}).then(() => {
  console.log("### DB connection stablished ###");
});

// Reading the JSON Data

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/productsData.json`, "utf-8"),
);

// IMPORTING THE DATA

const importData = async () => {
  try {
    await Product.create(products);
    console.log("### Data Imported Successfully ###");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETING THE DATA

const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log("### Data Deleted Successfully ###");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
