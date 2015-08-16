var express = require('express'),
    router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {

  res.render('users', { title: 'users' });

});

module.exports = router;
