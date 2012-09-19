(function() {
	var fs = require('fs')
		, path = require('path')
		, _ = require('underscore');
	var nest = 0;
	var asyncEach = function(arr, step, complete) {
		var iterator = function(items) {
			if(!items.length) {
				complete();
				return;
			}
			var item = items.shift();
			
			step(item, function() {
				iterator(items);
			});
		}
		
		iterator(arr);
	};

	h = function(fn) {
		return function(err, data) {
			if (err) {
				console.log(JSON.stringify(err));
				return;
			}
			data ? fn(data) : fn();
		}
	};
	function removeDirForce(dir, leaveTopMost, callback) {
		++nest;
		dir = path.normalize(dir) + '/';
		fs.readdir(dir, h(function(content) {
		
			asyncEach(content, function(entry, next) {
				var filePath = dir + entry;
				fs.stat(filePath, h(function(stats) {
				
					if (stats.isFile()) {
						fs.unlink(filePath, h(next));
					} else if (stats.isDirectory()) {
						removeDirForce(filePath + '/', leaveTopMost, function() {
							nest--;
							next();
						});
					}
				}));
			}, function() {
				if(!(leaveTopMost && nest === 1)) {
					fs.rmdir(dir, h(callback));
				} else {
						callback();
				}
			});
		}));
	}
	
	function copyFile(src, dest, complete) {
		var fileName = src.split(path.sep);
		fileName = fileName[fileName.length-1];
		
		fs.readFile( src, h( function( data ) {
			fs.writeFile( dest + fileName, data, h( function( ) {
				complete();
			} ) );
		} ) );
	}
	
	function copyContents(src, dest, success) {
		var folderName = src.split(path.sep);
		folderName = folderName[folderName.length-1];
		
		fs.mkdir(path.normalize(dest+folderName), h(function() {
			fs.readdir(src, h(function(content) {
				asyncEach(content, function(item, next) {
					var itemPath = path.normalize(src+'/'+item);
					fs.stat(itemPath, h(function(stat) {
						if(stat.isFile()) {
							copyFile(itemPath, path.normalize(dest+'/'+folderName+'/'), function() {
								next();
							})
						} else if(stat.isDirectory()) {
							copyContents(itemPath, path.normalize(dest+'/'+folderName+'/'), function() {
								next();
							});
						}
					}));
				}, function() {
					success();
				});
			}));
		}));
	}

	module.exports = {
		recrmdir: removeDirForce,
		reccopy: function(src, dest, withTopMost, success) {
			var ctx = this;
			var args = arguments;
			
			var folderName = src.split(path.sep);
			folderName = folderName[folderName.length-1];
			
			if(withTopMost) {
				fs.exists(dest+folderName, function(exists) {
					if(exists) {
						removeDirForce(dest+folderName, false, function() {
						copyContents(src, dest, success);
						})
					} else {
						copyContents(src, dest, success);
					}
				});
			} else {
			
				fs.readdir(src, h(function(content) {
					asyncEach(content, function(item, next) {
						var itemPath = path.normalize(src+'/'+item);
						fs.stat(itemPath, h(function(stat) {
							if(stat.isFile()) {
								copyFile(itemPath, path.normalize(dest+'/'), function() {
									next();
								})
							} else if(stat.isDirectory()) {
								copyContents(itemPath, path.normalize(dest+'/'), function() {
									next();
								});
							}
						}));
					}, function() {
						success();
					});
				}));
				
			}
		}
	};
}());