var express = require('express')
var router = express.Router()
const bcrypt = require('bcrypt')

const saltRounds = 10


router.get('/register', (req, res) => {
  res.render('register.ejs')
})

// Database setup
router.post('/registered', (req, res, next) => {
  const plainPassword = req.body.password
  const username = req.body.username
  const first = req.body.first
  const last = req.body.last
  const email = req.body.email

  if (!username || !plainPassword) {
    return res.send("Username and password required.")
  }

  bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) return next(err)

    const sql = `INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)`
    const params = [username, first, last, email, hashedPassword]

    db.query(sql, params, (err2) => {
      if (err2) return next(err2)

      let output =
        `Hello ${first} ${last}! You are now registered. ` +
        `Your password is: ${plainPassword} and your hashed password is: ${hashedPassword}`

      res.send(output)
    })
  })
})

// User listing
router.get('/list', (req, res, next) => {
  db.query(
    "SELECT username, first, last, email FROM users ORDER BY username",
    (err, results) => {
      if (err) return next(err)
      res.render("userlist.ejs", { users: results })
    }
  )
})


router.get('/login', (req, res) => {
  res.render("login.ejs", { error: null })
})

// Login handling with audit logging
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

  const sql = "SELECT * FROM users WHERE username = ?"

  db.query(sql, [username], (err, rows) => {
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

      logAttempt(username, true, ip)
      res.send(`Login successful! Welcome back, ${user.first} ${user.last}`)
    })
  })
})

// Audit log viewing
router.get('/audit', (req, res, next) => {
  db.query(
    "SELECT username, success, ip_address, attempted_at FROM login_audit ORDER BY attempted_at DESC",
    (err, results) => {
      if (err) return next(err)
      res.render("audit.ejs", { audit: results })
    }
  )
})

module.exports = router
