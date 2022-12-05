"use strict";
const path = require("path");
require("dotenv").config();
module.exports.getConfig = () => {
  const config = {
    MODE: "Development",
    PORT: process.env.PORT || 5000,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET || "R4ND0M5TR1NG",
  };
  if (process.env.NODE_ENV === "production") {
    config.MODE = "Production";
  }
  return config;
};
