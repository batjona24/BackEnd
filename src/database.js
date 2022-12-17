import knex from 'knex';

const database = knex({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite3',
  },
  useNullAsDefault: true,
});

export default database;