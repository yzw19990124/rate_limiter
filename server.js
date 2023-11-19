//This is a mocking server testing the rate limiter.
const { access } = require('fs');
const db = require('./DB');
const express = require('express');
const app = express();

app.listen(3000, () => console.log('Connected to server.'));

//Shutting down db server properly
//Signal interrupt: Triggers when user manually interrupt a process
process.on('SIGINT', () => {
    console.log('Server is shutting down');
    db.closePool(); // Close the database pool
    process.exit(0);
});
//Signal terminate: Triggers when processes request its termination
process.on('SIGTERM', () => {
    console.log('Server is shutting down');
    db.closePool(); // Close the database pool
    process.exit(0);
});

const req_table = {};

//For testing purpose, assuming the incoming request has a format like this:
//curl -H 'user: name1' http://localhost:3000/current_user
//Need to fix db's get function if want to support more psql queries.
app.get('/current_user', function(req, res) {
    //Rate Limiter, If same user tries submit two requests in between 5s
    //access will get denied due to rate limiting. 
    const {user} = req.headers;
    if (user in req_table) {
        const prev_req_time = req_table[user];
        if (Date.now() - prev_req_time < 5000) {
            res.status(429).send('Access Denied. Too many requets.');
            return;
        }
    }

    db.get('current_user', (err, info) => {
        if (err) {
            res.send(err + '\n');
        } else {
            req_table[user] = Date.now();
            res.send(info + '\n');
        }
    });
});