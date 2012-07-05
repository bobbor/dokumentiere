# dokumentiere

a node.js module for documentation

Let's jump right in

		/*-
		
		 * myFunction
		 
		 [ function ]
		 
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


... detailed description follows ...