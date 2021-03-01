const mongoose = require('mongoose');

const dbConnection = async () => {
  const url = process.env.PROD_MONGO_URI;

  const connect = await mongoose.connect(url, {
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
