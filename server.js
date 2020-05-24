const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const { dbConnection } = require("./config/dbConnection");
const colors = require("colors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

//Routes path
const categoryRoutes = require("./api/routes/CategoryRoutes");
const productRoutes = require("./api/routes/ProductRoutes");
const zoneRoutes = require("./api/routes/ZoneRoutes");
const districtRoutes = require("./api/routes/DistrictRoutes");
const divisionRoutes = require("./api/routes/DivisionRoutes");
const beatAreaRoutes = require("./api/routes/BeatAreaRoutes");
const customerRoutes = require("./api/routes/CustomerRoutes");
const customerTypeRoutes = require("./api/routes/CustomerTypeRoutes");
const distributorRoutes = require("./api/routes/DistributorRoutes");

//Load Environment Variables
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 3000;

//Connect to db
dbConnection();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
// Routes which should handle requests
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api/district", districtRoutes);
app.use("/api/division", divisionRoutes);
app.use("/api/beatarea", beatAreaRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/customertype", customerTypeRoutes);
app.use("/api/distributor", distributorRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`server running on ${PORT}`.bgBrightBlue));
