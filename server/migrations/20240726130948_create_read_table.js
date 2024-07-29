exports.up = function (knex) {
  return knex.schema.dropTableIfExists("read_table").then(() => {
    return knex.schema.createTable("read_table", function (table) {
      table.increments("read_id").primary();
      table.string("read_course").notNullable();
      table.string("read_title").notNullable();
      table.text("read_description").notNullable();
      table.string("read_image").nullable();
      table.text("read_note");
      table.integer("read_duration").notNullable();
      table.timestamp("createdate").defaultTo(knex.fn.now());

      table
        .integer("readcourse_id")
        .unsigned()
        .references("readcourse_id")
        .inTable("readcourse_table")
        .onDelete("CASCADE");
      table
        .integer("admin_id")
        .unsigned()
        .references("admin_id")
        .inTable("admin_table")
        .onDelete("CASCADE");
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("read_table");
};
