/*****
Copyright 2015
Author	: Brian Ninni
Website	: ninni.io
Email	: brian@ninni.io
License	: MIT
=========================================
Test:
	Clean and Valid functions
	Using parser.nextLine
	Multiple Templates
	Handlers
	Writing files
		-Different settings for 'join'
=========================================
Allow first, last, skip, count to be changed dynamically?

Error checking on invalid inputs?

Create default Table template

Add in Compare function (?)
*****/

var fs = require('fs'),
	readFile = fs.readFile,
	readFileSync = fs.readFileSync,
	writeFile = fs.writeFile,
	writeFileSync = fs.writeFileSync,
	Settings = {
		encoding : 'utf8',
		delimiter : new RegExp('\r\n?|\r?\n'),
		join : '\n',
		first : 1,
		skip : 1,
		trim : false,
		commentDelim : '',
		ignoreEmpty : false,
		sync : false
	},
	Templates = {};
	
//To remove and return the first element of the given array
function getFirst( arr ){
	return arr.splice(0,1)[0];
}

//To add the given object as the first index of the given array
function addFirst( arr, obj ){
	arr.splice(0,0,obj);
}

//To see if the given value is a string or not
function isString( s ){
	return typeof s === 'string';
}
	
/*****
The main read lines function
line	:	the array of strings extract from the file
init	:	the function to run when lines begin to be read
clean	:	the function which takes a string and returns a cleaned version.  Might be used to remove comments or to trim surrounding whitespace
valid	:	the function to determine whether the string is valid enough to be sent through to the line.  Might be used to ignore empty lines or compiler commands
line	:	the function which will receive the line and do whatever it wants with it
close	:	the function to run when lines stop being read (either by the stop function returning true or the lines array depleting)
*****/
function parse( opts, data, write ){
	var str, skip, first, last, count, lines, commentDelim, trim, ignoreEmpty,
		out = [],
		closed = false,
		opts = opts || {},
		args = opts.args || {},
		handler = opts.handler,
		index = 0,
		validIndex = 0,
		template = opts.template ? opts.template.slice() : [],
		indices = {},
		parser = {
			index : indices
		};
		
	function setup(){
		
		var key,
			obj = {};
		
		Object.defineProperties( parser, {
			line : {
				set : function(s){ str = s },
				get : function(){ return str; }
			},
			args : {
				get : function(){ return args; }
			},
			close : {
				value : function(){
					tryClose();
					closed = true;
				}
			},
			hasNextLine : {
				get : hasNextLine,
			},
			nextLine : {
				get : nextLine,
			}
		});
			
		Object.defineProperties( indices, {
			absolute : {
				get : function(){ return index; }
			},
			valid : {
				get : function(){ return validIndex; }
			},
		});
		
		//add the default template to the front of array if it isn't already there
		if( template.indexOf('default') === -1 ) addFirst(template,'default');

		for( key in Settings ) obj[key] = Settings[key];
		
		//to update the default args
		template.forEach(function(temp){
			var tempArgs = temp.args || {};
			for( key in tempArgs ) obj[key] = tempArgs[key];
		});
		
		for( key in args ) obj[key] = args[key];

		lines = data.split( obj.delimiter );
		
		skip = obj.skip;
		first = obj.first = Math.max(0, obj.first-1);
		last = obj.last;
		count = obj.count;

		commentDelim = obj.commentDelim;
		trim = obj.trim;
		ignoreEmpty = obj.ignoreEmpty;
		
		args = obj;
		
		if( write ) parser.write = addLine;
	}

	function addLine( str ){
		if( str === undefined || str === null ) return;
		if( str.constructor === Array ) return str.forEach(addLine);
		out.push(str);
	}
	
	function run( name, arg ){
		var arr = template.slice(),
			next = function(){
				var temp;
				
				if( arr.length ){
					temp = Templates[ getFirst(arr) ];
					if( temp && temp[name] ) temp[name]( next, arg );
					else next();
				}
				else if( opts[name] ) opts[name]( arg );
			};
		next();
	}
	
	function tryClose(){
		if( closed ) return;
		run('close', args );
		if( write ) write( out.join( args.join || Settings.join ), function(){
			run('write', args )
		});
	}

	function clean( str ){
		var obj = {};
		if( commentDelim ) str = str.split( commentDelim )[0];
		if( trim ) str = str.trim();
		obj.str = str;
		run( 'clean', obj );
		return obj.str;
	}
	
	function canContinue(){
		return (!count || validIndex < count) &&
			(!last || validIndex < last-first);
	}
	
	function isValid( str ){
		var obj = {
			line : str,
			index : indices
		};
		
		if( ignoreEmpty && !str ) return false;
		
		obj.valid = true;
		run('valid', obj );
		return obj.valid;
		
	}
	
	function nextLine( i, ignoreValid ){
		var i = i || skip;
		
		str = null;
		
		while( !closed && i && canContinue() ){
			str = getFirst(lines);
			
			if( !isString( str ) ) break;
			
			str = clean(str);
			
			if( isValid( str ) ) i--;
			
			index++;
		}
		
		if( isString(str) && !ignoreValid ) validIndex++;
		
		return str;
	}
	
	function hasNextLine( target ){
		var i = 0,
			count = 0,
			target = target || skip;
		while( !closed && i < lines.length ){
			if( isValid( clean( lines[i++] ) ) ){
				//return true if we have enough valid lines
				if( ++count === target ) return true;
			}
		}
		return false;
	}
	
	function init(){
		run('init', args);
	}
	
	function line(){
		var ret = run('line', parser);
		if( write ) addLine( ret );
	}
	
	function start(){
		var i;
		setup();
		init();
		
		i=first;
		//remove up to the first line
		while( i-- ) nextLine(1,true);
		
		if( handler ){
			parser.init = init;
			parser.clean = clean;
			parser.isValid = isValid;
			parser.line = line;
			return handler( parser );
		}
		
		//handle the first line
		if( isString( nextLine(1) ) ) line();
		
		//go through every line in the array or until it reaches the end index
		while( isString( nextLine() ) ) line();
		
		tryClose();
	}
	
	start();
};

function apply( opts, write ){
	var opts = opts || {},
		args = opts.args || {},
		path = args.in,
		sync = 'sync' in args ? args.sync : Settings.sync,
		encoding = args.encoding || Settings.encoding;
	
	if( !path ) return;
	
	if( write ) write = function( data, callback ){
		writeFile(args.out || path, data, callback);
	};
	
	if( sync ) return parse( opts, readFileSync( path, encoding ), write );
	
	readFile( path, encoding, function( err, data ){
		if(err) throw err;
		parse( opts, data, write );
	});
};

module.exports = {
	read : function( opts ){
		apply(opts, false);
	},
	write : function( opts ){
		apply(opts, true);
	},
	template : function( name, opts ){
		if( name in Templates ) return;
		Templates[name] = opts;
	},
	settings : function( opts ){
		var each;
		for(each in opts) Settings[each] = opts[each];
	}
}