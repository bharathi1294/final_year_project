const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const dfd = require('danfojs-node')
const csv = require('csvtojson')


var user_df = ''
var i = 0
var filename = ''

router.get('/df_empty',ensureAuthenticated,(req,res)=>{
  user_df = ''
  i=0
  filename = ''
  res.redirect('/dashboard')
})

router.get('/clean',ensureAuthenticated,(req,res)=>{
  res.render('dash_temp/analysis',{filename:filename,
    columns:user_df.columns,
    datatypes:user_df.ctypes.data,
    data:user_df.head(40).data,
    missing_values:user_df.isna().sum().data})
})


router.post('/clean',ensureAuthenticated, async (req,res)=>{
    filename = req.body.filename
    await dfd.read_csv('./public/uploads/'+filename)
  .then(df => {
    if(i!=0){
      df=user_df
    }
      res.render('dash_temp/analysis',{filename:req.body.filename,
        columns:df.columns,
        datatypes:df.ctypes.data,
        data:df.head(40).data,
        missing_values:df.isna().sum().data})
        user_df = df.copy()
  }).catch(err=>{
      console.log(err)
      req.flash('error_msg',"There is some error in this file!")
      res.redirect('/analysis')
 })  
})

router.post('/change_datatype',ensureAuthenticated,async(req,res)=>{
  var d_name =req.body.column_datatype
  var d_option = req.body.selectpicker
  try{
    user_df= user_df.astype({column:d_name, dtype:d_option})
    req.flash("success_msg","Data type had been changed!")
    res.redirect('/file/clean')
  }
  catch(e){
    req.flash('error_msg',"Enter column name correctly!")
    res.redirect('/file/clean')
  }
})


router.post('/df_fill',ensureAuthenticated,(req,res)=>{
  var c_name = req.body.column_datatype
  var c_option = req.body.selectpicker
  var r_value = req.body.replace
  if(c_option == 'mean'){
    user_df.fillna({columns:[c_name],values:[user_df[c_name].mean(axis=r_value)],inplace:true})
  }
  req.flash("success_msg","Column value is changed!")
  res.redirect("/file/clean")
})




module.exports = router