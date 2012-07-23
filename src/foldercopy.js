//
// /--------------------------------------------\
// |                                            |
// | foldercopy.js                              |
// | part of "dokumentiere"                     |
// | licensed under GPLv2                       |
// |                                            |
// \--------------------------------------------/

var fs = require( 'fs' );
var cwd = process.cwd();
var path = require( 'path' );
/*-
 * foldercopy
 [ node-module (node) ]
 : bobbor
 * copies the specified folder
 * it does it recursively from the source-folder to destination-folder including all files
 > Usage
 | var fc = require('foldercopy');
 -*/
var foldercopy = {
	/*-
	 * recursiveCopy(folders, p, dest)
	 [ function (public) ]
	 * copies the specified folders
	 * the function looks in the source folder for the dirs and copies them recursively to the destination
	 > Parameter
	 - folders (array) an array of folder names
	 - p (array) an array of foldernames, that get concatinated using path.sep
	 - dest (string) the destination folder
	 -*/
	recursiveCopy: function( folders, p, dest ) {
		var that = this;
		var base = __dirname + path.sep + p.join( path.sep );
		dest = cwd + path.sep + dest;
		folders.forEach( function( elm, i, folders ) {
			that.copyFolder( base, elm, '', dest );
		} );
	},
	/*-
	 * copyFolder(base, folder, recurse, dest)
	 [ function (public) ]
	 * copies the specified folder
	 > Parameter
	 - base (string) the base folder where to look
	 - folder (string) the name of the folder in "base" to copy
	 - recurse (string) how deep we have iterated (it gets appended to dest)
	 - dest (string) the destination folder
	 -*/
	copyFolder: function( base, folder, recurse, dest ) {
		var that = this;
		fs.mkdir( dest + path.sep + folder + path.sep + recurse, function() {
			fs.readdir( base + path.sep + folder + path.sep + recurse, function( err, files ) {
				iterator( files, function( item ) {
					fs.stat( base + path.sep + folder + path.sep + recurse + item, function( err, stat ) {
						if ( err ) {
							console.log( err );
							return;
						}
						if ( stat.isDirectory() ) {
							that.copyFolder( base, folder, recurse + item + path.sep, dest );
							return;
						}
						that.copyFile( base + path.sep + folder + path.sep + recurse, item, dest + path.sep + folder + path.sep + recurse );
					} );
				}, function() {} );
			} );
		} );
	},
	/*-
	 * copyFile(base, file, dest)
	 [ function (public) ]
	 * copies the specified file
	 > Parameter
	 - base (array) the base folder where to look
	 - file (array) the name of the file in "base" to copy
	 - dest (string) the destination folder
	 -*/
	copyFile: function( base, file, dest ) {
		fs.readFile( base + file, function( err, data ) {
			if ( err ) {
				console.log( err );
				return;
			}
			fs.writeFile( dest + file, data, function( o_O ) {
				if ( o_O ) {
					console.log( o_O );
					return;
				}
				// console.log('copied '+file+' to '+dest);
			} );
		} );
	}
};

/*-
 * iterator(arr, fneach, fnend)
 [ function (private) ]
 * iterates over an array
 * during iteration it calls fneach for each element and fnend when iteration is done
 > Parameter
 - arr (array) the array to iterate over
 - fneach (function) the function to call on each item
 - fnend (function) the function to call when iteration is done
 -*/
var iterator = function( arr, fneach, fnend ) {
	if ( !arr.length ) {
		fnend();
		return;
	}
	var item = arr.pop();
	fneach( item );
	iterator( arr, fneach, fnend );
};

module.exports = foldercopy;
