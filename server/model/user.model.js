const knex = require("knex");
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const db = knex(knexConfig[environment]);

// Log the connection details for debugging (remove in production)
console.log(knexConfig[environment].connection);

module.exports = db;
