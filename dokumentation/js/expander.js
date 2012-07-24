define(function( ) {
	return {
		version: '0.1.0',
		extend: function( el ) {
			el.bind('click', function( e ) {
				var dd = $(this).closest('dd');
				dd[dd.is('.open') ? 'removeClass' : 'addClass']('open');
				e.preventDefault();
			});
		},
		fns: function( el ) {
			el.bind('click', function( e ) {
				if( e.target.nodeName === 'A' ) {
					return true;
				}
				var elms = $(this).add($(this).next());
				elms[elms.is('.open') ? 'removeClass' : 'addClass']('open');
				return false;
			});
		},
		init: function( id, callback) {
			var elm, path = [];
			elm = $(document.getElementById(id));
			if( elm.length ) {
				while( !elm.is('#content') ) {
					if( elm.is('.extended') ) {
						elm.addClass('open');
					}
					if( elm.is('.functions') ) {
						// we are at functions
						// but it has not yet been pushed
						// so we are at the wrapping dl
						// which results in the penultimate item being the searched dd
						var cur = path[path.length - 2];
						if(cur.is('dt')) {
							cur = cur.next();
						}
						cur.addClass('open')
					}
					path.push(elm);
					elm = elm.parent();
				}
			}
			callback();
		}
	};
});