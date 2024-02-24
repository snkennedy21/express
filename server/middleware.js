const jwt = require("jsonwebtoken");

// Middleware function to verify JWT token
const loginRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "super_secret_access_key", (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden if token is invalid
      }
      req.user = user; // Attach the decoded user object to the request
      next(); // Call the next middleware
    });
  } else {
    res.sendStatus(401); // Unauthorized if no token provided
  }
};

module.exports = {
  loginRequired,
};
