const jwt = require("jsonwebtoken")

exports.authenticateToken = (req, res, next) => {
  const token = req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
