const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


router.post('/clean',ensureAuthenticated,(req,res)=>{
    console.log(req.body.filename)
    res.render('dash_temp/analysis',{filename:req.body.filename})
})





module.exports = router