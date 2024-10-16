const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers')


router.get('/getUsers', userController.getUsers)
router.get('/demo', userController.demo)
// router.post('/createUser', userController.createUser)
// router.delete('/deleteUser', userController.deleteUser)
// router.put('/updateUser', userController.updateUser)

router.post('/getRecipient', userController.getRecipient)
router.post('/registerUser', userController.registerUser)
router.post('/loginUser', userController.loginUser)

module.exports = router; 