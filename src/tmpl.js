//
// /--------------------------------------------\
// |                                            |
// | tmpl.js                                    |
// | part of "dokumentiere"                     |
// | licensed under GPLv2                       |
// |                                            |
// \--------------------------------------------/

var jade = require( 'jade' );
var cwd = process.cwd();
var path = require( 'path' );
var fs = require( 'fs' );
var fc = require( './foldercopy' );

/*-
 * tmpl
 [ node-module (node) ]
 * gets the parsed comments and generates the html
 > Usage
 | var tmpl = require('tmpl');
 -*/
var tmpl = {
	/*-
	 * generate(obj, out)
	 [ function (public) ]
	 * iterates over the generated object and generates html for each 
	 * file and an index file @see function-index function-items
	 > Parameter
	 - obj (object) the comment-parsed object
	 - out (string) the folder to put the documentation to
	 -*/
	generate: function( obj, out ) {
		this.out = out;
		var index = [];
		var types = [];
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				index = index.concat( obj[prop] );
				for( var i = 0, file = obj[prop], len = file.length; i < len; i++) {
					if ( !~types.indexOf( file[i].type ) ) {
						types.push( file[i].type );
					}
				}
			}
		}
		this.index( index, types );
		
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				this.items( obj[prop], prop, index, types );
			}
		}
		
		fc.recursiveCopy( ['css', 'img', 'js'], ['templates', 'public'], out );
	},
	/*-
	 * index(arr, types)
	 [ function (public) ]
	 * generates the index-file @see function-render
	 * to adjust HTML see index.jade in the templates folder
	 > Parameter
	 - arr (array) the array of files documented
	 - types (array) the array of types of documented elements
	 -*/
	index: function( arr, types ) {
		var that = this;
		this.render( 'index', {
			index: arr,
			types: types
		}, function() {
			that.writeHTML.apply( that, arguments );
		} );
	},
	/*-
	 * items(arr, file, index, types)
	 [ function (public) ]
	 * generates the markup for each file @see function-render
	 * to adjust HTML see module.jade in the templates folder
	 > Parameter
	 - arr (array) the array of all parsed elements in a file
	 - file (string) the name of the file, in which the element is
	 - index (array) the array of all elements adjusted for index @see function-index
	 - types (array) an array of all types
	 -*/
	items: function( arr, file, index, types ) {
		var that = this;
		for( var i = 0, len = arr.length; i < len; i++) {
			// process.stdout.write(JSON.stringify(arr[i], null, ' '));
			this.render( 'module', {
				index: index,
				item: arr[i],
				file: file,
				types: types
			}, function() {
				that.writeHTML.apply( that, arguments );
			} );
		}
	},
	/*-
	 * render(tmplName, data, callback)
	 [ function (public) ]
	 * compiles the data
	 * passes the data to the jade compiler and calls the given callback with the html
	 > Parameter
	 - tmplName (string) the name of the template to use
	 - data (object) the data to compile
	 - callback (function) the function to call with the html
	 -*/
	render: function( tmplName, data, callback ) {
		var name = __dirname + path.sep + 'templates' + path.sep + tmplName + '.jade';
		fs.readFile( name, 'utf8', function( err, content ) {
			if ( err ) {
				throw err;
			}
			var fn = jade.compile( content, {
				filename: name,
				self: true
			} );
			callback( fn( data ), data.item ? ((data.item.scope || data.item.visibility) + '.' + (data.item && data.item.name)) : 'index' );
		} );
	},
	/*-
	 * writeHTML(html, name);
	 [ function (public) ]
	 * writes html! simple as that
	 * writes the given html to the defined path-name
	 > Parameter
	 - html (string) the compiled HTML
	 - name (string) the name of the file to write to
	 -*/
	writeHTML: function( html, name ) {
		fs.writeFile( cwd + path.sep + this.out + path.sep + name + '.html', html, 'utf8', function( err ) {
			if ( err ) {
				console.log( 'could not document ' + name + '.html, because: ' );
				console.log( err );
				return;
			}
			// console.log('documented '+name+'.html');
		} );
	}
};

module.exports = tmpl;
