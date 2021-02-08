const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const file_db = require('../models/files')
const upload = require('../config/upload')
const csv = require('csv-parser');
const fs = require('fs');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login_temp/login'));

var header = []
var results = []

// Dashboard
router.get('/dashboard', ensureAuthenticated,(req, res)=>{
  res.render('dash_temp/dashboard', {
    user: req.user,
    header:header,
    data:results
  })
  header.length = 0
  results.length = 0
});

//upload
router.post('/upload',ensureAuthenticated,upload,(req,res,next)=>{
  console.log(req.file.filename)
    const file = new file_db({
        filename:req.file.filename,
        userId:req.user._id
    })
    try{
        const newFile = file.save();
        fs.createReadStream('./public/uploads/'+req.file.filename)
        .pipe(csv({ separator: ',',from_line:2}))
        .on('headers', (headers) => {
            header = headers.map(obj => obj);
          })
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', () => {
        });
    }catch(e){
        console.log(e)
    }
    req.flash("success_msg","File uploaded successfully!")
    res.redirect('/dashboard')
})

module.exports = router;