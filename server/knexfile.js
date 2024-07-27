require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      // password: process.env.DB_PASSWORD || undefined, // Use undefined if there's no password
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: false,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
  },
  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      // password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
  },
};
