var express = require('express')
var router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')

const saltRounds = 10

// Middleware to protect routes – only allow logged-in users
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('./login')
  }
  next()
}

router.get('/register', (req, res) => {
  res.render('register.ejs', { errors: [] })
})

// Registration with validation + sanitisation
router.post(
  '/registered',
  [
    check('email')
      .isEmail()
      .withMessage('Email must be valid'),
    check('username')
      .isLength({ min: 5, max: 20 })
      .withMessage('Username must be between 5 and 20 characters'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.render('register.ejs', { errors: errors.array() })
    }

    const plainPassword = req.body.password
    const username = req.sanitize(req.body.username)
    const first = req.sanitize(req.body.first)
    const last = req.sanitize(req.body.last)
    const email = req.sanitize(req.body.email)

    if (!username || !plainPassword) {
      return res.send("Username and password required.")
    }

    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
      if (err) return next(err)

      const sql = `INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)`
      const params = [username, first, last, email, hashedPassword]

      db.query(sql, params, (err2) => {
        if (err2) return next(err2)

        res.send(`Hello ${first} ${last}! You are now registered. Your password is: ${plainPassword} and your hashed password is: ${hashedPassword}`)
      })
    })
  }
)

router.get('/list', redirectLogin, (req, res, next) => {
  db.query(
    "SELECT username, first, last, email FROM users ORDER BY username",
    (err, results) => {
      if (err) return next(err)
      res.render("userlist.ejs", { users: results })
    }
  )
})

router.get('/login', (req, res) => {
  res.render('login.ejs', { error: null })
})

// Audit logging helper
function logAttempt(username, success, ip) {
  db.query(
    "INSERT INTO login_audit (username, success, ip_address) VALUES (?,?,?)",
    [username, success ? 1 : 0, ip],
    () => {}
  )
}

// Login processing
router.post('/loggedin', (req, res, next) => {
  const username = req.body.username
  const password = req.body.password
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, rows) => {
    if (err) return next(err)

    if (rows.length === 0) {
      logAttempt(username, false, ip)
      return res.render('login.ejs', { error: "Invalid username or password" })
    }

    const user = rows[0]

    bcrypt.compare(password, user.hashedPassword, (err2, same) => {
      if (err2) return next(err2)

      if (!same) {
        logAttempt(username, false, ip)
        return res.render('login.ejs', { error: "Invalid username or password" })
      }

      // Successful login
      logAttempt(username, true, ip)
      req.session.userId = username

      res.redirect('./loggedin') // Redirect to home page after login
    })
  })
})

router.get('/loggedin', redirectLogin, (req, res) => {
  res.render('loggedin.ejs', { username: req.session.userId });
});

// Audit log page
router.get('/audit', redirectLogin, (req, res, next) => {
  db.query(
    "SELECT username, success, ip_address, attempted_at FROM login_audit ORDER BY attempted_at DESC",
    (err, results) => {
      if (err) return next(err)
      res.render("audit.ejs", { audit: results })
    }
  )
})

// Logout route
router.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.render('loggedout.ejs')
  })
})


module.exports = router
