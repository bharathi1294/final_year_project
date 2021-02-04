const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login_temp/login'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res)=>{
  res.render('dash_temp/dashboard', {
    user: req.user
  })
});
module.exports = router;