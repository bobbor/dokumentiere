define(function() {
	return {
		version: '0.1.0',
		extend: function(el) {
			el.bind('click', function(e) {
				var dd = $(this).closest('dd');
				dd[dd.is('.open') ? 'removeClass' : 'addClass']('open');
				e.preventDefault();
			});
		},
		fns: function(el) {
			el.bind('click', function(e) {
				if(e.target.nodeName === 'A') { return true; }
				var elms = $(this).add($(this).next());
				elms[elms.is('.open') ? 'removeClass' : 'addClass']('open');
				return false;
			});
		}
	};
});