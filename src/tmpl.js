var jade = require( 'jade' );
var cwd = process.cwd();
var path = require('path');
var fs = require('fs');
var fc = require('./foldercopy');

path.sep = path.sep || require('os').platform().indexOf('win') !== -1 ? '\\' : '/';

var tmpl = {
	generate: function( obj, out ) {
		var index = [];
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				index = index.concat( obj[prop] );
				this.items( obj[prop], out );
			}
		}
		fc.recursiveCopy(['css', 'img'], ['templates','public'], out);
	},
	items: function( arr, out ) {
		for( var i = 0, len = arr.length; i < len; i++) {
			this.render('module', arr[i], function(html, name) {
				fs.writeFile(cwd+path.sep+out+path.sep+name+'.html', html, 'utf8', function(err) {
					if(err) {
						console.log('could not document '+name+'.html');
						return;
					}
					console.log('documented '+name+'.html');
				});
			});
		}
	},
	render: function(tmplName, data, callback) {
		var name = __dirname+path.sep+'templates'+path.sep+tmplName+'.jade';
		fs.readFile(name, 'utf8', function(err, content) {
			if(err) { throw err; }
			var fn = jade.compile(content, {
				filename: name
			});
			callback(fn(data), data.name);
		});
	},
	writeHTML: function( html ) {

	}
};

module.exports = tmpl;
