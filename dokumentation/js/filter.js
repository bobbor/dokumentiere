define(function() {
	
	var items = [];
	var filters = [];
	
	var applySearch = function(term) {
		var re = new RegExp(term, 'gi');
		$.each(items, function(i, elm) {
			if(re.test(elm.name) || re.test(elm.desc)) {
				elm.elm.show();
			} else {
				elm.elm.hide();
			}
		});
	};
	
	var checkedFilters = function(sender) {
		filters = [];
		$('input[type="checkbox"]', sender)
			.each(function(i, elm) {
				if(elm.checked) {
					filters.push(elm.name);
				}
			})
		;
	};
	
	var applyFilter = function() {
		$.each( items, function( i, elm ) {
			if ( $.inArray( elm.type, filters) !== -1) {
				elm.elm.show();
			} else {
				elm.elm.hide();
			}
		} );
	};
	
	var filter = function(sender, receiver) {
		items = $('section', receiver).map(function(i, elm) {
			return {
				type: elm.getAttribute('data-type'),
				name: elm.getAttribute('data-name'),
				desc: $('p', elm).text(),
				elm: $(elm)
			};
		}).get();
		
		$('form', sender).submit(function() {return false;});
		$('input[type="search"]', sender).bind('keyup', function(e) {
			applySearch(e.target.value);
			return false;
		});
		checkedFilters(sender);
		$('input[type="checkbox"]', sender).bind('change', function(e) {
				checkedFilters( sender );
				applyFilter();
			})
		;
	};
	
	return {
		go: filter
	};
});