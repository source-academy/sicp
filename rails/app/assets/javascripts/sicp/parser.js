/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"statements":4,"EOF":5,"statement":6,"if":7,"(":8,"expression":9,")":10,"{":11,"}":12,"else":13,"function":14,"identifier":15,"identifiers":16,"var":17,"=":18,";":19,"return":20,"+":21,"-":22,"*":23,"/":24,"!":25,"%":26,"NUMBER":27,"true":28,"false":29,"DoubleQuoteString":30,"SingleQuoteString":31,"[]":32,"expressions":33,"nonemptyexpressions":34,",":35,"nonemptyidentifiers":36,"Identifier":37,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"if",8:"(",10:")",11:"{",12:"}",13:"else",14:"function",17:"var",18:"=",19:";",20:"return",21:"+",22:"-",23:"*",24:"/",25:"!",26:"%",27:"NUMBER",28:"true",29:"false",30:"DoubleQuoteString",31:"SingleQuoteString",32:"[]",35:",",37:"Identifier"},
productions_: [0,[3,2],[4,0],[4,2],[6,11],[6,8],[6,5],[6,4],[6,2],[6,3],[9,3],[9,3],[9,3],[9,3],[9,2],[9,3],[9,2],[9,3],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,6],[9,4],[9,7],[33,1],[33,0],[34,3],[34,1],[16,1],[16,0],[36,3],[36,1],[15,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2: this.$ = []; 
break;
case 3: this.$ = pair($$[$0-1], $$[$0]); 
break;
case 4:
          this.$ = { tag: 'if', predicate: $$[$0-8], 
                 consequent: $$[$0-5], alternative: $$[$0-1] } ;
        
break;
case 5:
	  this.$ = { tag: 'var_definition', variable: $$[$0-6], 
                 value: { tag: 'function_definition',
                          parameters: $$[$0-4], 
                          body: $$[$0-1] } 
               };
        
break;
case 6:
	  this.$ = { tag: 'var_definition', variable: $$[$0-3], value: $$[$0-1] };
        
break;
case 7:
	  this.$ = { tag: 'assignment', variable: $$[$0-3], value: $$[$0-1] };
        
break;
case 8:this.$ = $$[$0-1];
break;
case 9:
           this.$ = { tag: 'return_statement', expression: $$[$0-1] };
        
break;
case 10:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0-2],[$$[$0],[]]] 
                };
        
break;
case 11:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0-2],[$$[$0],[]]] 
                };
        
break;
case 12:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0-2],[$$[$0],[]]] 
                };
        
break;
case 13:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0-2],[$$[$0],[]]] 
                };
        
break;
case 14:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0],[]]
                };
        
break;
case 15:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0-2],[$$[$0],[]]] 
                };
        
break;
case 16:
           this.$ = { tag: 'application', 
                  operator: {tag:'variable', name: $$[$0-1]}, 
                  operands: [$$[$0],[]] 
                };
        
break;
case 17:this.$ = $$[$0-1];
break;
case 18:this.$ = parseInt(yytext);
break;
case 19:this.$ = true;
break;
case 20:this.$ = false;
break;
case 21: this.$ = yytext.substring(1,yytext.length - 1).replace('\\"','"'); 
break;
case 22: this.$ = yytext.substring(1,yytext.length - 1).replace("\\'","'"); 
break;
case 23:this.$ = [];
break;
case 24:
           this.$ = { tag: 'variable', name: $$[$0] };
	
break;
case 25:
           this.$ = { tag: 'application', 
                  operator: $$[$0-4], operands: $$[$0-1] };
	
break;
case 26:
           this.$ = { tag: 'application', 
                  operator: { tag: 'variable', name: $$[$0-3] }, 
		  operands: $$[$0-1] };
	
break;
case 27:
	   this.$ = { tag: 'function_definition', 
                  parameters: $$[$0-4], body: $$[$0-1]};
        
