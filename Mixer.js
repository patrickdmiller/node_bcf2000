var midi = require('midi'),
	util = require('util'),
	events = require('events');

var Mixer = function(){
	var _this = this;
	events.EventEmitter.call(this);
	_this.output;
	_this.input;
	_this.io = require('socket.io-client');
	_this.socket;
	_this.socket_set = false;
	_this.slider_debounce_arr = [];

	this.initialize = function(){
		_this.output = new midi.output();
		_this.input = new midi.input();
		try{
			_this.output.openPort(0);
			_this.input.openPort(0);
		}catch(e){
			_this.emit("err", "unable to open port - is the device connected?");
		}
		
		_this.input.on('message', function(deltaTime, message){
			_this.parse_message(message);
		});
	}

	this.parse_message = function(message){
		var slider_num = parseInt(message[1]) - 81;
		var val = Math.round((100 * parseInt(message[2])) / (127));
		_this.emit("change", {slider_num:slider_num, val:val});
		if(_this.socket_set){
			// if(_this.slider_debounce_arr[slider_num]!=null)
			clearTimeout(_this.slider_debounce_arr[slider_num]);
			_this.slider_debounce_arr[slider_num] = setTimeout(function(){
					_this.socket.emit('change', {slider_num:slider_num, val:val});
				}, 150);
				
			
		}
	};

	this.set_slider = function(slider_num, val){
		var new_val = Math.round(val * 1.27);
		console.log("setting to " + new_val);
		_this.output.sendMessage([176, (81+slider_num), new_val]);
	}

	this.zero_sliders = function(){
		for(var i=0; i<8; i++){
			_this.set_slider(i, 0);
		}
	}

	this.set_socket = function(socket_host){
		_this.socket = _this.io.connect(socket_host);
		_this.socket.on('connect', function(){
			console.log("socket_connected");
			_this.socket_set = true;
		});

		_this.socket.on('zero_sliders', function(){
			_this.zero_sliders();
		});

		_this.socket.on('set_slider', function(data){
			if(data!=null && data.slider_num!=null && data.val!=null){
				_this.set_slider(data.slider_num, data.val);
			}
		});

		_this.socket.on('disconnect', function(){
			_this.socket_set = false;
		})
	}


}

util.inherits(Mixer, events.EventEmitter);

module.exports = Mixer