const mongoose = require('mongoose');

const FileSchema = mongoose.Schema({
    filename: {
        type:String
    },
    userId:{
        type: String
    }
})


module.exports = mongoose.model("files",FileSchema)