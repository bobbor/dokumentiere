(function() {
	
	require('colors');
	
	var log = function() {
		console.log.apply('',arguments);
	}
	
	var logger = {
		simple: function() {
			log.apply('', arguments);
		},
		info: function(text) {
			log(text.grey);
		},
		success: function(text) {
			log(text.green);
		},
		warn: function(text) {
			log(text.yellow);
		},
		error: function(text) {
			log(text.red);
		},
		fail: function(text) {
			log(text.inverse.red);
		},
		head: function(text) {
			var line = text.replace(/[\S\s]/g, '-');
			log(('\n'+text+'\n'+line).bold.white);
		}
	};
	module.exports = logger;
}());