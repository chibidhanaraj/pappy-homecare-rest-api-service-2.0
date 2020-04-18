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

app.use(errorHandler);

app.listen(PORT, () => console.log(`server running on ${PORT}`.bgBrightBlue));
