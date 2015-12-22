# line-driver
A simple configurable module to read or write files line by line.

## Install
```
npm install line-driver
```
or
```
npm install -g line-driver
```
## Usage

```javascript
var LineDriver = require('line-driver');
//To read a file using the given functions and properties.
LineDriver.read( { options } );
//To write a file using the given functions and properties.
LineDriver.write( { options } );
```

Here is a brief overview of what the possible input options are:

```javascript
{
	//The function to run once the file has loaded and begins to be parsed.
	init : [Function],

	//The function to clean a string before passing it along to the validation and line functions.
	clean : [Function],

	//The function to determine whether the given string is valid or not.
	//Lines that are not valid will be ignored.
	valid : [Function],

	//The function to parse each individual line.
	line : [Function],

	//The function to run when the file stops being parsed.
	close : [Function],

	//The function to run after an output file has been written.
	//Note: Not used in the 'read' function*
	write : [Function],

	//A separate line handler function to use instead of the built-in one
	handler : [Function],

	//Array of names of templates to apply when parsing the file
	template : [Array of Strings],
	
	//The properties to use when parsing the file
	props : [Object],
}
```

## API

Every function has two arguments pass through it.  A 'props' and a 'parser'

**props**

The first argument is the 'props' object.  
The exact same 'props' object will be passed to each function.  
This initially contains the settings used in the parser.
You can use it share any other data from one function to the next.

Note: Changing the settings after initialization will not have any affect.

**parser**

The second argument is the 'parser' object.
This object will have different properties attached that relate directly to the parse state.
Which properties are attached depend on the function that is using it. 

### Parser Properties

These are the various properties that a Parser object might have attached to it:

```javascript
{
	//Contains the indices of the current line
	index : {
		absolute : [Number],	//The current line index from the start of the file
		valid    : [Number]	//The current line index when ignoring invalid lines
	},

	//Whether the current line is valid or not
	valid : [Boolean],

	//The current line from the file
	line : [String],

	//Will return whether or not valid lines remain in the file.
	//Arguments:
	//count (Number) - Number of valid lines to check for (Optional)
	hasNextLine : [Function], //Returns Boolean

	//Get the next valid line from the file
	//Note: This will update the current line and indices to the next line
	nextLine : [String],

	//Get the next nth valid line from the file
	//Note: This will update the current line and indices to the next line
	//Arguments:
	//1. count (Number) - nth valid line to capture (Optional)
	//2. ignoreValid (Bool) - Should this line not increase the valid line index? (Optional, default = false)
	goToLine : [Function], //Returns the captured line or null

	//The stop parsing the current file and close it
	//This is not required, the parser will automatically close when it runs out of valid lines
	//This will invoke the 'close' function and 'write' function (if applicable)
	close : [Function],
	
	//The input can be a string or array of strings.
	//Add the given string to the output file (if applicable)
	//Arguments:
	//str (String || [Strings]) - The string(s) to add to the output file
	write : [Function]
	
}
```

### Functions

Functions and which parser properties are accessible in the parser object

####init
* **write**

```javascript
	init : function( props, parser ){
		console.log('Began parsing the file.');
		parser.write('Start of File');
	}
```

####clean
* **line**

```javascript
	clean : function( props, parser ){
		parser.line = parser.line.toLowerCase();
	}
```

####valid
* **line, valid**

(Note: line is a copy of the actual line, modifying will have no affect)

```javascript
	valid : function( props, parser ){
		parser.valid = parser.line.length > 3;
	}
```

####line
* **line, index, close, hasNextLine, goToLine, nextLine, write**

```javascript
	line : function( props, parser ){
		console.log('Line : ' + parser.line);
		parser.write( parser.line );
		if( parser.line === 'thats all folks' ) parser.close();
	}
```

####close
* **write**

```javascript
	close : function( props, parser ){
		console.log('Done parsing the file.');
		parser.write('End of file');
	}
```

####write
```javascript
	write : function( props, parser ){
		console.log('Done writing the file.');
	}
```

### Properties

These are the different input properties that can be set

####in           [String]
**Required**

The path to read in to the parser.

####out          [String]
**default = props.in**

*write mode only*

The path to write to. 

