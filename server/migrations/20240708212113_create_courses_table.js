exports.up = function (knex) {
  return knex.schema.createTable("courses", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table
      .integer("admin_id")
      .unsigned()
      .references("admin_id")
      .inTable("admin_table")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("courses");
};
