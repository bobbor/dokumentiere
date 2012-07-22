//
// /--------------------------------------------\
// |                                            |
// | doku.js                                    |
// | part of "dokumentiere"                     |
// | licensed under GPLv2                       |
// |                                            |
// \--------------------------------------------/

var fs = require( 'fs' );
var parseLine = require( './tags' ).parseLine;
var tmpl = require( './tmpl' );

/*-
 * doku
 [ node-module (node) ]
 * starts documentation on the files
 > Properties
 - version (string) <'0.4.0'> the version of the module
 > Usage
 | var doku = require('doku');
 -*/
var doku = {
	version: '0.4.0',
	/*-
	 * parse(files, out)
	 [ function (public) ]
	 * parses the passed files
	 * iterates over the files, starts the file-parser, and starts the markup-generation when done. @see function-parseFile
	 > Parameter
	 - files (array) the array of file-path's to document
	 - out (string) the folder to output to
	 -*/
	parse: function( files, out ) {
		var doku = this;
		var raw = {};
		
		/*
		 * clear empty function arrays
		 */

		var clearFns = function() {
			this.forEach( function( elm, i ) {
				if ( elm.functions && !elm.functions.length ) {
					delete elm.functions;
				}
			} );
		};
		
		/*
		 * inner iteration function
		 */
		var iterate = function( arr ) {
			if ( !arr.length ) {
				tmpl.generate( raw, out );
				return;
			}
			var file = arr.pop();
			fs.readFile( file.path, 'utf8', function( err, content ) {
				if ( err ) {
					throw err;
				}
				raw[file.name] = doku.parseFile( content, file.name );
				clearFns.call( raw[file.name] );
				raw[file.name].src = content;
				iterate( arr );
			} );
		};
		
		iterate( files );
	},
	/*-
	 * parseFile(text, fileName)
	 [ function (public) ]
	 * parses a single file
	 * greps all the comments and calls the commentparser for each comment @see function-parseComment
	 > Parameter
	 - text (string) the string to parse ( in most cases the content of a file)
	 - fileName* (string) the name of the file to parse
	 = (array) an array holding the comments
	 -*/
	parseFile: function( text, fileName ) {
		var parsedText = text.replace( /\r\n/gm, '\n' ).replace( /\t/g, '' );
		var comment = [];
		var doku = [];
		var ret = [];
		var t, i, len;
		var inComment = false;
		parsedText = parsedText.split( '\n' );
		
		for(i = 0, len = parsedText.length; i < len; i++) {
			t = parsedText[i].trim();
			if ( t.indexOf( '-*/' ) === 0 ) {
				if ( inComment ) {
					doku.push( this.parseComment( comment ) );
					comment = [];
				}
				inComment = false;
			}
			if ( inComment ) {
				t && comment.push( t );
			}
			if ( t.indexOf( '/*-' ) === 0 ) {
				inComment = true;
			}
		}
		
		for(i = 0, len = doku.length; i < len; i++) {
			if ( doku[i].scope ) {
				ret.push( doku[i] );
				if ( doku[i].type !== 'function' ) {
					ret[ret.length - 1].functions = [];
				}
			} else if ( doku[i].visibility ) {
				if ( ret[ret.length - 1] && ret[ret.length - 1].functions ) {
					ret[ret.length - 1].functions.push( doku[i] );
				} else {
					ret.push( doku[i] );
				}
			} else if ( doku[i].type !== 'function' ) {
				ret.push( doku[i] );
			}
		}
		return ret;
	},
	/*-
	 * parseComment(comment)
	 [ function (public) ]
	 * parses a comment and generates an object for the tags and lines
	 > Parameter
	 - comment (string) the comment to parse
	 = (object) the result of the parsing
	 -*/
	parseComment: function( comment ) {
		var co = {
			name: comment[0],
			type: comment[1]
		};
		function setupType( type ) {
			type = type.replace( /\[(\s|\s+)([\S\s]+)(\s|\s+)\]/, "$2" ).trim();
			if ( type.indexOf( '(' ) !== -1 ) {
				this.scope = type.substring( type.indexOf( '(' ) + 1, type.indexOf( ')' ) );
				if ( this.scope === 'public' || this.scope === 'private' ) {
					this.visibility = this.scope;
					delete this.scope;
				}
				this.type = type.substring( 0, type.indexOf( '(' ) - 1 );
			} else {
				this.type = type;
			}
		}
		co.name = co.name.substring( 1, co.name.length ).trim();
		setupType.call( co, co.type );
		for( var i = 2, len = comment.length; i < len; i++) {
			parseLine( co, comment[i] );
		}
		return co;
	}
};

module.exports = doku;
