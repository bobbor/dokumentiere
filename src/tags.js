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
 * this parses the "tags" of each line in a documentation-comment
 > Usage
 | var tags = require('tags')
 -*/
var tags = {
	/*-
	 * tags['*']
	 [ function (private) ]
	 * parses all lines beginning with '*'
	 * '*' means description ( including 'ref' and 'desc')
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'*': function( obj, line ) {
		var desc = {};
		function adjustReference(refarr) {
			for(var i = 0, len = refarr.length; i < len; i++) {
				refarr[i] = {
					name: refarr[i].substring(refarr[i].lastIndexOf('-')+1, refarr[i].length),
					link: refarr[i]
				};
			}
			return refarr;
		}
		obj.description = obj.description || [];
		desc = optionParamLine(line.trim(), true);
		desc.ref = adjustReference(desc.ref);
		obj.description.push( desc );
	},
	/*-
	 * tags['>']
	 [ function (private) ]
	 * parses all lines beginning with '>'
	 * '>' means a tag, all following lines with '-' are associated to it
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
	 * tags['|']
	 [ function (private) ]
	 * parses all lines beginning with '|'
	 * '|' means usage of the documented element
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'|': function( obj, line ) {
		obj.tags[lastTag] = obj.tags[lastTag] || [];
		obj.tags[lastTag].push( line );
	},
	/*-
	 * tags['-']
	 [ function (private) ]
	 * parses all lines beginning with '-'
	 * '-' means an option and is associated to a tag @see function-tags['>'] function-optionParamLine
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 - inherit (boolean) if true, the result is set directly on obj and not on obj.tags[lastTag]
	 -*/
	'-': function( obj, line, inherit ) {
		var item;
		var result;
		line = line.trim();
		
		function checkReferences(refarr) {
			for(var i = 0, len = refarr.length; i < len; i++) {
				if(!~refarr[i].indexOf('-')) {
					refarr[i] = lastTag+'-'+refarr[i];
				}
				refarr[i] = {
					link: refarr[i],
					name: refarr[i].substring(refarr[i].lastIndexOf('-')+1, refarr[i].length)
				};
			}
			return refarr;
		}
		
		if ( line[0] !== '-' ) {
			if ( inherit ) {
				result = optionParamLine( line );
				result.ref = checkReferences(result.ref);
				obj.push( result );
			} else {
				result = optionParamLine( line );
				result.ref = checkReferences(result.ref);
				obj.tags[lastTag].push( result );
			}
		} else {
			item = inherit ? obj[obj.length - 1] : obj.tags[lastTag][obj.tags[lastTag].length - 1];
			item.details = item.details || [];
			tags['-']( item.details, line.substring( 1, line.length ), true );
		}
	},
	/*-
	 * tags['=']
	 [ function (private) ]
	 * parses all lines beginning with '='
	 * '=' means return values similar to '-'@see function-tags['&#45;'] function-optionParamLine
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
	 * tags['#']
	 [ function (private) ]
	 * parses all lines beginning with '#'
	 * '#' means dependency
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'#': function( obj, line ) {
		obj.deps = obj.deps || [];
		obj.deps = obj.deps.concat( line.split( ',' ) );
	},
	/*-
	 * tags['!']
	 [ function (private) ]
	 * parses all lines beginning with '!'
	 * '!' means author
	 > Parameter
	 - obj (object) the object to set
	 - line (string) the line to parse
	 -*/
	'!': function( obj, line ) {
		obj.author = obj.author || [];
		obj.author = obj.author.concat( line.split( ',' ) );
	}
};

/*-
 * optionParamLine
 [ function (private) ]
 * parses lines that are "option"-lines
 * these are usually used in "-" and "="
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
	var see = /\@see/;
	var inref = false;
	var name = !avoidName ? vals.shift() : '';
	var result;
	vals = vals.join(' ');

	if(name && name.lastIndexOf('*') === name.length-1) {
		name = name.replace(/([\S]+)\*$/, '<i>(opt.)</i> $1');
	}
	var ret = {
		name: name,
		desc: [],
		ref: []
	};
	if ( typeRE.test( vals ) ) {
		result = typeRE.exec(vals);
		ret.type = result[1];
		ret.type = ret.type.split( '|' );
		vals = vals.replace(typeRE, '').trim();
	}
	if ( defaultRE.test( vals ) ) {
		result = defaultRE.exec(vals);
		ret.defaults = result[1];
		vals = vals.replace(defaultRE, '').trim();
	}
	if ( validRE.test( vals ) ) {
		result = validRE.exec(vals);
		ret.valids = result[1];
		vals = vals.replace(validRE, '').trim();
	}
	vals = vals.split(' ');
	while ( vals.length ) {
		if ( see.test( vals[0] ) ) {
			inref = true;
			vals.shift();
		}
		if ( inref ) {
			ret.ref.push( vals.shift() );
		} else {
			ret.desc.push( vals.shift() );
		}
	}
	ret.desc = ret.desc.join( ' ' );
	return ret;
};
/*-
 * parseLine
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
