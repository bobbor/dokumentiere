# dokumentiere

## a node.js module for documentation

Let's jump right in

		/*-
		
		 * myFunction
		 
		 [ function (public) ]
		 
		 * myFunction does some special stuff --> this is the summary
		 * myFunction is not really special it accepts some parameters
		 * and returns a value --> this is the description-body
		 
		 > Parameters
		 - options (object) these are the first values
		 -- property1 (boolean) this describes the key "property1" of the "options" parameter in detail
		 - state* (string) <'active'> ['active', 'inactive'] tells which state should be applied @see options
			
			the asterisk states "state" is optional
			(string) describes the type
			<'active'> tells the default state if the parameter is not given
			['active', 'inactive'] this array says which values are allowed
			@see tells which other options or function should be looked for reference
			
		 = (object) the object that will be returned
		 == property1 (string) the key "property1" of the returned object
		 
		 > Usage
		 | myFunction({
		 |   property1: true
		 | }, 'inactive');
		 
		 -*/

if you know Raphael.js and you have crawled through the source, you may notice some similarities. 
To be honest, Raphael was our reference. when we decided to develop a documentation standard for our
company, we didn't want the typical @-tags. they are too close to java-doc and the branched js-doc.
these both documentation frameworks are pretty close to Class-based development patterns. 
That is not the way our javascript is developed. we make heavy usage of fantastic javascript features
like closures, callbacks or module-pattern. and we want to document jQuery-widgets or plugins too.


### detailed description
		/*-
		
every documentation block is started by `/*-`

		 * myFunction
		
title of the object to describe

		 [ function (details) ]
		
the type of the object (this can be `"function"` or `"plugin"` or `"module"` etc.

the details object can be `"public"` or `"private"` for functions or the namespace etc.

		 * myFunction does some special stuff --> this is the summary
		 * myFunction is not really special it accepts some parameters
		 * and returns a value --> this is the description-body
		
this is the description of the object.

the first line is the summary and will be handled seperately

all other lines will be as the description body, where each lines generates its own paragraph

		 > Parameters
		
each block introduced with a `">"` reflects a collection of parameters or options

possible values are `"Parameters"` `"Options"` `"Events"` and `"throws"`. 

A special case is `"Usage"`. I will tell about this one later.

		 - options (object) these are the first values
		 -- property1 (boolean) this describes the key "property1" of the "options" parameter in detail
		 - state* (string) <'active'> ['active', 'inactive'] tells which state should be applied @see options
			
			the asterisk states "state" is optional
			(string) describes the type
			<'active'> tells the default state if the parameter is not given
			['active', 'inactive'] this array says which values are allowed
			@see tells which other options or function should be looked for reference
		
Each `">"` is followed by a list of `"-"` for each value. these follow a certain pattern.

	- name(* if optional) (type) <defaultValue> [possibleValues] description @see reference

if the type is object you can specify the properties of the object by indenting with an additional minus-sign.

this is extendable to no limit (even `----------` is allowed)

		 = (object) the object that will be returned
		 == property1 (string) the key "property1" of the returned object

the return statement is introduced by an equal-sign
 
this follows the typical `"-"` style for indentation and structure.

except the top-level `=` can't have a name, since it won't get any

		 > Usage
		 | myFunction({
		 |   property1: true
		 | }, 'inactive');

here is the `Usage`. it is special, since it is not followed by minus signs.

Instead it is followed by vertical lines, which are transformed to code-examples. So formatting and whitespace is important.

		 -*/
		 
and with `-*/` you end the documentation block.
		
### Customization

You have a lot of freedom when it comes to the Parameter and the the return-types. But when you
want to add new `">"`-Statements or you want to add a new `[ ... ]` because the predefined do 
not fit your needs.

how to and what rules to obey, you can read this later, when the source is written.