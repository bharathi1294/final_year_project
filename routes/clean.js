const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const dfd = require('danfojs-node')
const csv = require('csvtojson')


var user_df = ''

router.post('/clean',ensureAuthenticated, async (req,res)=>{
    var filename = req.body.filename
    await dfd.read_csv('./public/uploads/'+filename)
  .then(df => {
      user_df = df.copy()
      res.render('dash_temp/analysis',{filename:req.body.filename,
        columns:df.columns,
        datatypes:df.ctypes.data,
        missing_values:df.isna().sum().data})
  }).catch(err=>{
      console.log(err)
      req.flash('error_msg',"There is some error in this file!")
      res.redirect('/analysis')
 })  
})

router.get('/sample',ensureAuthenticated,(req,res)=>{
})





module.exports = router