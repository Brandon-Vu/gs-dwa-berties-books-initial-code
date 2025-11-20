# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)VALUES('Brighton Rock', 20.25),('Brave New World', 25.00), ('Animal Farm', 12.99) ;

INSERT INTO users (username, first, last, email, hashedPassword)
VALUES (
  'gold',
  'Gold',
  'Smith',
  'gold.smith@example.com',
  '$2b$10$i15cvtH9CN.zNPsApPZ.eeaYIrUMLMU6cAnPR2frl5LhuoCgMM0xW'
);
