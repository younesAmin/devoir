var express = require('express');
var router = express.Router();
const File = require('../models/File');
const User = require('../models/User')
const multer = require('multer')

// use multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '_' + file.originalname)
    }
})
var upload = multer({ storage: storage })

//get profile
router.get('/', isSignin, (req, res, next) => {

    File.find({ userId: req.user._id }, (err, data) => {
        if (err) {
            console.log(err)
        } else if (data.length > 0) {
            res.render('profile', { user: req.user.userName, data: data, checkuser: true, checkprofile: true })
        } else {
            res.render('profile', { user: req.user.userName, data: {}, checkuser: true, checkprofile: true })
        }
    })
})
// POST upload
router.post('/', upload.single('pic'), (req, res, next) => {
    var name = req.user._id + '_' + req.file.originalname;
    var path = 'uploads/' + name;
    var showname = req.file.originalname;
    var extension = type(req.file.originalname)
    var temp = new File({
        url: path,
        showname: showname,
        name: name,
        type: extension,
        userId: req.user._id
    })
    temp.save((err, data) => {
        if (err) {
            console.log(err)
        }
        console.log(data)
        res.redirect('profile')
    })
})
// GET download
router.get('/download/:id', (req, res) => {
    File.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            console, log(err)
        }
        var x = __dirname + '/..' + '/public/' + data[0].url;
        res.download(x)
    })
})
//DELETE a file 
router.post('/delete/:id', (req, res) => {
    console.log(req.params.id)
    File.deleteOne({ _id: req.params.id }, (err, doc) => {
        if (err) {
            console.log(err);
        }
        console.log(doc)
        res.redirect('..');
    })
})
// GET link
router.get('/link/:id', (req, res) => {
    File.findById({ _id: req.params.id }, (err, data) => {
        if (err) {
            console, log(err)
        }
        const link = req.headers.host + '/' + data.url;
        console.log(link)
        res.render('link', { hostname: link, user: req.user.userName, data: data, checkuser: true })
    })
})
//Update profile
router.get('/edit', (req, res) => {
    const username = req.user.usern;
    console.log(username)
    res.render('edit', { user: req.user.userName, userid: req.user._id, checkuser: true })
})
router.post('/edit/:id', (req, res) => {
    var username = req.body.username;
    const up = {
        userName: username
    }
    const ID = req.params.id;
    User.updateOne({ _id: ID }, { $set: up }, (err, doc) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/profile');
        return;
    })

})

function isSignin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('users/signin')
        return;
    }
    next();
}

function type(name) {
    var extension = name.split(".").pop();
    switch (extension) {
        case "jpg":
            return "image";
            break;
        case "jpeg":
            return "image";
            break;
        case "png":
            return "image";
            break;
        case "pdf":
            return "doc";
            break;
        case "pptx":
            return "doc";
            break;
        case "rtf":
            return "doc";
            break;
        case "mp4":
            return "video";
            break;
        default:
            return "other";
            break;
    }
    console.log(extension);

}
module.exports = router;