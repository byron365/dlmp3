const express = require('express');
const router = express.Router();
const dlFunctions = require('../Methods/dlFunctions');


router.get('/', (req, res) =>{
    res.render('index');
});

module.exports = router;