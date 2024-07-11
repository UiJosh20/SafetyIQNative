// migrations/xxxx_create_resources_table.js

exports.up = function (knex) {
  return knex.schema.createTable("resources_table", function (table) {
    table.increments("resource_id").primary(); // Primary key with auto-increment
    table.string("title", 255).notNullable(); // Title column
    table.text("description").notNullable(); // Description column
    table
      .integer("course_id")
      .unsigned()
      .references("id")
      .inTable("courses")
      .onDelete("CASCADE"); // Foreign key referencing courses table
    table
      .integer("admin_id")
      .unsigned()
      .references("admin_id")
      .inTable("admin_table")
      .onDelete("CASCADE"); // Foreign key referencing admin_table
    table.timestamps(true, true); // Timestamps
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("resources_table");
};
