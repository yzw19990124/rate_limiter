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

app.get('/user.html', function(req, res) {
    const {user} = req.headers;
    if (user in req_table) {
        const prev_req_time = req_table[user];
        if (Date.now() - prev_req_time < 5000) {
            res.status(429).send('Access Denied. Too many requets.');
            return;
        }
    }

    db.get('user.html', info => {
        req_table[user] = Date.now();
        res.send(info + '\n');
    });
});