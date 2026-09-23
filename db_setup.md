# Stabbed.wtf D1 Setup

Run these commands to initialize the database:

1. Create the database:
   `npx wrangler d1 create virex-db`

2. Update wrangler.toml with the output ID.

3. Create the links table:
   `npx wrangler d1 execute virex-db --command "CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, original_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, visits INTEGER DEFAULT 0, src TEXT)"`

4. Create the guestbook table:
   `npx wrangler d1 execute virex-db --command "CREATE TABLE IF NOT EXISTS guestbook (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"`

5. For local dev:
   `npx wrangler d1 execute virex-db --local --command "CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, original_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, visits INTEGER DEFAULT 0, src TEXT)"`
   `npx wrangler d1 execute virex-db --local --command "CREATE TABLE IF NOT EXISTS guestbook (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"`

*note: if you dont use wrangler locally or you're running in production cf pages, you can also execute these sql commands directly in the cf d1 dashboard console:*
```sql
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE,
  original_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  visits INTEGER DEFAULT 0,
  src TEXT
);

CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
