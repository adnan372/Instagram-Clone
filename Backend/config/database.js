const mongoose = require('mongoose')

exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI)
    .then((cnc) => {
        console.log(`DB connected ${cnc.connection.host}`)

    })
    .catch(err => console.log(err))
}