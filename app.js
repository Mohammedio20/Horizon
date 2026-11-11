const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const sanitize = require("@exortek/express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");

const GlobalErrorHandler = require("./controllers/errController");
const AppError = require("./utils/appError");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.set("query parser", "extended");

//USING MIDDLEWARE

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
app.use(
  "/api",
  rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message:
      "We have received too many requests from this IP. Please try again after an hour.",
  }),
);

app.use(
  "/api/v1/auth/login",
  rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000,
    skipSuccessfulRequests: true,
    message: "Too many login attempts. Please try again after an hour.",
  }),
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(sanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// MiddleWare Stack
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// My Own MiddleWare
app.use((req, res, next) => {
  console.log("### Mohammed is a greate Software Engineer ###");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//### Routers ###
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

// Handling invalid routes
app.all("*splat", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Golbal Error Handling MiddleWare

app.use(GlobalErrorHandler);
module.exports = app;
