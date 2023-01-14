const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index');
const Redis = require('ioredis');
const config = require('./config');
const redis = new Redis();

const expect = chai.expect;
chai.use(chaiHttp);

describe('API endpoint tests', () => {
    beforeEach(async () => {
        await redis.flushdb();
    });
    it('should return the count of all requests', (done) => {
        chai.request(app)
            .get('/getRequestCount')
            .set('user', 'testuser')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('string');
                expect(res.body).to.equal('You have made 1 request.');
                expect(res.headers['x-request-id']).to.exist;
                done();
            });
    });

    it('should return error when no user is provided', (done) => {
        chai.request(app)
            .get('/getRequestCount')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.be.a('string');
                expect(res.body).to.equal('Please provide user details in request header.');
                expect(res.headers['x-request-id']).to.exist;
                done();
            });
    });

    it('should return error when user exceed rate limit', (done) => {
        redis.set('testuser',config.rateLimit + 1);
        chai.request(app)
            .get('/getRequestCount')
            .set('user', 'testuser')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(429);
                expect(res.headers['x-rate-limit']).to.exist;
                expect(res.headers['x-wait-till']).to.exist;
                expect(res.headers['x-request-id']).to.exist;
                expect(res.body).to.be.a('string');
                expect(res.body).to.equal('Too many requests.');
                done();
            });
    });
});
