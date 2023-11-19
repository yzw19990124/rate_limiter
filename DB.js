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
    console.log('Connection successful, current time:', res.rows[0].now);
    pool.end();
  });
  