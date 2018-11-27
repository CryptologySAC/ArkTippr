

CREATE TABLE IF NOT EXISTS users (
  username varchar(30) PRIMARY KEY,
  address varchar(34) NOT NULL,
  seed text NOT NULL,
  platform varchar(8)
);

CREATE TABLE IF NOT EXISTS submissions (
  submission varchar(30) PRIMARY KEY
);