break;
case 28: this.$ = $$[$0]; 
break;
case 29: this.$ = []; 
break;
case 30: this.$ = [ $$[$0-2], $$[$0] ]; 
break;
case 31: this.$ = [ $$[$0], [] ]; 
break;
case 32: this.$ = $$[$0]; 
break;
case 33: this.$ = []; 
break;
case 34: this.$ = [ $$[$0-2], $$[$0] ]; 
break;
case 35: this.$ = [ $$[$0], [] ]; 
break;
case 36:this.$ = yytext;
break;
}
},
table: [{3:1,4:2,5:[2,2],6:3,7:[1,4],8:[1,13],9:8,14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{1:[3]},{5:[1,20]},{4:21,5:[2,2],6:3,7:[1,4],8:[1,13],9:8,12:[2,2],14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,22]},{8:[1,24],15:23,37:[1,10]},{15:25,37:[1,10]},{8:[1,27],18:[1,26],19:[2,24],21:[2,24],22:[2,24],23:[2,24],24:[2,24],26:[2,24]},{19:[1,28],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{8:[1,13],9:34,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[2,36],10:[2,36],18:[2,36],19:[2,36],21:[2,36],22:[2,36],23:[2,36],24:[2,36],26:[2,36],35:[2,36]},{8:[1,13],9:37,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:38,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:39,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{10:[2,18],19:[2,18],21:[2,18],22:[2,18],23:[2,18],24:[2,18],26:[2,18],35:[2,18]},{10:[2,19],19:[2,19],21:[2,19],22:[2,19],23:[2,19],24:[2,19],26:[2,19],35:[2,19]},{10:[2,20],19:[2,20],21:[2,20],22:[2,20],23:[2,20],24:[2,20],26:[2,20],35:[2,20]},{10:[2,21],19:[2,21],21:[2,21],22:[2,21],23:[2,21],24:[2,21],26:[2,21],35:[2,21]},{10:[2,22],19:[2,22],21:[2,22],22:[2,22],23:[2,22],24:[2,22],26:[2,22],35:[2,22]},{10:[2,23],19:[2,23],21:[2,23],22:[2,23],23:[2,23],24:[2,23],26:[2,23],35:[2,23]},{1:[2,1]},{5:[2,3],12:[2,3]},{8:[1,13],9:40,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,41]},{10:[2,33],15:44,16:42,36:43,37:[1,10]},{18:[1,45]},{8:[1,13],9:46,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:49,10:[2,29],14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],33:47,34:48,37:[1,10]},{5:[2,8],7:[2,8],8:[2,8],12:[2,8],14:[2,8],17:[2,8],20:[2,8],22:[2,8],25:[2,8],27:[2,8],28:[2,8],29:[2,8],30:[2,8],31:[2,8],32:[2,8],37:[2,8]},{8:[1,13],9:50,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:51,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:52,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:53,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{8:[1,13],9:54,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{19:[1,55],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{8:[1,27],10:[2,24],19:[2,24],21:[2,24],22:[2,24],23:[2,24],24:[2,24],26:[2,24],35:[2,24]},{8:[1,24]},{10:[2,14],19:[2,14],21:[2,14],22:[2,14],23:[2,14],24:[2,14],26:[2,14],35:[2,14]},{10:[2,16],19:[2,16],21:[2,16],22:[2,16],23:[2,16],24:[2,16],26:[2,16],35:[2,16]},{10:[1,56],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{10:[1,57],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{10:[2,33],15:44,16:58,36:43,37:[1,10]},{10:[1,59]},{10:[2,32]},{10:[2,35],35:[1,60]},{8:[1,13],9:61,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{19:[1,62],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{10:[1,63]},{10:[2,28]},{10:[2,31],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33],35:[1,64]},{10:[2,10],19:[2,10],21:[2,10],22:[2,10],23:[1,31],24:[1,32],26:[1,33],35:[2,10]},{10:[2,11],19:[2,11],21:[2,11],22:[2,11],23:[1,31],24:[1,32],26:[1,33],35:[2,11]},{10:[2,12],19:[2,12],21:[2,12],22:[2,12],23:[2,12],24:[2,12],26:[2,12],35:[2,12]},{10:[2,13],19:[2,13],21:[2,13],22:[2,13],23:[2,13],24:[2,13],26:[2,13],35:[2,13]},{10:[2,15],19:[2,15],21:[2,15],22:[2,15],23:[2,15],24:[2,15],26:[2,15],35:[2,15]},{5:[2,9],7:[2,9],8:[2,9],12:[2,9],14:[2,9],17:[2,9],20:[2,9],22:[2,9],25:[2,9],27:[2,9],28:[2,9],29:[2,9],30:[2,9],31:[2,9],32:[2,9],37:[2,9]},{8:[1,65],10:[2,17],19:[2,17],21:[2,17],22:[2,17],23:[2,17],24:[2,17],26:[2,17],35:[2,17]},{11:[1,66]},{10:[1,67]},{11:[1,68]},{15:44,36:69,37:[1,10]},{19:[1,70],21:[1,29],22:[1,30],23:[1,31],24:[1,32],26:[1,33]},{5:[2,7],7:[2,7],8:[2,7],12:[2,7],14:[2,7],17:[2,7],20:[2,7],22:[2,7],25:[2,7],27:[2,7],28:[2,7],29:[2,7],30:[2,7],31:[2,7],32:[2,7],37:[2,7]},{10:[2,26],19:[2,26],21:[2,26],22:[2,26],23:[2,26],24:[2,26],26:[2,26],35:[2,26]},{8:[1,13],9:49,14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],34:71,37:[1,10]},{8:[1,13],9:49,10:[2,29],14:[1,36],15:35,22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],33:72,34:48,37:[1,10]},{4:73,6:3,7:[1,4],8:[1,13],9:8,12:[2,2],14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{11:[1,74]},{4:75,6:3,7:[1,4],8:[1,13],9:8,12:[2,2],14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{10:[2,34]},{5:[2,6],7:[2,6],8:[2,6],12:[2,6],14:[2,6],17:[2,6],20:[2,6],22:[2,6],25:[2,6],27:[2,6],28:[2,6],29:[2,6],30:[2,6],31:[2,6],32:[2,6],37:[2,6]},{10:[2,30]},{10:[1,76]},{12:[1,77]},{4:78,6:3,7:[1,4],8:[1,13],9:8,12:[2,2],14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{12:[1,79]},{10:[2,25],19:[2,25],21:[2,25],22:[2,25],23:[2,25],24:[2,25],26:[2,25],35:[2,25]},{13:[1,80]},{12:[1,81]},{10:[2,27],19:[2,27],21:[2,27],22:[2,27],23:[2,27],24:[2,27],26:[2,27],35:[2,27]},{11:[1,82]},{5:[2,5],7:[2,5],8:[2,5],12:[2,5],14:[2,5],17:[2,5],20:[2,5],22:[2,5],25:[2,5],27:[2,5],28:[2,5],29:[2,5],30:[2,5],31:[2,5],32:[2,5],37:[2,5]},{4:83,6:3,7:[1,4],8:[1,13],9:8,12:[2,2],14:[1,5],15:7,17:[1,6],20:[1,9],22:[1,12],25:[1,11],27:[1,14],28:[1,15],29:[1,16],30:[1,17],31:[1,18],32:[1,19],37:[1,10]},{12:[1,84]},{5:[2,4],7:[2,4],8:[2,4],12:[2,4],14:[2,4],17:[2,4],20:[2,4],22:[2,4],25:[2,4],27:[2,4],28:[2,4],29:[2,4],30:[2,4],31:[2,4],32:[2,4],37:[2,4]}],
defaultActions: {20:[2,1],43:[2,32],48:[2,28],69:[2,34],71:[2,30]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 14
break;
case 2:return 20
break;
case 3:return 7
break;
case 4:return 'new'
break;
case 5:return 13
break;
case 6:return 17
break;
case 7:return 18
break;
case 8:return 11
break;
case 9:return 12
break;
case 10:return 19
break;
case 11:return 35
break;
case 12:return 28
break;
case 13:return 29
break;
case 14:return 30;
break;
case 15:return 31;
break;
case 16:return 37
break;
case 17:return 27
break;
case 18:return 32
break;
case 19:return 23
break;
case 20:return 24
break;
case 21:return 22
break;
case 22:return 21
break;
case 23:return 25
break;
case 24:return 26
break;
case 25:return 26
break;
case 26:return 26
break;
case 27:return '>'
break;
case 28:return '<'
break;
case 29:return '>='
break;
case 30:return '<='
break;
case 31:return '&&'
break;
case 32:return '||'
break;
case 33:return 8
break;
case 34:return 10
break;
case 35:return 5
break;
case 36:return 'INVALID'
break;
}
};
lexer.rules = [/^(?:\s+)/,/^(?:function\b)/,/^(?:return\b)/,/^(?:if\b)/,/^(?:new\b)/,/^(?:else\b)/,/^(?:var\b)/,/^(?:=)/,/^(?:\{)/,/^(?:\})/,/^(?:;)/,/^(?:,)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:"(\\"|[^\"])*")/,/^(?:'(\\'|[^\'])*')/,/^(?:[A-Za-z_][A-Za-z0-9_]*)/,/^(?:[0-9]+(\.[0-9]+)?\b)/,/^(?:\[\])/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:!)/,/^(?:%)/,/^(?:===)/,/^(?:!==)/,/^(?:>)/,/^(?:<)/,/^(?:>=)/,/^(?:<=)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:\()/,/^(?:\))/,/^(?:$)/,/^(?:.)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    var source, cwd;
    if (typeof process !== 'undefined') {
        source = require('fs').readFileSync(require('path').resolve(args[1]), "utf8");
    } else {
        source = require("file").path(require("file").cwd()).join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}