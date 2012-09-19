//
// /--------------------------------------------\
// |                                            |
// | doku.js                                    |
// | part of "dokumentiere"                     |
// | licensed under GPLv2                       |
// |                                            |
// \--------------------------------------------/

var fs = require( 'fs' );
var fse = require('./inc/fs_ext');
var parseLine = require( './tags' ).parseLine;
var tmpl = require( './tmpl' );
var events = require('events');
var path = require('path');
var log = require('./inc/logger');

path.sep = require('os').platform().indexOf('win') === 0 ? '\\' : '/';

function Iterator( arr ) {
	this.item = arr;
	this.i = 0;
	
	this.current = function() {
		return this.item[this.i];
	}
	this.hasNext = function() {
		return this.i !== this.item.length-1;
	};
	this.hasPrev = function() {
		return !!this.i;
	};
	this.next = function() {
		return this.item[++this.i];
	}
	this.prev = function() {
		return this.item[--this.i];
	}
}

function inherit(A,B) {
	A.prototype = new B();
}

function Doku() {
	var inst = this;
	this.version = '0.7.2';
	
	this.addListener('doku-filechecked', function(files) {
		inst.parse(files, inst.out);
	});
}

inherit(Doku, events.EventEmitter);

Doku.prototype.generateDokumentation = function(files, exclude, out, base, theme) {
	this.out = out;
	var inst = this;
	
	inst.theme = theme || 'default';
	log.head('Argument Processing');
	log.info('checking which files to consider');
	
	base = base.replace(/(\\|\/)/g, path.sep);
	function iterateOverFiles(callback) {
		var cleared = [];
		
		function iterate(files) {
			if(!files.length) {
				log.info('have all files');
				callback(cleared);
				return;
			}
			var item = files.pop();
			for(var i = 0, len = exclude.length; i < len; i++) {
				if(item.indexOf(exclude[i]) !== -1) {
					iterate(files);
					return;
				}
			}
			fs.stat(item, function(err, stat) {
				if(err) { throw err; return; }
				if(stat.isDirectory()) {
					fs.readdir(item, function(err, items) {
						if(err) { throw err; }
						for(var i = 0, len = items.length; i < len; i++) {
							files.push(item+path.sep+items[i]);
						}
						iterate(files);
					});
				} else {
					if(/\.js$/.test(item)) {
						cleared.push({
							path: item,
							name: item.replace(new RegExp((base+path.sep).replace(/\\/g, '\\\\'), 'g'), '')
						});
					}
					iterate(files);
				}
			});
		}
		iterate(files);
	}

	iterateOverFiles(function(files) {
		fs.exists(out, function(exists) {
			if(exists) {
				fse.recrmdir(out, true, function() {
					inst.emit('doku-filechecked', files);
				});
			} else {
				fs.mkdir(out, function(o_O) {
					if(o_O) {
						inst.emit('error', 1);
						process.exit(1);
						return;
					}
					inst.emit('doku-filechecked', files);
				});
			}
		});
	});
};

Doku.prototype.parse = function( files, out ) {
		var inst = this;
		var raw = {};
		var filesIterator = new Iterator(files);
		var parsedCounter = files.length;
		
		function fileParsed(name, content, src) {
			--parsedCounter;
			log.info('['+(files.length-parsedCounter)+' of '+files.length+'] - file parsed: '+name);
			if(!content.length) {
				log.warn('\t - '+name+' has no comment(s). skipping');
			} else {
				raw[name] = content;
				clearFns.call( raw[name] );
				raw[name].src = src.replace( /\r\n/gm, '\n' ).split('\n');
			}
			if(!parsedCounter) {
				tmpl.generate( raw, inst.theme, out );
				inst.emit('done');
			}
		}
		 
		function clearFns() {
			this.forEach( function( elm, i ) {
				if ( elm.functions && !elm.functions.length ) {
					delete elm.functions;
				}
			} );
		};
		
		function iterate() {
			var file = filesIterator.current();
			fs.readFile( file.path, 'utf8', function( err, content ) {
				var result;
				if ( err ) {
					inst.emit('error', 2);
					return;
				}
				result = inst.parseFile( file.name, content);
				fileParsed(result.name, result.ret, content);
			} );
			
			if ( !filesIterator.hasNext() ) {
				return;
			}
			filesIterator.next();
			iterate();
		};
		log.head('Comment Parsing');
		log.info('reading all files');
		iterate();
};

Doku.prototype.parseFile = function( fileName, text ) {
	var inst = this;
	
	var parsedText = text.replace( /\r\n/gm, '\n' ).replace( /\t/g, '' );
	parsedText = parsedText.split( '\n' );
	
	var comments = [];
	var comment = [];
	var inComment = false;
	var holder = [];
	var ret= [];
	
	parsedText.forEach(function(line, i) {
		var t = line.trim();
		if ( t.indexOf( '-*/' ) === 0 ) {
			if ( inComment ) {
				comments.push({
					comment: comment,
					line: beginningLine+1
				});
				comment = [];
			}
			inComment = false;
		}
		if ( inComment ) {
			t && comment.push( t );
		}
		if ( t.indexOf( '/*-' ) === 0 ) {
			inComment = true;
			beginningLine = i;
		}
	});
	
	comments.forEach(function(c, i) {
		comments[i] = inst.parseComment(c.comment, c.line);
	});
	
	for(i = 0, len = comments.length; i < len; i++) {
		if ( comments[i].scope ) {
			ret.push( comments[i] );
			if ( comments[i].type !== 'function' ) {
				ret[ret.length - 1].functions = [];
			}
		} else if ( comments[i].visibility ) {
			if ( ret[ret.length - 1] && ret[ret.length - 1].functions ) {
				ret[ret.length - 1].functions.push( comments[i] );
			} else {
				ret.push( comments[i] );
			}
		} else if ( comments[i].type !== 'function' ) {
			ret.push( comments[i] );
		}
	}
	
	return {
		name: fileName, 
		ret: ret
	};
};

Doku.prototype.parseComment = function( comment, line) {
	
	var co = {
		name: comment[0],
		type: comment[1],
		line: line
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
};

Doku.prototype.installTheme = function(theme) {
	fse.reccopy(
		theme, 
		path.normalize(__dirname+'/../themes/'),
		true,
		function() {
			log.info('installed');
		}
	);
};


var doku = new Doku();
doku.API = Doku;

module.exports = doku;
