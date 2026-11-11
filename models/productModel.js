const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const Category = require("./categoryModel");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        100,
        "A product name must have less or equal than 100 characters",
      ],
      minlength: [
        3,
        "A product name must have more or equal than 3 characters",
      ],
      validate: [
        validator.isAlpha,
        "Product name must only contain characters",
      ],
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "A product must have a price"],
      min: [0, "Price must be a positive number"],
    },

    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Discount price must be less than the regular price",
      },
    },

    // category: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    //   required: true,
    // },

    imageCover: {
      type: String,
      required: true,
    },

    images: [String],

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sizes: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
    ],

    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1.0, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    secretProduct: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("discountedPrice").get(function () {
  return this.price - this.priceDiscount;
});

// documnet MiddleWare
// Pre hook
productSchema.pre("save", function () {
  this.slug = slugify(this.name);
});

// Post hook
// productSchema.pre("save", function (next) {
//   console.log(this);
//   next();
// });

// productSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next()
// });

// Query MiddleWare
// pre
productSchema.pre(/^find/, function () {
  this.where({ secretProduct: { $ne: true } });

  this.start = Date.now();
});

productSchema.post(/^find/, function (docs) {
  console.log(`Query took ${Date.now() - this.start} ms`);
});

// Aggregation MiddleWare
productSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { secretProduct: { $ne: true } } });
});
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
