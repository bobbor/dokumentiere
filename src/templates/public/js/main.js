(function( window ) {
	
	function checkHash() {
		if(location.hash) {
			var elm = $(location.hash);
			elm.addClass('highlight');
			window.setTimeout(function() {
				elm.removeClass('highlight');
			}, 1000);
		}
	}
	
	function enableExtended() {
		$('dd.extended').bind('click', function(e) {
			if($(e.target).is('a')) { return true; }
			var dd = $(this);
			dd[dd.is('.open') ? 'removeClass' : 'addClass']('open');
			return false;
		});
		$('dd.functions dt').bind('click', function() {
			var dd = $(this).next();
			dd[dd.is('.open') ? 'removeClass' : 'addClass']('open');
			return false;
		});
	}
	
	require([
		"jquery"
	], function( $ ) {

		var projectInit = {
			immediate: function() {
				$('html').addClass('js-on');
			},

			domReady: function( ctx ) {
				checkHash();
				enableExtended();
			}
		};

		projectInit.immediate();
		$(projectInit.domReady);
	});
}(window, undefined));
