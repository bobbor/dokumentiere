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
		var types = [];
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				index = index.concat( obj[prop] );
				for(var i = 0, file = obj[prop], len = file.length; i < len; i++) {
					if(!~types.indexOf(file[i].type)) {
						types.push(file[i].type);
					}
				}
			}
		}
		this.index(index, types);
		
		for( var prop in obj) {
			if ( obj.hasOwnProperty( prop ) ) {
				this.items( obj[prop], prop, index, types);
			}
		}
		
		fc.recursiveCopy(['css', 'img'], ['templates','public'], out);
	},
	index: function(arr, types) {
		var that = this;
		this.render('index', { index: arr, types: types }, function() {
			that.writeHTML.apply(that, arguments);
		});
	},
	items: function( arr, file, index, types) {
		var that = this;
		for( var i = 0, len = arr.length; i < len; i++) {
			//process.stdout.write(JSON.stringify(arr[i], null, '\t'));
			this.render('module', {index: index, item: arr[i], file: file, types: types}, function() {
				that.writeHTML.apply(that, arguments);
			});
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
			callback(fn(data), data.item ? ((data.item.scope || data.item.visibility)+'.'+(data.item && data.item.name)) : 'index');
		});
	},
	writeHTML: function(html, name) {
		fs.writeFile(cwd+path.sep+this.out+path.sep+name+'.html', html, 'utf8', function(err) {
			if(err) {
				console.log('could not document '+name+'.html, because: ');
				console.log(err);
				return;
			}
			//console.log('documented '+name+'.html');
		});
	}
};

module.exports = tmpl;
