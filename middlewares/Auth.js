const User = require("../models/user");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwt_secret_key = process.env.JWT_SECRET_KEY;

const commonAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Check authorization header if token not found in cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }

    const decoded = jwt.verify(token, jwt_secret_key);

    // Check for admin first
    const admin = await Admin.findById(decoded._id);
    if (admin) {
      req.admin = admin;
      return next();
    }

    // Check for user
    const user = await User.findById(decoded._id);
    if (user) {
      req.user = user;
      return next();
    }

    // If neither found
    return res.status(404).json({ error: "User or admin not found" });

  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: err.message });
  }
};

module.exports = commonAuth;
