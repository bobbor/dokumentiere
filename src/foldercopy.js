var fs = require( 'fs' );
var cwd = process.cwd();
var path = require( 'path' );

path.sep = path.sep || require( 'os' ).platform().indexOf( 'win' ) !== -1 ? '\\' : '/';

var iterator = function(arr, fneach, fnend) {
	if(!arr.length) {
		fnend();
		return;
	}
	var item = arr.pop();
	fneach(item);
	iterator(arr, fneach, fnend);
};

var foldercopy = {
	recursiveCopy: function( folders, p, dest ) {
		var that = this;
		var base = cwd + path.sep + p.join( path.sep );
		dest = cwd+path.sep+dest;
		folders.forEach(function(elm, i, folders) {
			that.copyFolder(base,elm, '', dest);
		});
	},
	copyFolder: function(base, folder, recurse, dest) {
		var that = this;
		fs.mkdir(dest+path.sep+folder+path.sep+recurse, function() {
			fs.readdir(base+path.sep+folder+path.sep+recurse, function(err, files) {
				iterator(files, function(item) {
					fs.stat(base+path.sep+folder+path.sep+recurse+item, function(err, stat) {
						if(err) { console.log(err); return;}
						if(stat.isDirectory()) {
							that.copyFolder(base, folder, recurse+item+path.sep, dest);
							return;
						}
						that.copyFile(base+path.sep+folder+path.sep+recurse, item, dest+path.sep+folder+path.sep+recurse);
					});
				}, function() {});
			});
		});
	},
	copyFile: function(base, file, dest) {
		fs.readFile(base+file, function(err, data) {
			if(err) { console.log(err); return; }
			fs.writeFile(dest+file, data, function(o_O) {
				if(o_O) {
					console.log(o_O); return;
				}
				console.log('copied '+file+' to '+dest);
			});
		});
	}
};

module.exports = foldercopy;