####sync         [Boolean]
**default = false**

Whether or not the file should be parsed synchronously.

####encoding     [String]
**default = 'utf8'**

The encoding of the file to read/write

####delimiter    [String || RegExp]
**default = /\r\r?|\r?\n/**

The String or RegExp to use to split in the file into an array of lines.

####join         [String]
**default = '\n'**

The string used to connect each line before writing to file.

####eof          [String]
**default = ''**

The string placed after the very last line when writing to the file.

####first        [Number]
**default = 1**

The index of the first line to send to the 'line' function.  Ignores invalid lines.

####last        [Number]

The index of the last line to send to the 'line' function.  Ignores invalid lines.

####count        [Number]

The total number of lines to send to the 'line' function.  Ignores invalid lines.

####skip         [Number]
**default = 1**

The nth valid line to send to the 'line' function when capturing the next line. A value of 2 will capture every other valid line.

####trim         [Boolean]
**default = false**

Whether or not it should automatically apply the .trim() function on the line to remove surrounding whitespace

####commentDelim [String]
**default = ''**
A quick way to remove comments from lines.  If this string is not empty, it will split the line using this value and only capture the first object in the resulting array.

####ignoreEmpty  [Boolean]
**default = false**

Whether or not it should automatically set empty strings as 'invalid'

### Settings

The default value of any of the above properties (except in, out, last, and count) can be set using the following function:

#### settings( options )

Where options is an object containing the key : value pair you want to set.

```javascript
LineDriver.settings( {
	delimiter : ',',
	sync : true
} );
```

### Templates

Templates can be used to create default values for certain properties or functions.

#### template( name, options )

**name [String]** : The name of the template
**options [Objects]** : The default options of this template (same as above)

A template function is identical to a regular function except there is an additional argument that appears before any of the original ones.

This argument is the 'next' function.  Calling this next function will the corresponding function in the next template.
Templates are applied in the order they appear in the given template array.  When no more templates remain, it will run the given function in the original options.

```javascript
//Any function that uses this template will have the 'parser.line' value be split up and sent individually instead of all at once
LineDriver.template('comma-splitter',{
	line : function(next, args, parser){
		var row = parser.line.split(',');
		row.forEach( function( value ){
			parser.line = value;
			next();	//use this to run the given 'line' function (or the 'line' function in the next template if it exists)
		});
	}
});
```

Set the 'default' template to apply to every file (it automatically gets places at the start of the template array).

### Handles

A template or input object can have a handler function associated with it.  This handler can be used to decide when to send the line to the 'lines' function instead of using the built-in method.

####sendLine
The function to run the 'line' functions for all templates and the given input object.

```javascript
//To send each cell in a csv to an output file
LineDriver.write({
	in : 'path/to/file.csv',
	out : 'path/to/new/file.txt',
	//Use the 'props' object to save the data
	init : function(props, parser){
		props.table = [];
		props.rowHeads = [];
		props.colHeads = [];
		props.current = {};
	},
	line : function(args, parser){
		var cell = props.current.cell,
			colHead = props.colHeads[props.current.row],
			rowHead = props.rowHeads[props.current.col];
			
		parser.write( rowHead + ' x ' + colHead + ' = ' + cell );
	},
	handler : function( props, parser ){
		var rowHead, row;
		
		while( parser.hasNextLine() ){
			row = parser.nextLine.split(',');
			
			//remove the first cell since it is a row header
			rowHead = row.splice(0,1)[0];
			
			//if we aren't in the first row, save the row header
			if( parser.index.valid !== 1 ) props.rowHeads.push( rowHead );
			
			//if we are in the first line, then save the row as the column heads
			if( parser.index.valid === 1 ) props.colHeads = row;
			//otherwise, add the row to the table and send the line to the 'line' functions
			else{
				props.table.push(row);
				
				props.current.row = props.table.length-1;
				
				row.forEach(function(cell, i){
					props.current.cell = cell;
					props.current.col = i;
					parser.sendLine();
				});
			}
		}
	},
	props : {
		ignoreEmpty : true
	}
});
```

Note: Only one handler can be applied.  Priority first goes to the given options, and then it is based on the index in the template array (higher index = higher priority)


##License
### MIT