define([
	'expander'
], function( exp ) {

	return {
		enable: function( elms ) {
			var hash;
			var that = this;
			if( location.hash ) {
				hash = location.hash.substring(1, location.hash.length);
				exp.init(hash, function() {
					that.scrollToElement(hash);
				});
			}

			elms.on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				hash = $(this).attr('href');
				hash = hash.substring(1, hash.length);
				exp.init(hash, function() {
					that.scrollToElement(hash);
				});
				return false;
			});
		},

		scrollToElement: function( hash ) {
			
			var from = $(document).scrollTop();
			var elm = $(document.getElementById(hash) || document.getElementsByName(hash)[0]);
			if(!elm.length) { return; }
			var to = elm.offset().top;
			var speed = 1;
			document.body.state = 0;
			var dur = Math.floor(Math.abs(to-from)*speed);
			console.log(dur)
			$(document.body).animate({
				state: 1
			}, {
				duration: dur,
				step: function( val, fx ) {
					console.log(fx.pos)
					$(document).scrollTop(fx.pos * to + (1 - fx.pos) * from);
				},
				complete: function() {
					location.hash = '#'+hash;
				}
			});
		}
	};
});