const { Schema, model } = require('mongoose');

const File = model('File', {
    url: {
        type: String,
        required: true
    },
    showname: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});


module.exports = File