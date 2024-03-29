const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { dbConnection } = require('./config/dbConnection');
const colors = require('colors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

//Load Environment Variables
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 3000;

//Connect to db
dbConnection();
//Routes path
const AttendanceRoutes = require('./api/Attendance/attendance.routes');
const ParentProductRoutes = require('./api/ParentProduct/parent-product.routes');
const SkuRoutes = require('./api/Sku/sku.routes');
const TerritoryRoutes = require('./api/Territory/territory.routes');
const ZoneRoutes = require('./api/Zone/zone.routes');
const DistrictRoutes = require('./api/District/district.routes');
const AreaRoutes = require('./api/Area/area.routes');
const BeatRoutes = require('./api/Beat/beat.routes');
const SuperStockistRoutes = require('./api/SuperStockist/super-stockist.routes');
const DistributorRoutes = require('./api/Distributor/distributor.routes');
const RetailerRoutes = require('./api/Retailer/retailer.routes');
const PrimaryOrderRoutes = require('./api/PrimaryOrder/primary-order.routes');
const SecondaryOrderRoutes = require('./api/SecondaryOrder/secondary-order.routes');
const SecondPrimaryOrderRoutes = require('./api/SecondPrimaryOrder/second-primary-order.routes');
const UserRoutes = require('./api/User/user.routes');
const AuthRoutes = require('./api/Auth/auth.routes');
const { STATUS } = require('./constants/controller.constants');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan HTTP logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// simulate delay response
// app.use((req, res, next) => {
//   setTimeout(() => next(), 2000);
// });

app.get('/', function (req, res) {
  return res.status(200).json({
    status: STATUS.OK,
    message: 'Server is connected',
  });
});

// Routes which should handle requests
app.use('/api/v1/user-attendance', AttendanceRoutes);
app.use('/api/v1/parent-product', ParentProductRoutes);
app.use('/api/v1/sku', SkuRoutes);
app.use('/api/v1/territory', TerritoryRoutes);
app.use('/api/v1/zone', ZoneRoutes);
app.use('/api/v1/district', DistrictRoutes);
app.use('/api/v1/area', AreaRoutes);
app.use('/api/v1/beat', BeatRoutes);
app.use('/api/v1/super-stockist', SuperStockistRoutes);
app.use('/api/v1/distributor', DistributorRoutes);
app.use('/api/v1/retailer', RetailerRoutes);
app.use('/api/v1/retail-visits', RetailerRoutes);
app.use('/api/v1/order/primary-order', PrimaryOrderRoutes);
app.use('/api/v1/order/second-primary-order', SecondPrimaryOrderRoutes);
app.use('/api/v1/order/secondary-order', SecondaryOrderRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/auth', AuthRoutes);

app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});
