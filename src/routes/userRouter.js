const express = require('express')
const router = express.Router()
const jwtVerifyMiddleware = require('../middleware/authMiddleware')
const {createUser, getUser, updateUser, deleteUser} = require('../controllers/userController')

router.post('/users',createUser);
router.route('/user/:id').get(jwtVerifyMiddleware,getUser).patch(jwtVerifyMiddleware,updateUser).delete(jwtVerifyMiddleware,deleteUser);

module.exports = router;