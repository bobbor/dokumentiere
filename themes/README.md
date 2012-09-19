Themes
======

it is possible to insert your own themes into the **dokumentiere**.



installation
------------

you create a folder to which the following rules apply, and then you call

		dokumentiere installtheme <theme-folder-path>



theme-development
-----------------

themes are based on the jade templating system. To develop themes you need to know jade syntax

#### data

if you want to know, what kind of data **dokumentiere** generates, pass "none" as theme when invoking.

		dokumentiere -f files -o out -t none

this generates pure json-data. based on that, you can develop your theme using your jade skills

#### naming

dokumentiere compiles 3 templates

+ index.jade

	required for the "index.html"

+ module.jade
	
	required for each module/class/widget etc.

+ src.jade

	required for rendering html for the sources of the files.

#### public

all your static files that are required by the rendered HTML (like CSS or client-Javascript) belong in the sub-folder "public" of your theme.