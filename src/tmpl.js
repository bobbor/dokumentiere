var jade = require( 'jade' );
var cwd = process.cwd();
var path = require('path');
var fs = require('fs');
var fc = require('./foldercopy');

path.sep = path.sep || require('os').platform().indexOf('win') !== -1 ? '\\' : '/';


var tmpl = {
	generate: function( obj, out ) {
		this.out = out;
		var index = [];
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				index = index.concat( obj[prop] );
			}
		}
		this.index(index);
		
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				this.items( obj[prop], index);
			}
		}
		
		fc.recursiveCopy(['css', 'img'], ['templates','public'], out);
	},
	index: function(arr) {
		this.render('index', { index: arr }, this.writeHTML);
	},
	items: function( arr, index) {
		for( var i = 0, len = arr.length; i < len; i++) {
			this.render('module', { index: index, item: arr[i]}, this.writeHTML);
		}
	},
	render: function(tmplName, data, callback) {
		var name = __dirname+path.sep+'templates'+path.sep+tmplName+'.jade';
		fs.readFile(name, 'utf8', function(err, content) {
			if(err) { throw err; }
			var fn = jade.compile(content, {
				filename: name,
				self: true
			});
			callback(fn(data), (data.item && data.item.name) || 'index');
		});
	},
	writeHTML: function(html, name) {
		fs.writeFile(cwd+path.sep+this.out+path.sep+name+'.html', html, 'utf8', function(err) {
			if(err) {
				console.log('could not document '+name+'.html');
				return;
			}
			console.log('documented '+name+'.html');
		});
	}
};

module.exports = tmpl;
