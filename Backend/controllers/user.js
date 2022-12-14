const { trusted } = require('mongoose')
const User = require('../models/User')
const Post = require('../models/Post')

exports.register = async (req,res) => {
    try {

        const {name , email , password} = req.body
        let user = await User.findOne({email})
        if(user){
            return res
            .status(400)
            .json({
                success: false,
                message:"User already exist"
            })
        }
        user = await User.create({name , email , password , avatar:{public_id:"sample_id" , url:"sample_url"}});

        // res.status(200).json({
        //     success:true,user
        // })

        const token = await user.generateToken()
        const options = {
            // expires: new Date(Date.now() + 50*10*60*1000),
            expires: false,

            httpOnly:true
        }
        res.status(201).cookie("token",token, options).json({
            success: true, 
            user,
            token
        })
        

    } catch (err) {
        res.status(500).json({
            success:false ,
            message : err.message
        })
    }
}

exports.login = async (req,res) => {
    try{
        const {email ,password} = req.body
        const user = await User.findOne({email}).select("+password")

        if(!user){
            return res.status(400)
            .json({
                success: false,
                message:'User not exist'
            })
        }

        const isMatch = await user.matchPassword(password)

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message:"Please enter valid password"
            })
        }

        const token = await user.generateToken()
        const options = {
            expires: new Date(Date.now() + 10*60*1000),
            httpOnly:true
        }
        res.status(200).cookie("token",token, options).json({
            success: true, 
            user,
            token
        })

    } catch(err){
        res.status(500).json({
            success:false,
            message:err.message 
        })

    }
}

exports.logout = async (req,res)=>{
    try {
        res.status(200).cookie("token",null,{expires:new Date(Date.now()),httpOnly:true}).json({
            success:true,
            message:"Logged out successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.myProfile = async(req,res) =>{
    try {
        const user = await User.findById(req.user._id).populate("posts")
        
        res.status(200).json({
            success:true,
            message:"Details fetched successfully",
            user
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.getUserProfile = async (req,res) =>{
    try {
        const user = await User.findById(req.params.id).populate("posts")
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not find"
            })
        }
        res.status(200).json({
            success:true,
            message:"User details fetched successfully"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.getAllUsers = async(req,res)=>{
    try {
        const users = await User.find({})

        res.status(200).json({
            success:true,
            message:"Successflly fetched all users",
            users
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}
exports.followUser = async (req , res) => {
    try {
        const userToFollow = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.user._id)
        if(!userToFollow){
            return res.status(400).json({
                success:false,
                message:"User not exist"
            })
        }
        else if(userToFollow.followers.includes(loggedInUser._id)){
            const userToFollowIndex = userToFollow.followers.indexOf(req.params.id)
            const loggedInUserIndex = loggedInUser.following.indexOf(req.user._id)

            userToFollow.followers.splice(userToFollowIndex,1)
            loggedInUser.followers.splice(loggedInUserIndex,1)

            await userToFollow.save()
            await loggedInUser.save()

            return res.status(200).json({
                success:true,
                message:"Unfollowed successfully"
            })
        }else if(req.user._id == req.params.id){
            return res.status(400).json({
                success:false,
                message:"Can't follow yourself"
            })

        } else {
            userToFollow.followers.push(loggedInUser._id);
            loggedInUser.following.push(userToFollow._id)
            await userToFollow.save();
            await loggedInUser.save()

            return res.status(200).json({
                success:true,
                message:"Followed successfully"
            })
        }
        
    } catch (error) {
        res.status(404).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.updatePassword = async (req , res) =>{
    try {
        const user = await User.findById(req.user._id).select("+password")

        const {oldPassword , newPassWord} = req.body

        // if(!oldPassword || !newPassWord){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Fields can not be empty"
        //     })
        // }

        const isMatch = await user.matchPassword(oldPassword)

        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect password"
            })
        }

        user.password = newPassWord;
        await user.save();

        res.status(200).json({
            success:true,
            message:"Password updated successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.updateProfile = async (req,res) => {
    try {
        const user = await User.findById(req.user._id)
        const {name , email} = req.body

        if(name){
            user.name = name;
        }
        if(email){
            user.email = email
        }

        // User Avatar:TODO
        await user.save()
        res.status(200).json({
            success:true,
            message:"Updated successfully"
        })        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteMyProfile = async (req,res) =>{
    try {
        const user = await User.findById(req.user._id)
        const posts = user.posts
        const followers = user.followers
        const following = user.following
        const userId = user._id

        await user.remove()

        // logout after deletion 

        res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})

        // Delete user all post
        for(let i=0 ;i< posts.length;i++){
            const post = await Post.findById(posts[i])
            await post.remove()
        }
        // removing followers from user following 
        for (let i = 0;i< followers.length;i++){
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId)
            follower.following.splice(index,1)
            await follower.save()
        }
         // removing user from following's follower 
         for (let i = 0; i< following.length;i++){
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId)
            follows.followers.splice(index,1)
            await follows.save()
        }

        

        res.status(200).json({
            success:true,
            message:"Your Profile deleted successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}