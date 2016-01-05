/*****
Test a csv template
*****/
var LineDriver = require('../index');

function test( desc, opts ){
	opts = opts || {};
	if( !('props' in opts) ) opts.props = {};
	
	console.log('Before Test : ' + desc);
	
	opts.props.in = 'test2.csv';
	
	//opts.sync = true;
	
	LineDriver.read(opts);
	
	console.log('After Test : ' + desc);
	console.log('');
}

function write( desc, opts ){
	opts = opts || {};
	if( !('props' in opts) ) opts.props = {};
	
	console.log('Before Test : ' + desc);
	
	opts.props.in = 'test2.csv';
	opts.props.out = 'test2out.txt';
	opts.props.join = '\n';
	opts.props.eof = '\n';
	opts.props.sync = true;
	
	LineDriver.write(opts);
	
	console.log('After Test : ' + desc);
	console.log('');
}

LineDriver.template('lowercase',{
	clean : function( next, props, parser ){
		parser.line = parser.line.toLowerCase();
		next();
	}
});

LineDriver.template('ignore-twice',{
	valid : function( next, props, parser ){
		if( parser.line.startsWith('twice') ) parser.valid = false;
		else next();
	}
});

LineDriver.template("table",{
	init : function( next, props ){
		props.table = [];
		props.rows = [];
		props.cols = [];
		props.current = {};
		next();
	},
	line : function( next, props, parser ){
		var colHead,
			row = parser.line.split( props.colDelim );
			
		if( props.colHeadings ) colHead = row.splice(0,1)[0];
		
		if( colHead && parser.index.valid !== 1 ) props.cols.push( colHead );
		
		if( props.rowHeadings && parser.index.valid === 1 ) return props.rows = row;
		
		props.table.push(row);
		
		props.current.row = props.table.length-1;
		
		row.forEach(function(cell, i){
			props.current.cell = cell;
			props.current.col = i;
			next();
		});
	},
	props : {
		colDelim : ',',
		rowHeadings : false,
		colHeadings : false,
		ignoreEmpty : true,
	}
});

function drawTable( props ){
	var table = props.table,
		cols = props.cols,
		rows = props.rows,
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
	props : {
		rowHeadings : true,
		colHeadings : true
	}
});

test("Print another csv table",{
	template : ['lowercase','ignore-twice','table'],
	close : drawTable,
	props : {
		rowHeadings : true,
		colHeadings : true
	}
});

write("Print another csv table",{
	template : ['table'],
	init : function( props, parser ){
		parser.write('Begin Table:');
	},
	line : function( props, parser ){
		var cell = props.current.cell,
			colHead = props.cols[props.current.row],
			rowHead = props.rows[props.current.col];
			
		parser.write( rowHead + ' x ' + colHead + ' = ' + cell );
	},
	close : function( props, parser ){
		parser.write('Close Table');
	},
	write : function( props ){
		console.log( 'Wrote file.' );
	},
	props : {
		rowHeadings : true,
		colHeadings : true
	}
});