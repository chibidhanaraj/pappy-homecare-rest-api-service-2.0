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

// Routes which should handle requests
app.use('/api/parent-product', ParentProductRoutes);
app.use('/api/sku', SkuRoutes);
app.use('/api/territory', TerritoryRoutes);
app.use('/api/zone', ZoneRoutes);
app.use('/api/district', DistrictRoutes);
app.use('/api/area', AreaRoutes);
app.use('/api/beat', BeatRoutes);
app.use('/api/super-stockist', SuperStockistRoutes);
app.use('/api/distributor', DistributorRoutes);
app.use('/api/retailer', RetailerRoutes);
app.use('/api/order/primary-order', PrimaryOrderRoutes);
app.use('/api/order/second-primary-order', SecondPrimaryOrderRoutes);
app.use('/api/order/secondary-order', SecondaryOrderRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/auth', AuthRoutes);

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
