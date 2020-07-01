const mongoose = require("mongoose");

const dbConnection = async () => {
  const db = mongoose.connection;
  const connect = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDB Connected: ${connect.connection.host}`.cyan.underline.bold
  );
};

module.exports = {
  dbConnection,
};
