const mongoose = require("mongoose");

const dbConnection = async () => {
  const url = `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE_NAME}`;
  const db = mongoose.connection;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  db.once("open", () => {
    console.log("Database connected Successfully:", url);
  });

  db.on("error", (err) => {
    console.error("connection error:", err);
  });
};

module.exports = {
  dbConnection,
};
