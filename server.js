var sticky = require('sticky-listen');
var http = require('http');




var express = require('express');

var app = express();

var server = http.createServer(app);

app.get("/",function(req,res){
	res.sendfile("index.html")
})

app.get("/kill",function(req,res) {
	process.exit(1)
})

var io = require('socket.io').listen(server)

var redis = require('redis');
var redisAdapter = require('socket.io-redis');

    var redisUrl = process.env.REDISTOGO_URL || 'redis://127.0.0.1:6379';
    var redisOptions = require('parse-redis-url')(redis).parse(redisUrl);
    var pub = redis.createClient(redisOptions.port, redisOptions.host, {
        detect_buffers: true,
        auth_pass: redisOptions.password
    });
    var sub = redis.createClient(redisOptions.port, redisOptions.host, {
        detect_buffers: true,
        auth_pass: redisOptions.password
    });

    io.adapter(redisAdapter({
        pubClient: pub,
        subClient: sub
    }));
    console.log('Redis adapter started with url: ' + redisUrl);

    io.on('connection', function(socket) {

        console.log('Connection made. socket.id='+socket.id+' . pid = '+process.pid);

        socket.on('chat_in', function(msg) {
            console.log('emitting message: '+msg+' . socket.id='+socket.id+' . pid = '+process.pid);
            io.emit('chat_out', 'Process '+process.pid+': '+msg);
        });
        socket.on('disconnect', function(){
            console.log('socket disconnected. socket.id='+socket.id+' . pid = '+process.pid);
        });

        socket.emit('chat_out', 'Connected to socket server. Socket = '+socket.id+'.  Process = '+process.pid);
    });

    io.on('disconnect', function(socket) {
        console.log('Lost a socket. socket.id='+socket.id+' . pid = '+process.pid);
    });

sticky.listen(server)

process.send({cmd: 'ready'})