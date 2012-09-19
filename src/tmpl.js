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
var fse = require( './inc/fs_ext' );
var log = require('./inc/logger');

/*-
 * tmpl
 [ node-module (node) ]
 : bobbor
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
	generate: function( obj, theme, out ) {
		log.head('Output Generation');
		var that = this;
		this.out = out;
		this.theme = theme;
		var index = [];
		var types = [];
		log.info('using theme "'+this.theme+'"');
		
		
		function startProcess() {
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
			if(theme !== 'none') {
				that.index( index, types );
			}
			
			for( var prop in obj) {
				if ( obj.hasOwnProperty( prop ) ) {
					that.items( obj[prop], prop, index, types );
				}
			}
			if(theme !== 'none') {
				fse.reccopy(
					path.normalize(__dirname+['/..', 'themes', that.theme, 'public'].join('/')), 
					out+'/',
					false,
					function() {}
				);
			}
		}
		if(theme !== 'none') {
			fs.exists(out+'/sources/', function(exists) {
				if(!exists) {
					fs.mkdir(out+'/sources/', function(ex) {
						if(ex) {
							throw ex;
						}
						startProcess();
					});
				} else {
					startProcess();
				}
			});
		} else {
			startProcess();
		}
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
			Array.prototype.push.call(arguments, function() {
				log.info('generated index.html');
			});
			that.writeHTML.apply( that, arguments);
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
		var data = {};
		if(this.theme !== 'none') {
			this.render('src', {
				index: index,
				types: types,
				src: arr.src,
				name: 'sources'+path.sep+file
			}, function() {
				Array.prototype.push.call(arguments, function() {
					log.info('generated source file for '+file);
				});
				that.writeHTML.apply(that, arguments);
			});
		}
		
		for( var i = 0, len = arr.length; i < len; i++) {
			data = {
				index: index,
				item: arr[i],
				file: file,
				link: 'sources'+path.sep+file.replace(new RegExp('\\'+path.sep, 'g'), '-')+'.html',
				types: types
			};
			
			if(that.theme !== 'none') {
				this.render( 'module', data, function() {
					Array.prototype.push.call(arguments, function() {
						log.info('generated documentation file for '+file);
					});
					that.writeHTML.apply( that, arguments);
				} );
			} else {
				var name = data.item
							? ((data.item.scope || data.item.visibility) + '.' + (data.item && data.item.name))
							: data.src
								? data.name.replace(new RegExp('\\'+path.sep, 'g'), '-').replace('sources-', 'sources'+path.sep)
								: 'index'
				that.writeJSON(index, name, function() {
					log.info('generated documentation file for '+file);
				});
			}
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
		var themeFolder = [__dirname,'..','themes',this.theme];
		var template = themeFolder.concat([tmplName+'.jade']);
		var name = template.join(path.sep);
		var that = this;
		
		fs.exists(themeFolder.join(path.sep), function(exists) {
			if(exists) {
				fs.readFile( name, 'utf8', function( err, content ) {
					if ( err ) {
						throw err;
					}
					var fn = jade.compile( content, {
						filename: name,
						self: true
					} );
					callback( fn( data ), 
						data.item
							? ((data.item.scope || data.item.visibility) + '.' + (data.item && data.item.name))
							: data.src
								? data.name.replace(new RegExp('\\'+path.sep, 'g'), '-').replace('sources-', 'sources'+path.sep)
								: 'index'
					);
				} );
				return;
			}
			log.error("no theme folder called "+that.theme+'. Aborting');
			process.exit(1);
		});
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
	writeHTML: function( html, name, cb ) {
		fs.writeFile(this.out + path.sep + name + '.html', html, 'utf8', function( err ) {
			if ( err ) {
				log.error( 'could not document ' + name + '.html, because: ' );
				log.error( JSON.stringify(err) );
				return;
			}
			cb()
		} );
	},
	
	writeJSON: function( json, name, cb ) {
		fs.writeFile(this.out + path.sep + name + '.json', JSON.stringify(json, null, '  '), 'utf8', function( err ) {
			if ( err ) {
				log.error( 'could not document ' + name + '.json, because: ' );
				log.error( JSON.stringify(err) );
				return;
			}
			cb()
		} );
	}
};

module.exports = tmpl;
