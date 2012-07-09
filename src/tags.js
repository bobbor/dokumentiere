var lastTag = 'generic';

var tags = {
	'*': function(obj, line) {
		obj.description = obj.description || [];
		obj.description.push(line.trim());
	},
	'>': function(obj, line) {
		lastTag = line.trim();
		obj.tags = obj.tags || {};
		obj.tags[lastTag] = obj.tags[lastTag] || [];
		
	},
	'|': function(obj, line) {
		obj.tags[lastTag] = obj.tags[lastTag] || [];
		obj.tags[lastTag].push(line);
	},
	'-': function(obj, line, inherit) {
		var item;
		line = line.trim();
		if(line[0] !== '-') {
			if(inherit) {
				obj.push(optionParamLine(line));
			} else {
				obj.tags[lastTag].push(optionParamLine(line));
			}
		} else {
			item = inherit ? obj[obj.length-1] : obj.tags[lastTag][obj.tags[lastTag].length-1];
			item.details = item.details || [];
			tags['-'](item.details, line.substring(1, line.length), true);
		}
	},
	'=': function(obj, line, inherit) {
		var item;
		if(!inherit) { obj.returns = obj.returns || []; }
		
		line = line.trim();
		if(line[0] !== '=') {
			if(inherit) {
				obj.push(optionParamLine(line));
			} else {
				obj.returns.push(optionParamLine(line, true));
			}
		} else {
			item = inherit ? obj[obj.length-1] : obj.returns[obj.returns.length-1];
			item.details = item.details || [];
			tags['='](item.details, line.substring(1, line.length), true);
		}
	},
	'#': function(obj, line) {
		obj.deps = obj.deps || [];
		obj.deps = obj.deps.concat(line.split(','));
	},
	'!': function(obj, line) {
		obj.author = obj.author || [];
		obj.author = obj.author.concat(line.split(','));
	}
};

var optionParamLine = function(line, avoidName) {
	var vals = line.split(' ');
	var typeRE = /\((\s{0,}[\S\s]{0,}\s{0,})\)/;
	var defaultRE = /\<(\S+)\>/;
	var validRE = /\[([\S\s]+)\]/;
	var see = /\@see/;
	var inref = false;
	var ret = {
		name: !avoidName ? vals.shift() : '',
		desc: [],
		ref: []
	};
	if(typeRE.test(vals[0])) {
		ret.type = vals.shift().replace(typeRE, "$1");
		ret.type = ret.type.split('|');
	}
	if(defaultRE.test(vals[0])) {
		ret.defaults = vals.shift().replace(defaultRE, "$1");
	}
	if(validRE.test(vals[0])) {
		ret.valids = vals.shift().replace(validRE, "$1");
		ret.valids.split(',');
	}
	if(see.test(vals[0])) {
		inref = true;
	}
	while(vals.length) {
		if(inref) {
			ret.ref.push(vals.shift());
		} else {
			ret.desc.push(vals.shift());
		}
	}
	ret.desc = ret.desc.join(' ');
	return ret;
};

exports.parseLine = function(obj, line) {
	var tag = line[0];
	line = line.substring(1, line.length);
	tags[tag](obj, line);
}