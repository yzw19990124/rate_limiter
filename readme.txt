Quote from Alex Xu: "In a network system, a rate limiter is 
used to control the rate of traffic sent by a client or a service."
Three main pros of using a rate limiter for your API system:
1. Prevent resource starvation caused by simple DOS attack(DDOS not covered).
2. Reduce running server costs.
3. Prevent overloading the servers from excess requests.

Instruction on how to run the files.
This repo contains two main files: the server file and the database file.
To start the server, you need to have Redis installed and start the redis server
manually.
Upon providing a .env file with your credentials, the server will connect to the 
database server, which we can test the two implemented rate limiters through:
curl -H 'user: name1' http://localhost:3000/current_user_simple
curl -H 'user: name1' http://localhost:3000/current_user_redis