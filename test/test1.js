/*****
Test different ways to manipulate what lines get sent to the 'line' function
Uses:
controller.close()
opts.first
opts.last
opts.step
opt.count
*****/
var LineDriver = require('../index');

LineDriver.settings({
	commentDelim : '#',
	trim : true,
	ignoreEmpty : true,
});

LineDriver.template("default",{
	line : function( next, props, parser ){
		console.log(parser.line + '	absolute : ' + parser.index.absolute + '	valid : ' + parser.index.valid);
		next();
	}
});

function test( desc, opts ){
	opts = opts || {};
	if( !('props' in opts) ) opts.props = {};
	
	console.log('Before Test : ' + desc);
	
	opts.props.in = 'test1.txt';
	
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
	line : function( props, parser ){
		if( parser.index.valid === 8 ){ parser.close()};
	},
});

test("Stop at 8 using 'last'",{
	props : {
		last : 8,
	}
});

test("First is 2",{
	props : {
		first : 2,
	}
});

test("First is 2, last is 7",{
	props : {
		first : 2,
		last : 7,
	}
});

test("First is 2, count is 6",{
	props : {
		first : 2,
		count : 6,
	}
});

test("step is 2",{
	props : {
		step : 2,
	}
});

test("First is 2, step is 2",{
	props : {
		step : 2,
		first : 2,
	}
});

test("First is 2, step is 2, count is 3",{
	props : {
		step : 2,
		first : 2,
		count : 3
	}
});

test("First is 2, step is 2, count is 4, after second line shift by 1",{
	line : function( props, parser ){
		if(parser.index.valid === 2) parser.goToLine(1,true);
	},
	props : {
		step : 2,
		first : 2,
		count : 4
	}
});

test("Don't capture index 5, end at index 8",{
	line : function( props, parser ){
		if( parser.index.valid === 4 ){ console.log('stepping: ' + parser.nextLine) };
	},
	props : {
		last : 8,
	}
});

test("Don't capture index 5, count is 8",{
	line : function( props, parser ){
		if( parser.index.valid === 4 ){ console.log('stepping: ' + parser.nextLine) };
	},
	props : {
		count : 8,
	}
});

test("Don't count index 5 as valid, count is 7",{
	line : function( props, parser ){
		if( parser.index.valid === 4 ){ console.log('stepping: ' + parser.goToLine(1,true) ) };
	},
	props : {
		count : 7,
	}
});