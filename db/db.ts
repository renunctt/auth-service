import { Database } from 'bun:sqlite'

const db = new Database('./data/auth.sqlite', { create: true })

db.exec('PRAGMA journal_mode = WAL;')

db.query(
  `CREATE TABLE IF NOT EXISTS user
(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);`
).run()

db.query(
  `CREATE TABLE IF NOT EXISTS token
(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  refreshToken TEXT NOT NULL,
  userId INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user (id)
);`
).run()

export default db
