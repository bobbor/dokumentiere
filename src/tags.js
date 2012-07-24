//
// /--------------------------------------------\
// |                                            |
// | tags.js                                    |
// | part of "dokumentiere"                     |
// | licensed under GPLv2                       |
// |                                            |
// \--------------------------------------------/

var lastTag = 'generic';

/*-
 * tags
 [ node-module (node) ]
 : bobbor
 * this parses the "tags"
 * these are the first symbols of each line in a documentation-comment
 > Usage
 | var tags = require('tags')
 -*/
var tags = {
	/*-
	 * tags['*'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `\*`
	 * `\*` means description ( including `ref` and `desc`)
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'*': function( obj, line ) {
		var desc = {};
		function adjustReference( refarr ) {
			for( var i = 0, len = refarr.length; i < len; i++) {
				refarr[i] = {
					name: refarr[i].substring( refarr[i].lastIndexOf( '-' ) + 1, refarr[i].length ),
					link: refarr[i]
				};
			}
			return refarr;
		}
		obj.description = obj.description || [];
		desc = optionParamLine( line.trim(), true );
		desc.ref = adjustReference( desc.ref );
		obj.description.push( desc );
	},
	/*-
	 * tags['>'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `>`
	 * `>` means a tag, all following lines with `-` (or `|` in case of *Usage*) are associated to it
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'>': function( obj, line ) {
		lastTag = line.trim();
		obj.tags = obj.tags || {};
		obj.tags[lastTag] = obj.tags[lastTag] || [];
		
	},
	/*-
	 * tags['|'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `|`
	 * `|` means usage of the documented element
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'|': function( obj, line ) {
		obj.tags[lastTag] = obj.tags[lastTag] || [];
		obj.tags[lastTag].push( line );
	},
	/*-
	 * tags['-'](obj, line, inherit)
	 [ function (private) ]
	 * parses all lines beginning with `-`
	 * `-` means an option and is associated to a tag @see function-tags['>'] function-optionParamLine
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 - inherit (boolean) if true, the result is set directly on obj and not on obj.tags[lastTag]
	 -*/
	'-': function( obj, line, inherit ) {
		var item;
		var result;
		line = line.trim();
		
		function checkReferences( refarr ) {
			for( var i = 0, len = refarr.length; i < len; i++) {
				if ( !~refarr[i].indexOf( '-' ) ) {
					refarr[i] = lastTag + '-' + refarr[i];
				}
				refarr[i] = {
					link: refarr[i],
					name: refarr[i].substring( refarr[i].lastIndexOf( '-' ) + 1, refarr[i].length )
				};
			}
			return refarr;
		}
		
		if ( line[0] !== '-' ) {
			if ( inherit ) {
				result = optionParamLine( line );
				result.ref = checkReferences( result.ref );
				obj.push( result );
			} else {
				result = optionParamLine( line );
				result.ref = checkReferences( result.ref );
				obj.tags[lastTag].push( result );
			}
		} else {
			item = inherit ? obj[obj.length - 1] : obj.tags[lastTag][obj.tags[lastTag].length - 1];
			item.details = item.details || [];
			tags['-']( item.details, line.substring( 1, line.length ), true );
		}
	},
	/*-
	 * tags['='](obj, line, inherit)
	 [ function (private) ]
	 * parses all lines beginning with `=`
	 * `=` means return values similar to `-` @see function-tags['&#45;'] function-optionParamLine
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 - inherit (boolean) if true, the result is set directly on obj and not on obj.returns
	 -*/
	'=': function( obj, line, inherit ) {
		var item;
		if ( !inherit ) {
			obj.returns = obj.returns || [];
		}
		
		line = line.trim();
		if ( line[0] !== '=' ) {
			if ( inherit ) {
				obj.push( optionParamLine( line ) );
			} else {
				obj.returns.push( optionParamLine( line, true ) );
			}
		} else {
			item = inherit ? obj[obj.length - 1] : obj.returns[obj.returns.length - 1];
			item.details = item.details || [];
			tags['=']( item.details, line.substring( 1, line.length ), true );
		}
	},
	/*-
	 * tags['#'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `#`
	 * `#` means dependency
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'#': function( obj, line ) {
		obj.deps = obj.deps || [];
		obj.deps = obj.deps.concat( line.split( ',' ) );
	},
	/*-
	 * tags[':'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `:`
	 * `:` means author
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	':': function( obj, line ) {
		obj.author = obj.author || [];
		obj.author = obj.author.concat( line.split( ',' ) );
	},
	/*-
	 * tags['+'] (obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `+`
	 * `+` means *extends* (could be a widget, or class or whats'o'ever)
	 > Parameter
	 - obj (object) the object to set on
	 - line (string) the line to parse
	 -*/
	'+': function(obj, line) {
		obj.expando = obj.expando || [];
		obj.expando = obj.expando.concat( line.split( ',' ) );
	},
	/*-
	 * tags['!'](obj, line)
	 [ function (private) ]
	 * parses all lines beginning with `!`
	 * `!` means *warning*
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'!': function(obj, line) {
		obj.warning = obj.warning || [];
		obj.warning.push( line );
	}
};

/*-
 * optionParamLine(line, avoidName)
 [ function (private) ]
 * parses lines that are "option"-lines
 * these are usually used in `-` and `=`
 > Parameter
 - line (string) the line to parse
 - avoidName (boolean) if true, no name will be set on returned object
 = (object) the object resulting from parsing the line
 == name (string) the name of the option ('' if avoidName is true)
 == desc (array) the description of the option (each item of the array is a line)
 == ref (array) the references of the option (each item if the array is a ref)
 == type* (array) an array of possible valid types surrounded by '(' and ')'
 == defaults* (string) which values are default used - surrounded by '<' and '>'
 == valids* (string) which values are valid - surrounded by '[' and ']'
 -*/
var optionParamLine = function( line, avoidName ) {
	var vals = line.split( ' ' );
	var typeRE = /^\(([a-zA-Z0-9\ \|]+)\)/;
	var defaultRE = /^\<([\[\ \,\|]{0,}[\S\s]{0,}[\ \,\]\|]{0,})\>/;
	var validRE = /^\[([\S\s]+)\]/;
	var seeRE = /(\@see([\S\s]*))/;
	var name = !avoidName ? vals.shift() : '';
	var result;
	vals = vals.join( ' ' );
	
	if ( name && name.lastIndexOf( '*' ) === name.length - 1 ) {
		name = name.replace( /([\S]+)\*$/, '<i>(opt.)</i> $1' );
	}
	var ret = {
		name: name,
		desc: [],
		ref: []
	};
	if ( typeRE.test( vals ) ) {
		result = typeRE.exec( vals );
		ret.type = result[1];
		ret.type = ret.type.split( '|' );
		vals = vals.replace( typeRE, '' ).trim();
	}
	if ( defaultRE.test( vals ) ) {
		result = defaultRE.exec( vals );
		ret.defaults = result[1];
		
		ret.defaults = {
			raw: ret.defaults,
			type: keywordChecker( ret.defaults )
		};
		
		vals = vals.replace( defaultRE, '' ).trim();
	}
	if ( validRE.test( vals ) ) {
		result = validRE.exec( vals );
		ret.valids = result[1].split( ',' );
		ret.valids = generateValids( ret.valids );
		vals = vals.replace( validRE, '' ).trim();
	}
	if ( seeRE.test( vals ) ) {
		var ref = seeRE.exec( vals );
		ret.ref = ref[2].trim().split( ' ' );
		vals = vals.replace( ref[1], '' );
	}
	ret.desc = prettify( vals );
	return ret;
};

/*-
 * prettify(desc)
 [ function (private) ]
 * transforms `\``, `\*` and `\_`
 * parses the description of a function or module<br/>
 * it transforms those to `code`, `strong` and `em`<br/>
 * \`foo\` == &lt;code&gt;foo&lt;/code&gt;<br/>
 * \*foo\* == &lt;strong&gt;foo&lt;/strong&gt;<br/>
 * \_foo\_ == &lt;em&gt;foo&lt;/strong&gt;
 > Parameter
 - desc (string) the string to parse
 = (string) the prettified string
 > Usage
 | var myCodeString = prettify(myString); 
 -*/
var prettify = function( desc ) {
	return desc.replace( /\\`/gi, '|code|' ).replace( /\\\*/gi, '|bold|' ).replace( /\\_/gi, '|italic|' ).split( '`' ).map( function( elm, i ) {
		if ( i % 2 ) {
			elm = '<code>' + elm + '</code>';
		}
		return elm;
	} ).join( '' ).split( '*' ).map( function( elm, i ) {
		if ( i % 2 ) {
			elm = '<strong>' + elm + '</strong>';
		}
		return elm;
	} ).join( '' ).split( '_' ).map( function( elm, i ) {
		if ( i % 2 ) {
			elm = '<em>' + elm + '</em>';
		}
		return elm;
	} ).join( '' ).replace( /\|code\|/gi, '`' ).replace( /\|bold\|/gi, '*' ).replace( /\|italic\|/gi, '_' );
};

