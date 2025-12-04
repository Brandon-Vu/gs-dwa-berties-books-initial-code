var express = require('express');
var router = express.Router();
var db = global.db;

// Get list of books with optional search, price range, and sorting
router.get('/books', function (req, res, next) {
    let search = req.query.search;
    let minprice = req.query.minprice;
    let maxprice = req.query.maxprice;
    let sort = req.query.sort;

    let sql = "SELECT * FROM books WHERE 1=1";

    // Search filter
    if (search) {
        sql += ` AND name LIKE '%${search}%'`;
    }

    // Price range filter
    if (minprice && maxprice) {
        sql += ` AND price BETWEEN ${db.escape(minprice)} AND ${db.escape(maxprice)}`;
    }

    // Sorting
    if (sort === "name") {
        sql += " ORDER BY name ASC";
    }
    if (sort === "price") {
        sql += " ORDER BY price ASC";
    }

    db.query(sql, (err, result) => {
        if (err) {
            res.json(err);
            next(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
