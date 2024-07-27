exports.up = function (knex) {
  return knex.schema.createTable("admin_table", function (table) {
    table.increments("admin_id").primary();
    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 255).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("admin_table");
};
