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

			elms.on('click', function() {
				hash = $(this).attr('href');
				hash = hash.substring(1, hash.length);
				exp.init(hash, function() {
					that.scrollToElement(hash);
				});
			});
		},

		scrollToElement: function( hash ) {
			
			var from = $(document).scrollTop();
			var elm = $(document.getElementById(hash) || document.getElementsByName(hash)[0]);
			var to = elm.offset().top;
			
			document.state = 0;
			$(document).animate({
				state: 1
			}, {
				step: function( val, fx ) {
					$(document).scrollTop(fx.pos * to + (1 - fx.pos) * from);
				}
			});
		}
	};
});