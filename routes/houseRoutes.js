const express = require('express');
const { getHouses, addHouse } = require('../controllers/houseController'); const auth = require('../middleware/authMiddleware'); const upload = require('../middleware/uploadMiddleware'); const router = express.Router();
router.get('/', getHouses); router.post('/', auth, upload.array('attachments', 10), addHouse); module.exports = router;