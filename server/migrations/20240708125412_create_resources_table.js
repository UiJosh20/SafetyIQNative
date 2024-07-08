exports.up = function (knex) {
  return knex.schema.createTable("resources_table", function (table) {
    table.increments("resource_id").primary(); // Primary key with auto-increment
    table.string("title", 255).notNullable(); // Title column
    table.text("description").notNullable(); // Description column
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
