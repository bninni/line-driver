/*****
Copyright 2015
Author	: Brian Ninni
Website	: ninni.io
Email	: brian@ninni.io
License	: MIT
=========================================
Detailed Comments 

Send 'index' to the clean and valid functions?  User will just have to know that the validIndex refers to the index of the line that was last sent

Freeze the parser object

parser.previousLine and goToline( -1 )?

All opts and props reference should be set to variables at the start

Allow first, last, step, count to be changed dynamically?

Should templates be able to include other templates?

Error checking on invalid inputs?

Add in Compare function
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
	var str, step, first, last, count, lines, handler, commentDelim, trim, ignoreEmpty,
		out = [],
		closed = false,
		opts = opts || {},
		props = opts.props || {},
		index = 0,
		validIndex = 0,
		template = opts.template ? opts.template.slice() : [],
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
		
		//add the default template to the front of array if it isn't already there
		if( template.indexOf('default') === -1 ) addFirst(template,'default');

		for( key in Settings ) obj[key] = Settings[key];
		
		//to update the default props
		template.forEach(function(name){
			var temp, tempProps;
				
			temp = Templates[name];
			if( !temp ) return;

			if( temp.handler ) handler = temp.handler;
			
			tempProps = temp.props || {};
			for( key in tempProps ) obj[key] = tempProps[key];
		});
		
		if( opts.handler ) handler = opts.handler;
		
		for( key in props ) obj[key] = props[key];

		lines = data.split( obj.delimiter );
		
		step = obj.step;
		first = obj.first = Math.max(0, obj.first-1);
		last = obj.last;
		count = obj.count;

		commentDelim = obj.commentDelim;
		trim = obj.trim;
		ignoreEmpty = obj.ignoreEmpty;
		
		props = obj;
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
		if( write ) write( out.join( props.join || Settings.join ) + props.eof, function(){
			run('write')
		});
	}

	function clean( str ){
		var obj = {};
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
		
		if( ignoreEmpty && !str ) return false;
		
		run('valid', obj );
		return obj.valid;
		
	}
	
	function nextLine( i, ignoreValid ){
		var i = i || step;
		
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
		
		if( handler ){
			Object.defineProperties( parser , {
				sendLine : {
					value : line
				}
			});
			handler( props, parser );
		}
		else{
			//handle the first line
			if( isString( nextLine(1) ) ) line();
			
			//go through every line in the array or until it reaches the end index
			while( isString( nextLine() ) ) line();
		}
		tryClose();
	}
	
	start();
};

function apply( opts, write ){
	var opts = opts || {},
		props = opts.props || {},
		path = props.in,
		out = props.out || path,
		sync = 'sync' in props ? props.sync : Settings.sync,
		encoding = props.encoding || Settings.encoding;
	
	if( !path ) return;
	
	if( write ) write = sync ? function( data, callback ){
		writeFileSync(out, data);
		callback();
	} : function( data, callback ){
		writeFile(out, data, callback);
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