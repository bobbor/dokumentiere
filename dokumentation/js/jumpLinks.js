define(function() {
	
	var scrollToElement = function(hash, c, t) {

		document.state = 0;
		$(document).animate({
			state: 1
		}, {
			step: function(val, fx) {
				$(document).scrollTop(fx.pos*t + (1-fx.pos)*c);
			}
		});
	};
	
	return {
		enable: function(elms) {
			var hash, t, c;
			if(location.hash) {
				hash = location.hash;
				t = $(hash).offset().top;
				c = $(document).scrollTop();
				scrollToElement(hash, c, t);
			}
			
			elms.on('click', function() {
				hash = $(this).attr('href');
				t = $(hash).offset().top;
				c = $(document).scrollTop();
				scrollToElement(hash, c, t);
			});
		}
	};
});