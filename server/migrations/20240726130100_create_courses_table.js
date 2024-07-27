exports.up = function (knex) {
  return knex.schema.createTable("courses_table_table", function (table) {
    table.increments("course_id").primary();
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
  return knex.schema.dropTable("courses_table_table");
};
