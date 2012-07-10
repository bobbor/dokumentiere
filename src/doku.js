var fs = require('fs');
var parseLine = require('./tags').parseLine;

var doku = {
	parse: function(files) {
		var doku = this;
		var raw = {};
		var iterate = function(arr) {
			if(!arr.length) {
				process.stdout.write(JSON.stringify(raw, null, ' '));
				return;
			}
			var file = arr.pop();
			fs.readFile(file.path, 'utf8', function(err, content) {
				if(err) { throw err; }
				raw[file.name] = doku.parseFile(content, file.name);
				iterate(arr);
			});
		}
		
		iterate(files);
	},
	parseFile: function(text, fileName) {
		var parsedText = text.replace(/\r\n/gm, '\n').replace(/\t/g, '');
		var comment = [];
		var doku = [];
		var ret = [];
		var t, i, len, scopeIdx;
		var inComment = false;
		parsedText = parsedText.split('\n');
		for(i = 0, len = parsedText.length; i < len; i++) {
			t = parsedText[i].trim();
			if(t.indexOf('-*/') === 0) {
				if(inComment) {
					doku.push(this.parseComment(comment));
					comment = [];
				}
				inComment = false;
			}
			if(inComment) {
				t && comment.push(t);
			}
			if(t.indexOf('/*-') === 0) {
				inComment = true;
			}
		}
		for(i = 0, len = doku.length; i < len; i++) {
			if(doku[i].scope) {
				ret.push(doku[i]);
				if(doku[i].type !== 'function') {
					ret[ret.length-1].functions = [];
				}
			} else if(doku[i].visibility) {
				if(ret[ret.length-1].functions) {
					ret[ret.length-1].functions.push(doku[i]);
				} else {
					ret.push(doku[i]);
				}
			} else if(doku[i].type !== 'function') {
				ret.push(doku[i]);
			}
		}
		return ret;
	}, 
	parseComment: function(comment) {
		var co = {
			name: comment[0],
			type: comment[1]
		};
		function setupType(type) {
			type = type.replace(/\[(\s|\s+)([\S\s]+)(\s|\s+)\]/, "$2").trim();
			if(type.indexOf('(') !== -1) {
				this.scope = type.substring(type.indexOf('(')+1, type.indexOf(')'));
				if(this.scope === 'public' || this.scope === 'private') {
					this.visibility = this.scope;
					delete this.scope;
				}
				this.type = type.substring(0, type.indexOf('(')-1);
			} else {
				this.type = type;
			}
		}
		co.name = co.name.substring(1, co.name.length).trim();
		setupType.call(co, co.type);
		for(var i = 2, len = comment.length; i < len; i++) {
			parseLine(co, comment[i]);
		}
		return co;
	}
};

module.exports = doku;