//This is the mock database for the server
require('dotenv').config();
const {Pool} = require('pg');


//Establishing connection to the postgressql server
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

//Execute Queries for testing
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Testing connection successful, current time:', res.rows[0].now);
  });

//Define one functionality of the DB
module.exports.get = (key, callback) => {
    pool.query('select current_user', (err, res) => {
        if (err) {
            console.error('Error occurred when testing queries', err);
            callback(err, null);
        } else {
            console.log('Testing query - current user: ', res.rows[0].current_user);
            callback(null, res.rows[0].current_user);
        }
    });
};

//Close the db when ther server is shutting down
module.exports.closePool = () => {
    pool.end(() => {
        console.log('Shutting down connection to the postgressql server.')
    });
};