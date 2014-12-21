var http = require('http'),
	events = require('events'),
	express = require('express'),
	path = require('path');

var app = express()
, server = require('http').createServer(app);
server.listen(8080);

app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(path.join(__dirname, 'public')));
});

var io = require('socket.io').listen(server);
var io_client;
var io_slider = io.of('/mixer').on('connection', function(socket){
	console.log("client connected");
	socket.on('change', function(data){
		console.log(data);
		io_client.emit('change', data);
	});
});

//some examples
io_client = io.of('/client').on('connection', function(socket){
	socket.on('set_slider', function(data){
		io_slider.emit('set_slider', data);
	});

	socket.on('zero_sliders', function(data){
		io_slider.emit('zero_sliders');
	})
});