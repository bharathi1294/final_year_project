const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const dfd = require('danfojs-node')
const csv = require('csvtojson')
const file_db = require('../models/files')

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
  res.render('dash_temp/analysis',{
    title:"Analysis",
    filename:filename,
    columns:user_df.columns,
    datatypes:user_df.ctypes.data,
    data:user_df.head(100).data,
    missing_values:user_df.isna().sum().data,
    unique_values:user_df.nunique().data,
    view:false})
})


router.post('/clean',ensureAuthenticated, async (req,res)=>{
    filename = req.body.filename
    await dfd.read_csv('./public/uploads/'+filename)
  .then(df => {
    if(i!=0){
      df=user_df
    }
      res.render('dash_temp/analysis',{
        title:"Analysis",
        filename:req.body.filename,
        columns:df.columns,
        datatypes:df.ctypes.data,
        data:df.head(100).data,
        missing_values:df.isna().sum().data,
        unique_values:df.nunique().data,
        view:false})
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


router.post('/df_fill',ensureAuthenticated,async(req,res)=>{
  var c_name = req.body.column_datatype
  var c_option = req.body.selectpicker
  var r_value = req.body.replace
  try{
  if(c_option == 'mean'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].mean(axis=r_value)],inplace:true})
        req.flash("success_msg",c_name+" column is changed with mean!")
    }else{
        req.flash("error_msg","No null values are found!")
    }
  }else if(c_option == 'meadian'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].median(axis=r_value)],inplace:true})
        req.flash("success_msg",c_name+" column is changed with median!")
  }else{
        req.flash("error_msg","No null values are found!")
}
  }else if(c_option == 'frequent'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].value_counts().max()],inplace:true})
        req.flash("success_msg",c_name+" column is changed with frequent!")
  }else{
      req.flash("error_msg","No null values are found!")
}
  }
  else if(c_option == 'fill_0'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[0],inplace:true})
        req.flash("success_msg",c_name+" column is changed with zeros!")
      }else{
        req.flash("error_msg","No null values are found!")
      }
  }else if(c_option == 'drop_01'){
    if(r_value == 1){
        user_df.drop({columns:[c_name], axis:r_value,inplace:true})
        req.flash("success_msg",c_name+" column is dropped!")
    }else{
      var arr = user_df[c_name].isna().data
      const indices = arr.reduce(
        (out, bool, index) => bool ? out.concat(index) : out, 
        []
      )
      user_df.drop({index:indices, axis: r_value, inplace: true })
      req.flash("success_msg",indices.length +" rows is dropped!")
    }
    
  }
  res.redirect("/file/clean")
  

}catch(e){
  req.flash("error_msg","Check column name and datatype!")
  res.redirect("/file/clean")
}
})

router.post('/df_normal',ensureAuthenticated,(req,res)=>{
    var column_name = req.body.column_label
    let encoder = new dfd.LabelEncoder()
    let cols = [column_name]
    cols.forEach(col => {
      encoder.fit(user_df[col])
      enc_val = encoder.transform(user_df[col])
      user_df.addColumn({ column: col, value: enc_val })
    })
    res.redirect('/file/clean')

})

router.get("/df_download",ensureAuthenticated,(req,res)=>{
  user_df.to_csv("./public/uploads/output.csv").then((csv) => {
    const file = new file_db({
      filename:"output.csv",
      userId:req.user._id
  })
    const newFile = file.save();
    res.redirect('/file/clean')
}).catch((err) => {
    console.log(err);
})
})





module.exports = router