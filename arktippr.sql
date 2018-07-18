

CREATE TABLE IF NOT EXISTS users (
  username varchar(30) PRIMARY KEY,
  address varchar(34) NOT NULL,
  seed text NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  submission varchar(30) PRIMARY KEY
);