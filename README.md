# Api_RateLimiter
This a single node environment , Implement an API
which when called returns the number of requests made till now and rate limits any
requests after X requests with 60 seconds.
Returns a 429 HTTP error response when the user hits the rate limit X. 
The response header contains the X-WAIT-TILL (time when the next API request to succeed) and X-RATE-LIMIT (the rate limit X
enforced) details.

#How_to_use
After cloning the files do an 'npm install' which gets all the required dependencies.
To start the service : 'node index.js' , 
If the server starts running you can hit the API at : 'http://localhost:3000/getRequestCount'.
To run tests do an 'npm test'.

#Rate_Limiting_Algorithm
we have used TOKEN BUCKET algorithm ,we assign tokens on a user level. For a given time duration d, the number of request 'r' that a user can receive is defined. Every time a new request arrives at a server, there are two operations that happen:
1.we will fetch the token count
2.we will update the token count

This algorithm is memory efficient because we are saving less data per user for our application.

#Design_Decisions

Database:
we have considered using mongodb , redis , internal file system.
but since our use case is a key-value pair , and we have to provide very minimal latency in the process of rateLimiting the requests.
we have chosen Redis.






