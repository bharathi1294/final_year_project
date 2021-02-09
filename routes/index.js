const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const file_db = require('../models/files')
const upload = require('../config/upload')
const csv = require('csv-parser');
const fs = require('fs');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('login_temp/login')
});

var header = []
var results = []
var row_count = 0
var download_file = ' '

//home

router.get('/dash',ensureAuthenticated,(re,res)=>{
  header.length = 0
  row_count = 0
  results.length = 0
  res.redirect('/dashboard')
})
// Dashboard
router.get('/dashboard', ensureAuthenticated,async(req, res)=>{
  res.render('dash_temp/dashboard', {
    user: req.user,
    header:header,
    data:results.slice(0,400),
    null_values:count_null_values(header,results),
    r_count:row_count
  })
});

//count null values
const count_null_values = (header,data)=>{
      var missing_value = 0
      for(var i=0;i<data.length;i++){
        for(var j=0;j<header.length;j++){
              if(data[i][header[j]].length == 0){ 
                    missing_value+=1
          }} 
      }
        return missing_value
}

//upload
router.post('/upload',ensureAuthenticated,upload,async (req,res,next)=>{
  download_file = req.file.filename
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
            row_count+=1
        })
        .on('end', () => {
        });
    }catch(e){
        console.log(e)
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    req.flash("success_msg","File uploaded successfully!")
    res.redirect('/dashboard')
})
//Download File

router.get('/download',async (req,res)=>{
  const files = await file_db.find({userId:req.user._id})
  var filenames = files.map(obj => obj.filename)
  if(filenames.indexOf(download_file) != -1){
    res.download('./public/uploads/'+download_file)
  }
})

module.exports = router;