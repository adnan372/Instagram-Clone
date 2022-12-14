const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')

if(process.env.NODE_ENV !== "Production"){
    require("dotenv").config({path : 'Backend/config/config.env'})
}

// using middleWARE
app.use(express.json())
// app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

// importing routes 
const post = require('./routes/post')
const user = require('./routes/user')


// using routes 
app.use('/api/v1',post)
app.use('/api/v1',user)


module.exports = app