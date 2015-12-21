/*****
Test different ways to manipulate what lines get sent to the 'line' function
Uses:
controller.close()
opts.first
opts.last
opts.skip
opt.count
*****/
var LineDriver = require('../index');

LineDriver.settings({
	commentDelim : '#',
	trim : true,
	ignoreEmpty : true,
});

LineDriver.template("default",{
	line : function( next, parser ){
		console.log(parser.line + '	absolute : ' + parser.index.absolute + '	valid : ' + parser.index.valid);
		next();
	}
});

function test( desc, opts ){
	opts = opts || {};
	if( !('args' in opts) ) opts.args = {};
	
	console.log('Before Test : ' + desc);
	
	opts.args.in = 'test1.txt';
	
	opts.init = function(){
		console.log("Opening Test : " + desc);
	};
	
	opts.close = function(){
		console.log('Closing Test : ' + desc);
		console.log('');
	};
	
	//opts.sync = true;
	
	LineDriver.read(opts);
	
	console.log('After Test : ' + desc);
	console.log('');

}

test("All")

test("Stop at 8 using controller",{
	line : function( parser ){
		if( parser.index.valid === 8 ){ parser.close()};
	},
});

test("Stop at 8 using 'last'",{
	args : {
		last : 8,
	}
});

test("First is 2",{
	args : {
		first : 2,
	}
});

test("First is 2, last is 7",{
	args : {
		first : 2,
		last : 7,
	}
});

test("First is 2, count is 6",{
	args : {
		first : 2,
		count : 6,
	}
});

test("Skip is 2",{
	args : {
		skip : 2,
	}
});

test("First is 2, skip is 2",{
	args : {
		skip : 2,
		first : 2,
	}
});

test("First is 2, skip is 2, count is 3",{
	args : {
		skip : 2,
		first : 2,
		count : 3
	}
});