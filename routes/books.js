// Create a new router
const express = require("express")
const router = express.Router()

// Database connection 
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('../users/login');
  }
  next();
};

// Search page (open)
router.get('/search', (req, res) => {
  res.render("search.ejs");
});

// Perform search (open)
router.get('/search_result', (req, res, next) => {
  const rawKeyword = req.query.search_text || '';
  const keyword = req.sanitize(rawKeyword);

  const sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  const searchTerm = '%' + keyword + '%';

  db.query(sqlquery, [searchTerm], (err, result) => {
    if (err) return next(err);

    res.render('searchresult.ejs', {
      keyword,
      results: result
    });
  });
});

// List all books – protected
router.get('/list', redirectLogin, (req, res, next) => {
  const sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) return next(err);
    res.render('list.ejs', { availableBooks: result });
  });
});

// Add book page – protected
router.get('/addbook', redirectLogin, (req, res) => {
  res.render('addbook.ejs');
});

// Add book form submission – protected
router.post('/bookadded', redirectLogin, (req, res, next) => {
  const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";

  const name = req.sanitize(req.body.name);
  const price = req.sanitize(req.body.price);

  const newrecord = [name, price];

  db.query(sqlquery, newrecord, (err) => {
    if (err) return next(err);

    res.send('Book added: ' + name + ' (£' + price + ')');
  });
});

// Bargain books – protected
router.get('/bargainbooks', redirectLogin, (req, res, next) => {
  const sqlquery = "SELECT * FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) return next(err);
    res.render('list.ejs', { availableBooks: result });
  });
});

// Export
module.exports = router;