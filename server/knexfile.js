require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
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
      password: String(process.env.DB_PASSWORD),
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2, // Minimum number of connections
      max: 10, // Maximum number of connections
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
  },
};
