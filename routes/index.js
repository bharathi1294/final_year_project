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
  download_file = ''
  res.redirect('/file/df_empty')
})

// Dashboard
router.get('/dashboard', ensureAuthenticated,async(req, res)=>{
  var files = await file_db.find({userId:req.user._id}).sort({$natural:-1})
  res.render('dash_temp/dashboard', {
    user: req.user,
    header:header,
    data:results.slice(0,400),
    null_values:count_null_values(header,results),
    r_count:row_count,
    files:files,
    c_filename:download_file
  })
  header.length = 0
  row_count = 0
  results.length = 0
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
    const newFile = file.save();
    parseCsv(req.file.filename)
    await new Promise(resolve => setTimeout(resolve, 2000));
    req.flash("success_msg","File uploaded successfully!")
    res.redirect('/dashboard')
})

//open specific file
router.get('/file_name/:filename',async(req,res)=>{
  download_file = req.params.filename
  parseCsv(req.params.filename)
  await new Promise(resolve => setTimeout(resolve, 2000));
  res.redirect('/dashboard')
})

//Download File
router.get('/download',async (req,res)=>{
  try{
  const files = await file_db.find({userId:req.user._id})
  var filenames = files.map(obj => obj.filename)
  if(filenames.indexOf(download_file) != -1){
    res.download('./public/uploads/'+download_file)
  }}catch(e){
    console.log(e)
  }
})

//drop file

router.get('/delete',async (req,res)=>{
  try{
  const files = await file_db.find({userId:req.user._id})
  var filenames = files.map(obj => obj.filename)
  if(filenames.indexOf(download_file) != -1){
    const file_content = await file_db.find({filename:download_file})
    fs.unlink('./public/uploads/'+download_file,(err) => {
      if (err) throw err;
    });
    file_db.findByIdAndDelete(file_content[0]._id,function (err, docs) { 
      if (err){ 
          console.log(err) 
      }
  });
  download_file = ''
  }
  res.redirect('/dashboard')
}catch(e){
  console.log(e)
}
})

const parseCsv = (csv_filename)=>{
  try{
  fs.createReadStream('./public/uploads/'+csv_filename)
        .pipe(csv({ separator: ',',from_line:2,trim:true}))
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
}

router.get('/analysis',ensureAuthenticated,(req,res)=>{
  res.render('dash_temp/analysis',{filename:download_file,columns:[],view:true})
})


router.get('/modal',ensureAuthenticated,(req,res)=>{
  
})

module.exports = router;