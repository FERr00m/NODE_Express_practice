// ======> MongoDb connection

const { credentials } = require('./config');

// initialize database connection
const mongoose = require('mongoose');

const pass = encodeURIComponent(credentials.mongo.password);
let connectionString = credentials.mongo.connectionString;
connectionString = connectionString.replace('<password>', pass);
if (!connectionString) {
  console.error('MongoDB connection string missing!');
  process.exit(1);
}
mongoose.connect(connectionString, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB error: ' + err.message);
  process.exit(1);
});
db.once('open', () => console.log('MongoDB connection established'));

// seed vacation data (if necessary)
const Vacation = require('./models/vacation.js');

Vacation.find((err, vacations) => {
  if (err) return console.error(err);
  if (vacations.length) return;

  new Vacation({
    name: 'Hood River Day Trip',
    slug: 'hood-river-day-trip',
    category: 'Day Trip',
    sku: 'HR199',
    description:
      'Spend a day sailing on the Columbia and ' +
      'enjoying craft beers in Hood River!',
    price: 99.95,
    tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Oregon Coast Getaway',
    slug: 'oregon-coast-getaway',
    category: 'Weekend Getaway',
    sku: 'OC39',
    description: 'Enjoy the ocean air and quaint coastal towns!',
    price: 269.95,
    tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Rock Climbing in Bend',
    slug: 'rock-climbing-in-bend',
    category: 'Adventure',
    sku: 'B99',
    description: 'Experience the thrill of climbing in the high desert.',
    price: 289.95,
    tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
    inSeason: true,
    requiresWaiver: true,
    maximumGuests: 4,
    available: false,
    packagesSold: 0,
    notes: 'The tour guide is currently recovering from a skiing accident.',
  }).save();
});

const VacationInSeasonListener = require('./models/vacationInSeasonListener');

module.exports = {
  getVacations: async (options = {}) => Vacation.find(options),
  addVacationInSeasonListener: async (email, sku) => {
    await VacationInSeasonListener.updateOne(
      { email },
      { $push: { skus: sku } },
      { upsert: true }
    );
  },
  getVacationBySku: async (options = {}) => Vacation.find(options),
};
//MongoDb connection END <======

// ======> Postgre connection
// const { Pool } = require('pg');
// const _ = require('lodash');

// const { credentials } = require('./config');

// const { connectionString } = credentials.postgres;
// const pool = new Pool({ connectionString });

// module.exports = {
//   getVacations: async () => {
//     const { rows } = await pool.query('SELECT * FROM VACATIONS');
//     return rows.map((row) => {
//       const vacation = _.mapKeys(row, (v, k) => _.camelCase(k));
//       vacation.price = parseFloat(vacation.price.replace(/^\$/, ''));
//       vacation.location = {
//         search: vacation.locationSearch,
//         coordinates: {
//           lat: vacation.locationLat,
//           lng: vacation.locationLng,
//         },
//       };
//       return vacation;
//     });
//   },
//   getVacationBySku: async (sku) => {
//     const { rows } = await pool.query('SELECT * FROM VACATIONS');
//     return rows.map((row) => {
//       const vacation = _.mapKeys(row, (v, k) => _.camelCase(k));
//       vacation.price = parseFloat(vacation.price.replace(/^\$/, ''));
//       vacation.location = {
//         search: vacation.locationSearch,
//         coordinates: {
//           lat: vacation.locationLat,
//           lng: vacation.locationLng,
//         },
//       };
//       return vacation;
//     });
//   },
//   addVacationInSeasonListener: async (email, sku) => {
//     await pool.query(
//       'INSERT INTO vacation_in_season_listeners (email, sku) ' +
//         'VALUES ($1, $2) ' +
//         'ON CONFLICT DO NOTHING',
//       [email, sku]
//     );
//   },
// };
//Postgre connection END <======

// ======> MySQL connection
// const { Sequelize, QueryTypes } = require('sequelize');
// const { credentials } = require('./config');

// const mysql = credentials.mysql;

// const sequelize = new Sequelize(
//   mysql.database,
//   mysql.username,
//   mysql.password,
//   {
//     host: mysql.host,
//     dialect: 'mysql',
//   }
// );

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();

// module.exports = {
//   getCars: async () => {
//     try {
//       return await sequelize.query('SELECT * FROM `cars`', {
//         type: QueryTypes.SELECT,
//       });
//     } catch (error) {
//       console.error('Unable to connect to the database:', error);
//     }
//   },
// };
//MySQL connection END <======
