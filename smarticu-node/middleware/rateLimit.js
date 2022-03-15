const rateLimit = require("express-rate-limit");

const rateLimitMiddleware = rateLimit({
    windowMs: 60* 1000,
    max: 1,
    message: 'Try getting OTP after 60 seconds',
    headers: true,
  });
  
  // Export it
  module.exports = rateLimitMiddleware