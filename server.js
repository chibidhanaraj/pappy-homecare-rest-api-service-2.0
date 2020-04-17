const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const categoryRoutes = require("./api/routes/category");
const productRoutes = require("./api/routes/product");

//Load Environment Variables
const dotenv = require("dotenv");
const dotenvConfig = dotenv.config({ path: "./config/config.env" });
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}
console.log(dotenvConfig.parsed);
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Connect to db
const url = `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE_NAME}`;
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;

db.once("open", () => {
  console.log("Database connected Successfully:", url);
});

db.on("error", (err) => {
  console.error("connection error:", err);
});

// Routes which should handle requests
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
