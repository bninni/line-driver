/*****
Copyright 2015
Author	: Brian Ninni
Website	: ninni.io
Email	: brian@ninni.io
License	: MIT
===========================================
Todo:

Allow absolute inputs for first, last, count, step, range

Allow range input
	range : [1,5]
	or
	range : [[1,5],[6,10]]

Handle redirect for http/https

LineDriver({opts}), will only write if there is an 'out' path

Update README:
	-indices in the clean and valid functions
		-User will just have to know that the validIndex refers to the index of the line that was last sent
	-move in/out outside of the props obj
	-http/https
	-absolute input lines
	-LineDriver({opts})
	
Detailed Comments 
=========================================
Future:

Write to http/https using POST?

parser.previousLine and goToline( -1 )
	-also remember to update the index values

Allow first, last, step, count to be changed dynamically
-or, allow them to be functions
	-also allow path, etc, to be functions? arrays?

Templates should be able to reference other templates

Error checking on invalid inputs

Add in Compare function
*****/
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	readFile = fs.readFile,
	readFileSync = fs.readFileSync,
	writeFile = fs.writeFile,
	writeFileSync = fs.writeFileSync,
	Settings = {
		encoding : 'utf8',
		delimiter : new RegExp('\r\n?|\r?\n'),
		join : '\n',
		eof : '',
		first : 1,
		step : 1,
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
	var str,
		prevLines = [],
		out = [],
		closed = false,
		props = opts.props,
		step = props.step,
		first = props.first = Math.max(0, props.first-1),
		last = props.last,
		count = props.count,
		lines = data.split( props.delimiter),
		commentDelim = props.commentDelim,
		trim = props.trim,
		ignoreEmpty = props.ignoreEmpty,
		join = props.join,
		eof = props.eof,
		index = 0,
		validIndex = 0,
		template = opts.template.slice(),
		indices = {},
		writer = {},
		parser = {
			index : indices
		};
		
	function setup(){
		
		var key,
			obj = {};
		
		Object.defineProperties( writer, {
			write : {
				value : addLine,
			},
		});
		
		Object.defineProperties( parser, {
			line : {
				set : function(s){ str = s },
				get : function(){ return str; }
			},
			close : {
				value : function(){
					tryClose();
					closed = true;
				}
			},
			hasNextLine : {
				value : hasNextLine,
			},
			goToLine : {
				value : nextLine,
			},
			nextLine : {
				get : nextLine,
			},
			write : {
				value : addLine,
			},
		});
			
		Object.defineProperties( indices, {
			absolute : {
				get : function(){ return index; }
			},
			valid : {
				get : function(){ return validIndex; }
			},
		});
		
		Object.freeze( parser );
		Object.freeze( indices );
	}

	function addLine( str ){
		var args = Array.prototype.slice.apply(arguments);
		
		args.forEach( function forEach( str ){
			if( str === undefined || str === null ) return;
			if( str.constructor === Array ) return str.forEach(forEach);
			out.push(str);
		});
	}
	
	function run( name, arg ){
		var arr = template.slice(),
			next = function(){
				var temp;
				
				if( arr.length ){
					temp = Templates[ getFirst(arr) ];
					if( temp && temp[name] ) temp[name]( next, props, arg );
					else next();
				}
				else if( opts[name] ) opts[name]( props, arg );
			};
		next();
	}
	
	function tryClose(){
		if( closed ) return;
		run('close', writer);
		if( write ) write( out.join( join ) + eof, function(){
			run('write')
		});
	}

	function clean( str ){
		var obj = {};
		Object.defineProperty( obj, 'index', {
			get : function(){return indices;}
		});
		if( commentDelim ) str = str.split( commentDelim )[0];
		if( trim ) str = str.trim();
		obj.line = str;
		run( 'clean', obj );
		return obj.line;
	}
	
	function canContinue(){
		return (!count || validIndex < count) &&
			(!last || validIndex < last-first);
	}
	
	function isValid( str ){
		var obj = {
			line : str,
			valid : true
		};
		
		Object.defineProperty( obj, 'index', {
			get : function(){return indices;}
		});
		
		if( ignoreEmpty && !str ) return false;
		
		run('valid', obj );
		return obj.valid;
		
	}
	
	function nextLine( i, ignoreValid ){
		var i = i || step;
		
		str = null;
		
		while( !closed && i && canContinue() ){
			str = getFirst(lines);
			
			prevLines.push(str);
			
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
			target = target || step;
		while( !closed && i < lines.length ){
			if( isValid( clean( lines[i++] ) ) ){
				//return true if we have enough valid lines
				if( ++count === target ) return true;
			}
		}
		return false;
	}
	
	function init(){
		run('init', writer);
	}
	
	function line(){
		run('line', parser);
	}
	
	function start(){
		var i;
		setup();
		init();
		
		i=first;
		//remove up to the first line
		while( i-- ) nextLine(1,true);
		
		//handle the first line
		if( isString( nextLine(1) ) ) line();
		
		//go through every line in the array or until it reaches the end index
		while( isString( nextLine() ) ) line();

		tryClose();
	}
	
	start();
};

function get( opts, path, getter, write ){
	getter.get( path, function (res) {
		var file = '';
		res.on('data', function(chunk) {
			file += chunk;
		});
		res.on('end', function() {
			parse( opts, file, write )
		});
	});
};

function flattenProps( props, template ){
	var key,
		props = props || {},
		ret = {};
	
	for( key in Settings ) ret[key] = Settings[key];
	
	//add the default template to the front of array if it isn't already there
	if( template.indexOf('default') === -1 ) addFirst(template,'default');
		
	//to update the default props
	template.forEach(function(name){
		var temp, tempProps;
			
		temp = Templates[name];
		if( !temp || !(tempProps = temp.props) ) return;
		
		for( key in tempProps ) ret[key] = tempProps[key];
	});
	
	for( key in props ) ret[key] = props[key];
	
	return ret;
};

function apply( opts, write ){
	var opts = opts || {},
		props = opts.props = flattenProps(opts.props, opts.template = opts.template || []),
		path = opts.in || props.in,
		out = opts.out || props.out || path,
		sync = 'sync' in props ? props.sync : Settings.sync,
		encoding = props.encoding || Settings.encoding;
			
	if( !path ) return;
	
	if( write ) write = sync ? function( data, callback ){
		writeFileSync(out, data);
		callback();
	} : function( data, callback ){
		writeFile(out, data, callback);
	};
	
	if( path.startsWith('http://') ) return get( opts, path, http, write );
	else if( path.startsWith('https://') ) return get( opts, path, https, write );
	
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