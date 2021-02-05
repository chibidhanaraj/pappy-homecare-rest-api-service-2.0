const mongoose = require('mongoose');

const dbConnection = async () => {
  const db = mongoose.connection;
  const url = `mongodb://${process.env.MONGO_URI}/${process.env.DB_DATABASE_NAME}`;

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
