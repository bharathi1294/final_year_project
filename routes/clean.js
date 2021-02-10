const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const dfd = require('danfojs-node')

var user_df = ''

router.post('/clean',ensureAuthenticated,(req,res)=>{
    var filename = req.body.filename
    dfd.read_csv('./public/uploads/'+filename)
  .then(df => {
      user_df = df.copy()
      res.render('dash_temp/analysis',{filename:req.body.filename,
        columns:df.columns,
        datatypes:df.ctypes.data,
        missing_values:df.isna().sum().data})
  }).catch(err=>{
      console.log(err)
    res.redirect('/analysis')
 })
    
})

router.get('/sample',ensureAuthenticated,(req,res)=>{
})





module.exports = router