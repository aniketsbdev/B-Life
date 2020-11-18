const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const companyRouter = require('./routers/company')
const policyRouter = require('./routers/policy')

const app = express()
const port = process.env.PORT
// const http = require('http').createServer(app);


app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(companyRouter)
app.use(policyRouter)

var server = app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const io = require('socket.io')(server, {
    cors: true,
    origins: ['http://localhost:4200']
});

io.on('connection', (socket) => {
    console.log('a user connected');
    // console.log(data.title, data.message);
    // socket.emit('id', socket.id)
    // io.sockets.emit('new_notification', {
    //     _id: socket.id,
    //     name: "Some Notification",
    //     // icon: data.icon,
    // });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.set('socketio', io)