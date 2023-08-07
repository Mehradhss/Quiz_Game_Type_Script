const Redis = require('ioredis');

// Replace the following connection details with your Redis server configuration
const redisOptions = {
  host: 'redis', // Replace with your Redis server host
  port: 6379 // Replace with your Redis server port
};

// const redisClient = new Redis(redisOptions);
const redisClient = new Redis(redisOptions);
module.exports = redisClient;
