const express = require('express')
const { register , login, followUser, logout, updateProfile, updatePassword, deleteMyProfile, myProfile, getUserProfile, getAllUsers } = require('../controllers/user')
const { isAuthenticated } =require('./../middlewares/auth')

const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/users/all").get(isAuthenticated,getAllUsers)
router.route("/profile/me").get(isAuthenticated,myProfile)
router.route("/userProfile/:id").get(isAuthenticated,getUserProfile)
router.route("/followToggle/:id").get(isAuthenticated ,followUser)
router.route("/update/password").put(isAuthenticated,updatePassword)
router.route("/update/profile").put(isAuthenticated,updateProfile)
router.route("/delete/profile").delete(isAuthenticated,deleteMyProfile)


module.exports = router