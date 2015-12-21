/*****
Test a csv template
*****/
var LineDriver = require('../index');

function test( desc, opts ){
	opts = opts || {};
	if( !('args' in opts) ) opts.args = {};
	
	console.log('Before Test : ' + desc);
	
	opts.args.in = 'test2.csv';
	
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

LineDriver.template("csv",{
	init : function( next, args ){
		args.table = [];
		args.rows = [];
		args.cols = [];
	},
	line : function( next, args, parser ){
		var colHead,
			row = parser.line.split( args.colDelim );
			
		if( args.colHeadings ) colHead = row.splice(0,1)[0];
		
		if( colHead && parser.index.valid !== 1 ) args.cols.push( colHead );
		
		if( args.rowHeadings && parser.index.valid === 1 ) args.rows = row;
		else args.table.push(row);
	},
	close : function( next, args ){
		if( args.callback ) args.callback( args.table, args.rows, args.cols );
	},
	args : {
		colDelim : ',',
		rowHeadings : false,
		colHeadings : false,
		ignoreEmpty : true,
	}
});

test("To parse a csv table",{
	template : ['csv'],
	args : {
		rowHeadings : true,
		colHeadings : true,
		callback : function( table, rows, cols ){
			console.log(rows);
			console.log(cols);
			console.log(table);
		},
	}
});