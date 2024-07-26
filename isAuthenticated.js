const jwt = require("jsonwebtoken");
const { config } = require("dotenv");

config();

module.exports = async function isAuthenticated(req, res, next) {
  // "Bearer <token>".split(" ")
  // ["Bearer", "token"]
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }
  const token = authHeader.split(" ")[1];
  // note the env file should be available in the context the middleware is being called from e.g the respective service, since isAuthenticated file is just a
  // normal file and is not an execution context, we have to put the env in the correct folder
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(400).json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
};
