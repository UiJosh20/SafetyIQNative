// migrations/YYYYMMDDHHMMSS_create_safetyiq_table.js

exports.up = function (knex) {
  return knex.schema.createTable("safetyiq_table", function (table) {
    table.increments("user_id").primary();
    table.string("callUp_num", 50).notNullable();
    table.string("firstName", 100).notNullable();
    table.string("lastName", 100).notNullable();
    table.string("middleName", 100).nullable();
    table.string("tel", 20).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("frpnum", 100).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.integer("admin_id").unsigned();
    table.foreign("admin_id").references("admin_table.admin_id");

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("safetyiq_table");
};
