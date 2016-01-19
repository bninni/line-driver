/*
http://vowsjs.org/
https://travis-ci.org

Add csv parsing using templates

*/

var LineDriver = require('../index.js'),
	vows = require('vows'),
    assert = require('assert');

LineDriver.settings({
	sync : true,
});
	
vows.describe('Reading a File').addBatch({
    'when reading a file line by line': {
        topic: ['one','two','three','four','five'],

        'we get an array of lines': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        }
    },
}).exportTo(module);
	
vows.describe('Skipping Lines').addBatch({
    'skip the first line': {
        topic: ['two','three','four','five'],
        'using the \'first\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					first : 2
				}
			});
        },
        'using the \'range\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					range : [2,5]
				}
			});
        },
        'using \'index.absolute\' in the \'valid\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				valid : function( props, parser ){
					parser.valid = parser.index.absolute > 0;
				},
				in : 'test/test.txt'
			});
        },
    },
    'skip the last line': {
        topic: ['one','two','three','four'],
        'using the \'last\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					last : 4
				}
			});
        },
        'using the \'range\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					range : [1,4]
				}
			});
        },
        'using \'index.absolute\' in the \'valid\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				valid : function( props, parser ){
					parser.valid = parser.index.absolute < 4;
				},
				in : 'test/test.txt'
			});
        },
        'using \'hasNextLine\' and \'nextLine\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					if( parser.hasNextLine(1) && !parser.hasNextLine(2) ) parser.nextLine;
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
        'using \'index.absolute\' and \'nextLine\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					if( parser.index.absolute === 4 ) parser.nextLine;
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
        'using \'index.absolute\' and \'close\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					if( parser.index.absolute === 4 ) parser.close();
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
    },
    'skip every other line': {
        topic: ['one','three','five'],
        'using the \'step\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					step : 2
				}
			});
        },
        'using the \'range\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					range : [[1,1],[3,3],[5,5]]
				}
			});
        },
        'using \'index.absolute\' in the \'valid\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				valid : function( props, parser ){
					parser.valid = parser.index.absolute%2 === 0;
				},
				in : 'test/test.txt'
			});
        },
        'using \'nextLine\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					parser.nextLine;
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
    },
    'only capture 3 lines': {
        topic: ['one','two','three'],
        'using the \'count\' property': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt',
				props : {
					count : 3
				}
			});
        },
        'using \'index.valid\' in the \'valid\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				valid : function( props, parser ){
					parser.valid = parser.index.valid < 3;
				},
				in : 'test/test.txt'
			});
        },
        'using \'index.valid\' and \'close\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					if( parser.index.valid === 3 ) parser.close();
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
        'using \'hasNextLine\' and \'close\' in the \'line\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
					if( parser.hasNextLine(2) && !parser.hasNextLine(3) ) parser.close();
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/test.txt'
			});
        },
    },
}).exportTo(module);

