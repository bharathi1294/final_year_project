const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination:'./public/uploads/',
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+ Date.now() + 
        path.extname(file.originalname));
    }
});

//Init upload

const upload = multer({
    storage:storage
}).single('myFile')

module.exports = upload