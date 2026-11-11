const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.aliasTopProducts = (req, res, next) => {
  // Object.defineProperties(req, "query", {
  //   value: {
  //     ...req.query,
  //     limit: "5",
  //     sort: "-ratingsAverage,price",
  //     fields: "name,price,ratingsAverage,description",
  //   },
  //   writable: true,
  // });

  // THIS IS AN OLD CODE FOMR EXPRESS VERSION 4;
  // req.query.limit = "5";
  // req.query.sort = "-ratingsAverage,price";
  // req.query.fields = "name,price,ratingsAverage,description";
  next();
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  res.status(200).json({
    status: "success",
    result: products.length,
    requestedAt: req.requestTime,
    data: {
      product: products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$ratingsAverage",
        numProducts: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1;
//     const plan = Product.aggregate([
//       {
//         $unwind: "$StartYear",
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$startDates" },
//           numProductsStart: { $sum: 1 },
//           products: { $push: "$name" },
//         },
//       },
//       {
//         $addFields: { month: "$_id" },
//       },
//       {
//         $project: { _id: 0 },
//       },
//       {
//         $sort: { numProductsStart: -1 },
//       },
//     ]);
//     res.status(200).json({
//       status: "success",
//       data: {
//         plan,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };
