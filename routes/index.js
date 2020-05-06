var express = require('express');
var router = express.Router();
const multer = require('multer');
const url = require('url');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + '_' + file.originalname)
  }
})
var upload = multer({ storage: storage })
//--------------------------
/* GET home page. */
router.get('/', function (req, res, next) {
  var user = "User";
  if (req.isAuthenticated()) {
    user = req.user.userName;
  } else {
    user = "User";
  }
  res.render('index', { user: user, checkuser: req.isAuthenticated() });
});

router.get('/download', (req, res) => {

  var x = __dirname + '/..' + '/public/uploads/guid.pdf';
  res.download(x)

})
module.exports = router;
