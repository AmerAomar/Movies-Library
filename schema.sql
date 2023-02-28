DROP TABLE IF EXISTS moviestable;
CREATE TABLE IF NOT EXISTS moviestable (
   id SERIAL PRIMARY KEY,
   title VARCHAR(255),
   release_year INT,
   director VARCHAR(255),
   genre VARCHAR(255),
   rating DECIMAL(3,1)
);
