exports.up = function (knex) {
  return knex.schema.createTable("readcourse_table", function (table) {
    table.increments("readcourse_id").primary();
    table.string("name").notNullable();
    table
      .integer("admin_id")
      .unsigned()
      .references("admin_id")
      .inTable("admin_table")
      .onDelete("CASCADE");

    table
      .integer("user_id")
      .unsigned()
      .references("user_id")
      .inTable("safetyiq_table")
      .onDelete("CASCADE");
      
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("readcourse_table");
};
