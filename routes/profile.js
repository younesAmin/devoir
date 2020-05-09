var express = require('express');
var router = express.Router();
const File = require('../models/File');
const User = require('../models/User')
const multer = require('multer');
const fs = require('fs');

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
    console.log(req.user.storage)
    File.find({ userId: req.user._id }, (err, data) => {
        if (err) {
            console.log(err)
        } else if (data.length > 0) {
            res.render('profile', { user: req.user.userName, storage: req.user.storage, data: data, checkuser: true, checkprofile: true })
        } else {
            res.render('profile', { user: req.user.userName, storage: req.user.storage, data: {}, checkuser: true, checkprofile: true })
        }
    })
})
// POST upload
router.post('/', upload.single('pic'), (req, res, next) => {
    var name = req.user._id + '_' + req.file.originalname;
    var storage = req.user.storage;
    var filesize = size(name)
    var newstorage = userstorage(filesize, storage)
    if (newstorage >= 0) {
        var path = 'uploads/' + name;
        var showname = req.file.originalname;
        var extension = type(req.file.originalname)
        //---------------
        const up = {
            storage: newstorage
        }
        const ID = req.user._id;
        User.updateOne({ _id: ID }, { $set: up }, (err, doc) => {
            if (err) {
                console.log(err);
            }
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
                res.redirect('profile')
            })
        })
    } else {
        var isFull = ['you have no space enough']
        deletefile(name);
        res.render('profile', { massages: isFull })
    }

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
    File.findById({ _id: req.params.id }, (err, file) => {
        if (err) {
            console.log(err)
        }
        var name = file.name;
        var filesize = size(name)
        File.deleteOne({ _id: req.params.id }, (err, doc) => {
            if (err) {
                console.log(err);
            }
            var storage = req.user.storage;
            var newstorage = userstorageplus(filesize, storage)
            const up = {
                storage: newstorage
            }
            const ID = req.user._id;
            User.updateOne({ _id: ID }, { $set: up }, (err, doc) => {
                if (err) {
                    console.log(err);
                }

            })
            deletefile(name);
            console.log(doc)
            res.redirect('../../profile');
        })
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
}
function size(file) {
    var stats = fs.statSync(__dirname + '/../public/uploads/' + file)
    var fileSizeInBytes = stats.size
    return (fileSizeInBytes / 1000000.0);
}
function userstorage(filesize, storage) {
    return storage - filesize;
}
function userstorageplus(filesize, storage) {
    return storage + filesize;
}
function deletefile(file) {
    fs.unlink(__dirname + '/../public/uploads/' + file, (err) => {
        if (err) throw err;
        console.log('File deleted!')
    })
}
module.exports = router;