/*-
 * generateValids(valids)
 [ function (private) ]
 * generates all valids with type
 * walks through the array of valid values and checks the for a keyword @see function-keywordChecker
 > Parameter
 - valids (array) the array of valid values
 = (object) the map for the value
 == raw (string) the string of valid value
 == type (string) the type of which the value is
 > Usage
 | var obj = generateValids("['foo', true]");
 -*/
var generateValids = function( valids ) {
	return valids.map( function( elm, i ) {
		return {
			raw: elm,
			type: keywordChecker( elm )
		};
	} );
};

/*-
 * keywordChecker(text)
 [ function (private) ]
 * checks if a string matches a javascript keyword
 > Parameter
 - text (string) the string to test for a keyword
 > Usage
 | var type = keywordChecker('true'); // returns boolean
 = (string) ['string', 'boolean', 'number', 'default'] returns the type of the string <br/> falls back to "default" if not identified
 -*/
var keywordChecker = function( text ) {
	var bool = /true|false/;
	var string = /^(\'|\")[\S\s]+(\'|\")$/;
	var number = /[0-9\.]+/;
	var regexp = /^\/[\S\s]+[\/gim]+$/;
	text = text.trim();
	// we start with string, preventing strings ( e.g. "true" ) is not incorrectely interpreted
	if ( string.test( text ) ) {
		return 'string';
	} else if ( bool.test( text ) ) {
		return 'boolean';
	} else if ( number.test( text ) ) {
		return 'number';
	} else if ( regexp.test(text) ) {
		return 'regexp';
	}
	return 'default';
};
/*-
 * parseLine(obj, line)
 [ function (public) ]
 * parses the given line
 > Parameter
 - obj (object) the object which should be extended with the right property
 - line (string) the line to comment of the comment given
 -*/
exports.parseLine = function( obj, line ) {
	var tag = line[0];
	line = line.substring( 1, line.length );
	tags[tag]( obj, line );
};
