(function( window ) {
	
	function itemFilter() {
		require(['filter'], function(filter) {
			filter.go($('#filter'), $('.items'));
		});
	}
	
	function checkHash() {
		require(['jumpLinks'], function(j) {
			j.enable($('#content a[href^=#]'));
		});
	}
	
	function enableExtended() {
		require(['expander'], function(e) {
			e.extend($('dd.extended .type-object'));
			e.fns($('dd.functions dt'));
		});
	}
	
	require([
		"jquery",
		"libs/jquery.mousewheel",
		"libs/mwheelIntent",
		"libs/jquery.jscrollpane.min"
	], function( $ ) {

		var projectInit = {
			immediate: function() {
				$('html').addClass('js-on');
			},

			domReady: function( ctx ) {
				checkHash();
				enableExtended();
				itemFilter();
				$('#item aside, #source aside').jScrollPane();
			}
		};

		projectInit.immediate();
		$(projectInit.domReady);
	});
}(window, undefined));
