const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const dfd = require('danfojs-node')
const csv = require('csvtojson')
const file_db = require('../models/files')
const fs = require("fs")

var user_df = ''
var i = 0
var filename = ''
var graph_df = ''

router.get('/df_empty',ensureAuthenticated,(req,res)=>{
  user_df = ''
  i=0
  filename = ''
  graph_df = ''
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
    //Mean
  if(c_option == 'mean'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].mean(axis=r_value)],inplace:true})
        req.flash("success_msg",c_name+" column is changed with mean!")
    }else{
        req.flash("error_msg","No null values are found!")
    }
  }
  //Median
  else if(c_option == 'meadian'){
    if(user_df[c_name].isna().sum() > 0){
      if(r_value == 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].median(axis=0)],inplace:true})
      }
      else{
        user_df.fillna({columns:[c_name],values:[user_df[c_name].median()],inplace:true})
        console.log(user_df[c_name].median())
      }
        req.flash("success_msg",c_name+" column is changed with median!")
  }else{
        req.flash("error_msg","No null values are found!")
}
  }
  //Frequent
  else if(c_option == 'frequent'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[user_df[c_name].value_counts().max()],inplace:true})
        req.flash("success_msg",c_name+" column is changed with frequent!")
  }else{
      req.flash("error_msg","No null values are found!")
}
  }
  //Fill with zeros
  else if(c_option == 'fill_0'){
    if(user_df[c_name].isna().sum() > 0){
        user_df.fillna({columns:[c_name],values:[0],inplace:true})
        req.flash("success_msg",c_name+" column is changed with zeros!")
      }else{
        req.flash("error_msg","No null values are found!")
      }
  }
  //Drop
  else if(c_option == 'drop_01'){
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
  //Min
  else if(c_option == 'min'){
    if(user_df[c_name].isna().sum() > 0){
      user_df.fillna({columns:[c_name],values:[user_df[c_name].min(axis=r_value)],inplace:true})
      req.flash("success_msg",c_name+" column is changed with min!")
    }else{
      req.flash("error_msg","No null values are found!")
    }
  }
  //Max
  else if(c_option == 'max'){
    if(user_df[c_name].isna().sum() > 0){
      user_df.fillna({columns:[c_name],values:[user_df[c_name].max(axis=r_value)],inplace:true})
      req.flash("success_msg",c_name+" column is changed with max!")
    }else{
      req.flash("error_msg","No null values are found!")
    }
  }
  res.redirect("/file/clean")
  

}catch(e){
  req.flash("error_msg","Check column name and datatype!")
  res.redirect("/file/clean")
}
})

router.post('/df_normal',ensureAuthenticated,async(req,res)=>{
    var column_name = req.body.column_label
    var e_option = req.body.selectpicker
    try{
    let encoder = new dfd.LabelEncoder()
    let cols = [column_name]
    if(e_option == 'one_encode'){
      var d_data = user_df[column_name].data
      let dum_df = dfd.get_dummies({data: d_data, prefix:column_name})
      user_df.drop({columns:[column_name], axis:1,inplace:true})
      user_df = dfd.concat({df_list: [user_df, dum_df], axis: 1})
    }else{
    cols.forEach(col => {
      encoder.fit(user_df[col])
      enc_val = encoder.transform(user_df[col])
      user_df.addColumn({ column: col, value: enc_val })
    })
  }
    req.flash("success_msg","Category columns changed to numeric columns!")
    res.redirect('/file/clean')
}catch(e){
  req.flash("error_msg","Check column name and datatype!")
  res.redirect('/file/clean')
}

})

//code

router.post('/df_advance',ensureAuthenticated,async(req,res)=>{
try{
  var col_name = req.body.column_name
  var code = req.body.code_editor
  code = code.replace(/\s+$/,'')
  func_name = eval('('+code+')')
  user_df[col_name] = user_df[col_name].data.map(eval('('+code+')'))
  req.flash("success_msg","Your data has been modified!")
  res.redirect('/file/clean')
}catch(e){
  req.flash("error_msg","Check your code and column datatype!")
  res.redirect('/file/clean')
}
  
})

router.get("/df_download",ensureAuthenticated,(req,res)=>{
  user_df.to_csv("./public/uploads/"+filename).then((csv) => {
    req.flash('success_msg',"Changes made in current file!")
    res.redirect('/file/clean')
  }).catch((err) => {
    console.log(err);
    res.redirect('/file/clean')
})
})

router.get("/df_save_new",ensureAuthenticated,(req,res)=>{
  var new_name = filename.split("-")[0]+"_new.csv"
  user_df.to_csv("./public/uploads/"+new_name).then((csv) => {
    const file = new file_db({
      filename:new_name,
      userId:req.user._id
  })
  const newFile = file.save();
  req.flash('success_msg',"Your file has been saved view in dashboard!")
  res.redirect('/file/clean')
  }).catch((err) => {
    console.log(err);
    res.redirect('/file/clean')
})
})

router.get("/df_save_json",ensureAuthenticated,(req,res)=>{
  user_df.to_json("./public/uploads"+filename).then((json) => {
    var filename = 'output.json';
    var mimetype = 'application/json';
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-disposition','attachment; filename='+filename);
    res.send( json );
  }).catch((err) => {
      console.log(err);
      res.redirect('/file/clean')
  })
})

router.get('/df_rest_api',ensureAuthenticated,(req,res)=>{
  user_df.to_json("./public/uploads"+filename).then((json) => {
    req.flash('success_msg',"Your REST API url http://localhost:5000/file/your_data?")
    res.redirect('/file/clean')
  }).catch((err)=>{
    console.log(err)
  })
})

router.get("/your_data",(req,res)=>{
  user_df.to_json("./public/uploads"+filename).then((json) => {
    res.send(json)
  }).catch((err)=>{
    console.log(err)
  })
})

//Graph Part

router.get('/chart/:filename',ensureAuthenticated,async(req,res)=>{
  await dfd.read_csv('./public/uploads/'+req.params.filename)
  .then(df => {
    graph_df = df.copy()
  })
  res.render('dash_temp/visual_main',{title:"Visualization",filename:req.params.filename,dis:true})
})

router.get('/bar_c/:gc_name',ensureAuthenticated,(req,res)=>{
  try{
    var g_c_name = req.params.gc_name
    x_data = graph_df[g_c_name].value_counts().index_arr
    y_data = graph_df[g_c_name].value_counts().data
    res.send({title:g_c_name,x:x_data,y:y_data})
  }catch(e){
    console.log(e)
  }
})

router.get('/line_c/:x/:y',ensureAuthenticated,(req,res)=>{
  try{
    var x = req.params.x
    var y = req.params.y
    x_data = graph_df[x].data
    y_data = graph_df[y].data
    res.send({x_title:x,y_title:y,x:x_data,y:y_data})
  }catch(e){
    console.log(e)
  }
})


module.exports = router