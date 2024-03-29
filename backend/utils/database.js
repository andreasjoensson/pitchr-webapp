const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "pitchr",
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
  }
);

module.exports = sequelize;
