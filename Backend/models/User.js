const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name field is mendatory']
    },

    avatar :{
        public_id:String,
        url:String
    },
    
    password:{
        type:String,
        required:[true,"Please enter a password"],
        select:false,
        minLength:[6,"Password must be atleast 6 characters"],
        unique:[true , 'Please enter unique password']
    } ,
    email:{
        type:String,
        required:[true,'Please enter password'],
        unique:[true, 'Email already exist']
    } ,
    posts :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    ] ,
    followers :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ] ,
    following :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]


})

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    }
    next()
})

userSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateToken = async function (){
    return jwt.sign({_id:this.id}, process.env.JWT_SWCRET_KEY )
}

module.exports = mongoose.model("User",userSchema)