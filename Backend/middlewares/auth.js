var User = require('../models/User')
var jwt = require('jsonwebtoken')

exports.isAuthenticated = async (req , res , next) => {
    try{
        const {token} = req.cookies
        // const {token} = sessionStorage.getItem("token")


    if(!token){
        return res.status(401).json({
            success:false,
            message:'Failed to fetch token'
        })
    }

    const decoded = await jwt.verify(token,process.env.JWT_SWCRET_KEY)

    req.user = await User.findById(decoded._id);

    next()
    
    } catch(err){
       return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
