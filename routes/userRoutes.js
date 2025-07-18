const express = require('express')
const userController = require('./../Controllers/userController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect,
   authController.updatePassword
)
router.use(authController.protect);

router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto,
    userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createUser)

router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser)

module.exports = router

