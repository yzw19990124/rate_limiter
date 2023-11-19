//This is a mocking server testing the rate limiter.
const { access } = require('fs');
const db = require('./DB');
const redis = require('redis');
const client = redis.createClient({url: 'redis://localhost:6379'});//Setting Redis on localhost
const express = require('express');
const app = express();

client.on('error', err => console.log('Redis client error', err));
client.connect();
app.listen(3000, () => console.log('Connected to server.'));

//Shutting down db server properly
//Signal interrupt: Triggers when user manually interrupt a process
process.on('SIGINT', async () => {
    console.log('Server is shutting down');
    await client.quit();
    db.closePool();
    process.exit(0);
});
//Signal terminate: Triggers when processes request its termination
process.on('SIGTERM', async () => {
    console.log('Server is shutting down');
    await client.quit();
    db.closePool();
    process.exit(0);
});

const req_table = {};

//For testing purpose, assuming the incoming request has a format like this:
//curl -H 'user: name1' http://localhost:3000/current_user_methods
//Need to fix db's get function if want to support more psql queries.
app.get('/current_user_simple', function(req, res) {
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
            //console.log(typeof info);
            res.send(info + '\n');
        }
    });
});

app.get('/current_user_redis', async function(req, res) {
    //Rate Limiter, Same 5s but through Redis module. 
    const {user} = req.headers;
    try {
        const last_req = await client.get(user);

        if (last_req) {
            if (Date.now() - last_req < 5000) {
                res.status(429).send('Access Denied. Too many requets.');
                return;
            }
        }

        db.get('current_user', (err, info) => {
            if (err) {
                res.send(err + '\n');
            } else {
                client.set(user, Date.now());
                //console.log(typeof info);
                res.send(info + '\n');
            }
        });
    } catch (err) {
        console.error('Redis error: ', err);
        res.status(500).send('Internal Server Error')
    }
});