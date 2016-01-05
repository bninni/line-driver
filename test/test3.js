/*****
Test a csv template
*****/
var LineDriver = require('../index');

function write( desc, opts ){
	opts = opts || {};
	if( !('props' in opts) ) opts.props = {};
	
	console.log('Before Test : ' + desc);
	
	opts.props.in = 'https://raw.githubusercontent.com/bninni/line-driver/master/test/test2.csv';
	opts.props.out = 'test3out.txt';
	
	LineDriver.write(opts);
	
	console.log('After Test : ' + desc);
	console.log('');
}

LineDriver.template('table',{
	init : function( next, props ){
		props.table = [];
		props.rows = [];
		props.cols = [];
		props.current = {};
		next();
	},
	line : function( next, props, parser ){
		var colHead, row;
		
		do{
			row = parser.line.split(',');
			
			colHead = row.splice(0,1)[0];
			
			if( parser.index.valid !== 1 ) props.cols.push( colHead );
			
			if( parser.index.valid === 1 ) props.rows = row;
			else{
				props.table.push(row);
				
				props.current.row = props.table.length-1;
				
				row.forEach(function(cell, i){
					props.current.cell = cell;
					props.current.col = i;
					next();
				});
			}
		} while( parser.nextLine )
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
		ignoreEmpty : true
	}
});