vows.describe('Cleaning Lines from Messy File').addBatch({
    'without cleaning': {
        topic: ['one','','two    #comment?','  three','four','#another comment:','five'],

        'we get the messy text': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/messy_test.txt'
			});
        }
    },
    'get everything before the # without surrounding spaces': {
        topic: ['one','','two','three','four','','five'],

        'using the \'trim\' and \'commentDelim\' properties': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/messy_test.txt',
				props : {
					trim : true,
					commentDelim : '#'
				}
			});
        },
        'using the \'clean\' function': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				clean : function( props, parser ){
					parser.line = parser.line.split('#')[0].trim();
				},
				in : 'test/messy_test.txt',
			});
        }
    },
    'get the non-messy text': {
        topic: ['one','two','three','four','five'],

        'using the \'trim\', \'commentDelim\', and \'ignoreEmpty\' properties': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				in : 'test/messy_test.txt',
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true
				}
			});
        },
        'using the \'clean\' and \'valid\' functions': function (topic) {
			var array = [];
			LineDriver.read( {
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, topic );
				},
				clean : function( props, parser ){
					parser.line = parser.line.split('#')[0].trim();
				},
				valid : function( props, parser ){
					parser.valid = parser.line.length > 0;
				},
				in : 'test/messy_test.txt',
			});
        },
    },
    'skipping lines when \'absolute\' = false': {
        'using \'first\' = 3 will return last three valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['three','four','five'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					first : 3
				}
			});
        },
        'using \'last\' = 3 will return first three valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','two','three'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					last : 3
				}
			});
        },
        'using \'count\' = 3 will return first three valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','two','three'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					count : 3
				}
			});
        },
        'using \'step\' = 2 will return lines 1, 3, 5': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','three','five'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					step : 2
				}
			});
        },
	},
    'skipping lines when \'absolute\' = true': {
        'using \'first\' = 3 will return four valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['two','three','four','five'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					absolute : true,
					first : 3
				}
			});
        },
        'using \'last\' = 3 will return first two valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','two'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					absolute : true,
					last : 3
				}
			});
        },
        'using \'count\' = 3 will return first two valid lines': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','two'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					absolute : true,
					count : 3
				}
			});
        },
        'using \'step\' = 2 will return lines 1, 2, 4, 5': function () {
			var array = [];
			LineDriver.read( {
				in : 'test/messy_test.txt',
				line : function( props, parser ){
					array.push( parser.line );
				},
				close : function( props, parser ){
					assert.deepEqual( array, ['one','two','four','five'] );
				},
				props : {
					trim : true,
					commentDelim : '#',
					ignoreEmpty : true,
					absolute : true,
					step : 2
				}
			});
        },
	},
}).exportTo(module);
	
vows.describe('Reading a CSV File').addBatch({
    'get the table data': {
        topic: {
			titles : {
				rows : ['X','X'],
				cols : ['X','Y']
			},
			content : [
				['XX','XY'],
				['XX','XY']
			],
		},
        'using a the \'line\' function': function (topic) {
			LineDriver.read( {
				line : function( props, parser ){
					//turn the row into an array of cells
					var rowTitle,
						row = parser.line.split(',');
					
					//the first cell contains the row title
					rowTitle = row.splice(0,1)[0];
					//the first row contains the column titles
					if( parser.index.valid === 1 ) props.table.titles.cols = row;
					else{
						props.table.titles.rows.push( rowTitle );
						props.table.content.push( row );
					}
				},
				close : function( props, parser ){
					assert.deepEqual( props.table, topic );
				},
				in : 'test/test.csv',
				props : {
					ignoreEmpty : true,
					table : {
						titles : {
							rows : [],
							cols : []
						},
						content : []
					}
				}
			});
        },
        'using a template': function (topic) {
			LineDriver.template("table",{
				init : function( next, props ){
					props.titles = {
						rows : [],
						cols : []
					};
					props.current = {};
					next();
				},
				line : function( next, props, parser ){
					var title,
						row = parser.line.split( props.colDelim );
						
					if( props.rowHeadings ) title = row.splice(0,1)[0];
					
					if( title && parser.index.valid !== 1 ) props.titles.rows.push( title );
					
					if( props.colHeadings && parser.index.valid === 1 ) return props.titles.cols = row;
					
					props.current.row = parser.index.valid - (props.colHeadings ? 2 : 1);
										
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
			LineDriver.read( {
				template : ['table'],
				line : function( props, parser ){
					var cell = props.current.cell,
						col = props.current.col,
						row = props.current.row;
					props.outStr += props.titles.rows[row] + '+' + props.titles.cols[col] + '=' + cell + '\n';
				},
				close : function( props, parser ){
					assert.equal( props.outStr, 'X+X=XX\nX+Y=XY\nX+X=XX\nX+Y=XY\n');
				},
				in : 'test/test.csv',
				props : {
					rowHeadings : true,
					colHeadings : true,
					outStr : ''
				}
			});
        },
    },
}).exportTo(module);