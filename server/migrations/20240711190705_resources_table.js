exports.up = function (knex) {
  return knex.schema.createTable("resources_table", function (table) {
    table.increments("resource_id").primary(); // Primary key with auto-increment
    table.string("title", 255).notNullable(); // Title column
    table.text("description").notNullable(); // Description column
    table.integer("time_taken").notNullable(); // Time taken column
    table.string("image").notNullable(); // Image column
    table.text("note").notNullable(); // Note column
    table.timestamps(true, true); // Timestamps
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
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("resources_table");
};
