/*
http://vowsjs.org/
https://travis-ci.org

Ass csv parsing using templates

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
    'when removing the delimiter': {
        topic: ['one','two','three','four','five'].join('\r\n'),

        'we get a single line': function (topic) {
			var line;
			LineDriver.read( {
				line : function( props, parser ){
					line = parser.line;
					assert.equal( parser.hasNextLine(), false );
				},
				close : function( props, parser ){
					assert.equal( line, topic );
				},
				in : 'test/test.txt',
				props : {
					delimiter : null
				}
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
}).exportTo(module);