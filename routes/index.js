const express = require('express');


const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: 'Code Challagnge',
      data: 'Express Data Set',
    });
  });


module.exports = router;
