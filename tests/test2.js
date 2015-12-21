/*****
Test a csv template
*****/
var LineDriver = require('../index');

function test( desc, opts ){
	opts = opts || {};
	if( !('args' in opts) ) opts.args = {};
	
	console.log('Before Test : ' + desc);
	
	opts.args.in = 'test2.csv';
	
	//opts.sync = true;
	
	LineDriver.read(opts);
	
	console.log('After Test : ' + desc);
	console.log('');

}

LineDriver.template('lowercase',{
	clean : function( next, args, parser ){
		parser.line = parser.line.toLowerCase();
		next();
	}
});

LineDriver.template('ignore-twice',{
	valid : function( next, args, parser ){
		if( parser.line.startsWith('twice') ) parser.valid = false;
		else next();
	}
});

LineDriver.template("table",{
	init : function( next, args ){
		args.table = [];
		args.rows = [];
		args.cols = [];
		next();
	},
	line : function( next, args, parser ){
		var colHead,
			row = parser.line.split( args.colDelim );
			
		if( args.colHeadings ) colHead = row.splice(0,1)[0];
		
		if( colHead && parser.index.valid !== 1 ) args.cols.push( colHead );
		
		if( args.rowHeadings && parser.index.valid === 1 ) args.rows = row;
		else args.table.push(row);
	},
	args : {
		colDelim : ',',
		rowHeadings : false,
		colHeadings : false,
		ignoreEmpty : true,
	}
});

function drawTable( args ){
	var table = args.table,
		cols = args.cols,
		rows = args.rows,
		split = splitter = '--------',
		join = '\t|';
		
	console.log(join + rows.join(join) );
	
	rows.forEach(function(){ split += '+' + splitter.slice(1); });
	console.log(split);
	
	cols.forEach(function(s, i){
		console.log( s + join + table[i].join( join ) )
	})
	console.log('');
}

test("Print a csv table",{
	template : ['lowercase','table'],
	close : drawTable,
	args : {
		rowHeadings : true,
		colHeadings : true
	}
});


test("Print another csv table",{
	template : ['lowercase','ignore-twice','table'],
	close : drawTable,
	args : {
		rowHeadings : true,
		colHeadings : true
	}
});