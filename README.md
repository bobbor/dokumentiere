dokumentiere
============





a node.js module for documentation
----------------------------------

Everything is totally up to you. (remember this sentence, i will come back to this sometimes) 

**dokumentiere** does not parse any JS. it only parses the comments. so you can document the way you can read it the best. 

documentation is written by people for people to understand code better or even at all. And the goal of **dokumentiere** is to explain the code with most meaning.




Installation
------------

	npm -g install dokumentiere





Usage
-----

	dokumentiere -h

	-h, --help                      : prints this help
	-V, --version                   : version information,
	-f, --files <files or folders>  : tells which files to document, can be folders, scans those recursively
	-o, --out <OutputFolder>        : tells where to to put the documentation to
	-e, --exclude <files or folders>: tells which files, folders to exclude, recursively
	-t, --theme <name>              : which theme to use

The `files` and `excludes` parameters can handle multiple arguments seperated by commas. folders and/or files are allowed. You can do something like this:

	dokumentiere -f js -e js/third-party/,js/my.min.js
this documents all javascripts in the js-folder excluding the third-party folder and the my.min.js file.

HowTo
-----

		/*-
		 * Name
		 [ type (scope or visibility) ]
		 * description-header
		 * description-body
		 > segment-header
		 - name (type) <defaultState> [validStates] description @see reference
		 = (type) description-of-return-value
		 > Usage
		 | code-sample
		 -*/


### detailed description

+ `/*-`

	start of a documentation-block

+ `-*/` or `*/`

	end of a documentation-block

+ _first line_ (here "`* Name`") (always starts with `*`)

	states the name of the element to document

+ ` [ type (scope of visibility) ]`

	says of which type it is. e.g _function_ or _widget_ or _Class_.
	_Everything is totally up to you._
	
	as scope or visibility you state the scope (or context) in which the element is valid (e.g. a jQuery-widget may have the scope of its namespace, a node-module may have the scope of "node"). _Everything is totally up to you._

	or the visibility if it is a function (private or public)
		
+ _description of the object_

		* description-header
		* description-body
		
	this is the description of the object. the first line is the summary and will be handled seperately. all other lines will be interpreted as the description body, where each lines generates its own paragraph


+ `>` - segments
	
	each block introduced with a `">"` reflects a collection of parameters or options 

	possible identifier are `"Parameters"`, `"Options"`, `"Events"` and/or `"throws"`. 
	but you may call it different. whatever fits your needs. _Everything is totally up to you._

	**details:**

	every line in a `>` - segment follows a certain pattern:
	+ `-` it is always started with (at least) a dash
	+ `name` --> the name of the item (paramter or option etc.)
	+ `(type)` --> the type of the item (boolean, string etc.)
	+ `<defaultState>` --> the defaultValue of the item _optional_
	+ `[validStates]` --> the valid values the item can have _optional_
	+ `description` --> the description of the item
	+ `@see [.. ref ...]` --> a list of references

	A special case is `"Usage"`.
	
	if you want to tell about invocation or instanciation, you name your segment "Usage" and tell (preformatted) how to use. Example:
		
		> Usage
		| makeMeFancy({
		|   howfancy: 'very fancy'
		| });

+ `=` 

	this is return.
	syntax is the same as in `-` in `>` - segments.

	**NOTE:** Top-Level return values don't have names. (if you wonder -top-level-return-values- ?? what the?? read next block) 





documentation nesting
---------------------

When you develop JavaScript, you see scenarios where your parameters or return-values are more complex than just "Numbers", "Boolean" or "Strings".

But how do you document that your function accepts an object as argument with the property "howfancy" as a key?

here is how it goes in **dokumentiere**

example-Code:
		
		function makeMeFancy(obj) {
			console.log(obj.howfancy);
		}

example documentation (paramter-segment):

		> params
		- obj (object) an object of arguments
		-- howfancy (string) string stating how fancy to make

the second dash, forms a sort of tree. and this allows to document the keys of an object or some instance. This means that actually can document keys of objects which are keys of objects which are keys of objects etc.

The same rules apply to the return (`=`) mechanics.