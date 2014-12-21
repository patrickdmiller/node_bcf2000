var mixer = require('./Mixer.js');

m = new mixer();
m.initialize();

//zero out the sliders
m.zero_sliders();

//when slider changes
m.on("change", function(data){
	console.log(data);
});

// setTimeout(function(){
	// m.set_slider(7, 100);
	// setInterval(function(){
	// 	for(var i=0; i < 8; i++){
	// 		m.set_slider(i, Math.random() * (100));
	// 	}
	// }, 250);
// }, 2000);

//an example of connecting the mixer to a websocket somewhere else - see server.js
m.set_socket('http://localhost:8080/mixer');

