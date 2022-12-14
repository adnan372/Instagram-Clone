const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req,res) => {

    try{
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"",
                url:""

            },
            owner:req.user._id

        }
        const post = await Post.create(newPostData);
        const user = await User.findById(req.user._id);
        // console.log(post,"post")
        
        user.posts.push((post._id))
       await user.save()

        res.status(201).json({
            success:true,
            post,
        })

    }catch(err){
        res.status(400).json({
            success:false,
            message:err.message
        })

    }

}

exports.deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                message:"post is not available"
            })
        }
        // if(post.owner.toString() !== req.user._id.toString()){
        //     return res.status(400).json({
        //         success:false,
        //         message:"Unauthorized"
        //     })
        // }
        await post.remove();

        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        // console.log("user",user)
        await user.save()

        res.status(200).json({
            success:true,
            message:"Post deleted"
        })

    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.getPostOfFollowing = async (req , res) => {
    try {
        // const user = await User.findById(req.user._id).populate("following","posts")
        const user = await User.findById(req.user._id)
        const posts = await Post.find({
            owner:{
                $in:user.following
            }
        })

        res.status(200).json({
            success:true,
            posts
        })
    } catch (error) {
        res.success(500).json({
            success:false,
            message:error.message
        })
        
    }
}

exports.likeAndUnlikePost = async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        // console.log(post)
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
            
        }

        else if(post.likes.includes(req.params.id)){
            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index,1)
            await post.save();

            return res.status(200).json({
                success:true,
                message:"Unliked successfully"
            })
        } else {
            // console.log(req.user._id,'user')
            post.likes.push(req.user._id);
            await post.save()

            return res.status(200).json({
                success:true,
                message:"Post liked successfully"
            })
            
        }

    }catch(err) {
        return res.status(400).json({
            success:false,
            message:err.message
        })
        
    }
}

exports.updateCaption = async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id)

        if(!post){
            return res.status(400).json({
                success:false,
                message:"Post not exist"
            })
        }
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:"Unauthorized"
            })
        }

        post.caption = req.body.caption;
        await post.save()
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