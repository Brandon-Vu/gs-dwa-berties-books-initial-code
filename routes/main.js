const express = require("express")
const router = express.Router()

// Redirect middleware for protected routes
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('./login')
  }
  next()
}

// Homepage
router.get('/', function (req, res, next) {
  res.render('index.ejs')
})

// About page
router.get('/about', function (req, res, next) {
  res.render('about.ejs')
})

// Logout route
router.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/')
    }
    res.redirect('/')   // Redirect to home page after logout
  })
})

module.exports = router
