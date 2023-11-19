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
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, ''); // Basic sanitization
    const safe_query = `SELECT ${safeKey}`;
    pool.query(safe_query, (err, res) => {
        if (err) {
            console.error('Error occurred when executing query', err);
            callback(err, null);
        } else {
            const resultValue = res.rows.length > 0 ? res.rows[0][safeKey] : null;
            console.log(`Testing query - ${safeKey}: `, resultValue);
            callback(null, resultValue);
        }
    });
};


//Close the db when ther server is shutting down
module.exports.closePool = () => {
    pool.end(() => {
        console.log('Shutting down connection to the postgressql server.')
    });
};