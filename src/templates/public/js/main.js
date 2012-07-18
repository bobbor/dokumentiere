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

		$('dd.extended .type-object').bind('click', function(e) {
			var dd = $(this).closest('dd');
			dd[dd.is('.open') ? 'removeClass' : 'addClass']('open');
			e.preventDefault();
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
