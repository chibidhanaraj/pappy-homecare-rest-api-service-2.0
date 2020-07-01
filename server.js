const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { dbConnection } = require("./config/dbConnection");
const colors = require("colors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

//Load Environment Variables
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 3000;

//Connect to db
dbConnection();
//Routes path
const productRoutes = require("./api/routes/ProductRoutes");
const skuRoutes = require("./api/routes/SkuRoutes");
const zoneRoutes = require("./api/routes/ZoneRoutes");
const districtRoutes = require("./api/routes/DistrictRoutes");
const areaRoutes = require("./api/routes/AreaRoutes");
const beatAreaRoutes = require("./api/routes/BeatAreaRoutes");
const customerRoutes = require("./api/routes/CustomerRoutes");
const customerTypeRoutes = require("./api/routes/CustomerTypeRoutes");
const distributorRoutes = require("./api/routes/DistributorRoutes");
const superStockistRoutes = require("./api/routes/SuperStockistRoutes");
const wholeSalerRoutes = require("./api/routes/WholeSalerRoutes");
const directRetailerRoutes = require("./api/routes/DirectRetailerRoutes");
const retailerRoutes = require("./api/routes/RetailerRoutes");
const userRoutes = require("./api/routes/UserRoutes");
const authRoutes = require("./api/routes/AuthRoutes");

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    setTimeout(() => next(), 2500);
  });
}

// Routes which should handle requests
app.use("/api/product", productRoutes);
app.use("/api/sku", skuRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api/district", districtRoutes);
app.use("/api/area", areaRoutes);
app.use("/api/beatarea", beatAreaRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customertype", customerTypeRoutes);
app.use("/api/superstockist", superStockistRoutes);
app.use("/api/distributor", distributorRoutes);
app.use("/api/wholesaler", wholeSalerRoutes);
app.use("/api/directretailer", directRetailerRoutes);
app.use("/api/retailer", retailerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
