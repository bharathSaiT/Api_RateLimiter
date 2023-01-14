const express = require('express');
const app = express();
const redis = require('./redis');
const config = require('./config');

//This endpoint provides the user with the number of all their requests.
app.get('/getRequestCount', async (req, res) => {
    const user = req.headers.user;
    req.requestId = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    if(!user )
    {
        res.set('X-Request-ID',req.requestId);
        res.status(400).json('Please provide user details in request header.');
        return;
    }
    const requests = await redis.incr(user);
    if(requests === 1){
        await redis.expire(user, config.rateLimitPeriod);
        res.set('X-Request-ID',req.requestId);
        res.json(`You have made ${requests} request.`);
        return;
    }
    //if user exceeds the limit
    if(requests > config.rateLimit){
        const timeLeft = await redis.ttl(user);        
        const currentTime = new Date();
        const userData = {
            user: user,
            requestTime: JSON.stringify(currentTime),
            requestId: req.requestId,
            requestCount: requests
        };
        const userDataJson = JSON.stringify(userData);
        console.log(userDataJson);
        // Return a 429 error with the X-WAIT-TILL,X-RATE-LIMIT headers
        res.set('X-WAIT-TILL', `you can try after ${timeLeft} seconds`);
        res.set('X-RATE-LIMIT', config.rateLimit);
        res.set('X-Request-ID',req.requestId);
        res.status(429).json( 'Too many requests.');
        return;
    }
    else 
    {
        res.set('X-Request-ID',req.requestId);
        res.json( `You have made ${requests} requests.`);
    }
});

app.listen(config.port, () => {
    console.log(`Server started at port:${config.port}`);
})

module.exports = app;