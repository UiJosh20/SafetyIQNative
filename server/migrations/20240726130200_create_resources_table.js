exports.up = function (knex) {
  return knex.schema.createTable("resources_table", function (table) {
    table.increments("resource_id").primary();
    table.string("title", 255).notNullable();
    table.text("description").notNullable();
    table.integer("time_taken").notNullable();
    table.string("image").nullable();
    table.text("note").notNullable();
    table.timestamps(true, true);
    table
      .integer("course_id")
      .unsigned()
      .references("course_id")
      .inTable("courses_table")
      .onDelete("CASCADE");
    table
      .integer("admin_id")
      .unsigned()
      .references("admin_id")
      .inTable("admin_table")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("resources_table");
};
