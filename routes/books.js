// Create a new router
const express = require("express")
const router = express.Router()

// Reuse the same pattern for route protection
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('./login')
  }
  next()
}

router.get('/search', function (req, res, next) {
  res.render("search.ejs")
})

router.get('/search_result', function (req, res, next) {
  // Sanitise search text to avoid XSS
  const rawKeyword = req.query.search_text || ''
  const keyword = req.sanitize(rawKeyword)

  // Perform the database query to find books matching the keyword
  let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  let searchTerm = '%' + keyword + '%';

  db.query(sqlquery, [searchTerm], (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render('searchresult.ejs', {
        keyword: keyword,
        results: result
      });
    }
  });
});

// List all books – protect so only logged-in users can see list
router.get('/list', redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render('list.ejs', { availableBooks: result });
    }
  });
});

// Show the add book form – protect as it modifies data
router.get('/addbook', redirectLogin, function (req, res) {
  res.render('addbook.ejs');
});

// Handle the add book form submission – protect + sanitise
router.post('/bookadded', redirectLogin, function (req, res, next) {
  let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
  const name = req.sanitize(req.body.name)
  const price = req.body.price

  let newrecord = [name, price];

  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.send(
        'Book added: ' +
        name +
        ' (£' +
        price +
        ')'
      );
    }
  });
});

// List books that are bargains (price < 20) – also protect
router.get('/bargainbooks', redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books WHERE price < 20";

  db.query(sqlquery, (err, result) => {
    if (err) next(err);
    else res.render('list.ejs', { availableBooks: result });
  });
});

// Export the router object so index.js can access it
module.exports = router
