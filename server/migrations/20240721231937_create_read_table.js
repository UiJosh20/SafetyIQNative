exports.up = function (knex) {
  return knex.schema.dropTableIfExists("read_table").then(() => {
    return knex.schema.createTable("read_table", function (table) {
      table.increments("read_id").primary();
      table.string("read_course").notNullable();
      table.string("read_title").notNullable();
      table.text("read_description").notNullable();
      table.text("read_note");
      table.integer("read_duration").notNullable();
      table.timestamp("createdate").defaultTo(knex.fn.now());

      table.integer("admin_id").unsigned().notNullable();
      table.integer("user_id").unsigned().notNullable();

      table
        .foreign("admin_id")
        .references("admin_id")
        .inTable("admin_table")
        .onDelete("CASCADE");
      table
        .foreign("user_id")
        .references("user_id")
        .inTable("safetyiq_table")
        .onDelete("CASCADE");
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("read_table");
};
