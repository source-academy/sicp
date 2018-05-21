function m(t,d) {
 // window.navigate("mailto:"+t+"@"+d);
  window.location="mailto:"+t+"@"+d;
}

function R(s) {
  s='var e=TopEnv;'+s;
  s=eval(s);
}

//

var trace = false;

function clone(x) {
  var i, r = new x.constructor;
  for(i in x) {
    if( x[i] != x.constructor.prototype[i] )
      r[i] = x[i];
  }
  return r;
}

//
// Classes...
//

// Pair - List construction block

function Pair( car, cdr ) {
  this.car = car;
  this.cdr = cdr;
}

function isNil(x) {
  return x == theNil || x == null || ( (x instanceof Pair) &&
         x.car == null && x.cdr == null );
}

function Nil() { }
var theNil = new Nil();

Nil.prototype.Str = function() { return '()'; }
Nil.prototype.Html = dumbHtml;
Nil.prototype.ListCopy = function() { return this; }

// Char class constructor - since we don't have Char type in JS
// 2Do: Chat = String with .isChar=true ??

function Char(c) {
  Chars[ this.value = c ] = this;
}

// Symbol class constructor - to distinguish it from String

function Symbol(s) {
  Symbols[ this.name = s ] = this;
}

var Symbols = new Object();
var Chars = new Object();

function getSymbol(name,leaveCase) {
  if( ! leaveCase ) name = name.toLowerCase(); // case-insensitive symbols!
  if( Symbols[name] != undefined ) {
    return Symbols[name];
  }
  return new Symbol(name);
}

function getChar(c) {
  if( Chars[c] != undefined ) {
    return Chars[c];
  }
  return new Char(c);
}

//
// Parser
//

// Tokenizer

function tokenize(txt) {
  var tokens = new Array(), oldTxt=null;
  while( txt != "" && oldTxt != txt ) {
    oldTxt = txt;
    txt = txt.replace( /^\s*(;[^\r\n]*(\r|\n|$)|#\\[^\w]|#?(\(|\[|{)|\)|\]|}|\'|`|,@|,|\"(\\(.|$)|[^\"\\])*(\"|$)|[^\s()\[\]{}]+)/,
      function($0,$1) {
        if( $1.charAt(0) != ';' ) tokens[tokens.length]=$1;
        return "";
      } );
  }
  return tokens;
}

// Parser class constructor

function Parser(txt) {
  this.tokens = tokenize(txt);
  this.i = 0;
}

// get list items until ')'

Parser.prototype.getList = function( close ) {
  var list = theNil, prev = list;
  while( this.i < this.tokens.length ) {
    if( this.tokens[ this.i ] == ')' ||
        this.tokens[ this.i ] == ']' ||
        this.tokens[ this.i ] == '}' ) {
      this.i++; break;
    }

    if( this.tokens[ this.i ] == '.' ) {
      this.i++;
      var o = this.getObject();
      if( o != null && list != theNil ) {
        prev.cdr = o;
      }
    } else {
      var cur = new Pair( this.getObject(), theNil );
      if( list == theNil ) list = cur;
      else prev.cdr = cur;
      prev = cur;
    }
  }
  return list;
}

Parser.prototype.getVector = function( close ) {
  var arr = new Array();
  while( this.i < this.tokens.length ) {
    if( this.tokens[ this.i ] == ')' ||
        this.tokens[ this.i ] == ']' ||
        this.tokens[ this.i ] == '}' ) { this.i++; break; }
    arr[ arr.length ] = this.getObject();
  }
  return arr;
}

// get object

Parser.prototype.getObject = function() {
  if( this.i >= this.tokens.length ) return null;
  var t = this.tokens[ this.i++ ];

 // if( t == ')' ) return null;

  var s = t == "'" ? 'quote' :
          t == "`" ? 'quasiquote' :
          t == "," ? 'unquote' :
          t == ",@" ? 'unquote-splicing' : false;
  if( s || t == '(' || t == '#(' ||
           t == '[' || t == '#[' ||
           t == '{' || t == '#{' ) {
    return s ? new Pair( getSymbol(s),
               new Pair( this.getObject(),
               theNil ))
             : (t=='(' || t=='[' || t=='{') ? this.getList(t) : this.getVector(t);
  } else {

    var n;
    if( /^#x[0-9a-z]+$/i.test(t) ) {  // #x... Hex
      n = new Number('0x'+t.substring(2,t.length) );
    } else if( /^#d[0-9\.]+$/i.test(t) ) {  // #d... Decimal
      n = new Number( t.substring(2,t.length) );
    } else n = new Number(t);  // use constrictor as parser

    if( ! isNaN(n) ) {
      return n.valueOf();
    } else if( t == '#f' || t == '#F' ) {
      return false;
    } else if( t == '#t' || t == '#T' ) {
      return true;
    } else if( t.toLowerCase() == '#\\newline' ) {
      return getChar('\n');
    } else if( t.toLowerCase() == '#\\space' ) {
      return getChar(' ');
    } else if( /^#\\.$/.test(t) ) {
      return getChar( t.charAt(2) );
    } else if( /^\"(\\(.|$)|[^\"\\])*\"?$/.test(t) ) {
       return t.replace( /^\"|\\(.|$)|\"$/g, function($0,$1) {
           return $1 ? $1 : '';
         } );
    } else return getSymbol(t);  // 2Do: validate !!
  }
}

//
// Printers
//

Boolean.prototype.Str = function () {
  return this.valueOf() ? '#t' : '#f';
}

Char.prototype.Str = function () {
  if( this.value == ' ' ) return '#\\space';
  if( this.value == '\n' ) return '#\\newline';
  return '#\\'+this.value;
}

Number.prototype.Str = function () {
  return this.toString();
}

Pair.prototype.Str = function () {
  var s = '';
  for( var o = this; o != null && o instanceof Pair && (o.car != null || o.cdr != null); o = o.cdr ) {
    if( o.car != null ) {
      if(s) s += ' ';
      s += Str(o.car);
    }
  }
  if( o != theNil && o != null && !( o instanceof Pair ) )
    s += ' . ' + Str(o);
  return '('+s+')';
}

String.prototype.Str = function () {
  return '"'+this.replace(/\\|\"/g,function($0){return'\\'+$0;})+'"';
}

Symbol.prototype.Str = function () {
  return this.name;
}

Function.prototype.Str = function () {
  return '#primitive' + (trace ? '<'+this+'>' : '');
}

function Str(obj) {
  if( obj == null ) return "#null";
  if( obj.Str ) return obj.Str();
  var c = obj.constructor, r;
  if( c ) {
    if( r = /^\s*function\s+(\w+)\(/.exec(c) ) c = r[1];
    return '#obj<'+c+'>';
  }
  return '#<'+obj+'>';
}

function Html(obj) {
  if( obj == null ) return "#null";
  if( obj.Html ) return obj.Html();
  return escapeHTML( '#obj<'+obj+'>' );
}

Array.prototype.Str = function () {
  var s='',i;
  for( i=0; i<this.length; i++ ) {
    if( s != '' ) s += ' ';
    s += Str( this[i] );
  }
  return '#('+s+')';
}

Continuation.prototype.Str = function () {
  return "#continuation";
}

// HTML output

function escapeHTML(s) {
  return s.replace( /(&)|(<)|(>)/g,
    function($0,$1,$2,$3) {
      return $1 ? '&amp;' : $2 ? '&lt;' : '&gt;';
    } );
}

function dumbHtml() {
  return escapeHTML( this.Str() );
}

function pairHtml() {
  var s1='',s2='', i, cells = new Array(), allSimple=true, firstSymbol=false;
  for( var o = this; o instanceof Pair && !isNil(o); o = o.cdr ) {
    if( o.car != null ) {
      if( cells.length == 0 )
        firstSymbol = o.car instanceof Symbol && o.car != theBegin;
      allSimple = allSimple && !(o.car instanceof Pair) &&
                               !(o.car instanceof Array);
      cells[cells.length] = Html(o.car);
    }
  }
  if( o != theNil && o != null && !( o instanceof Pair ) ) {
    cells[cells.length] = '.';
    allSimple = allSimple && !(o instanceof Array);
    cells[cells.length] = Html(o);
    if( firstSymbol && cells.length == 3 ) allSimple = true;
  }

  var rowSpan = allSimple ? 1 : firstSymbol ? cells.length-1 : cells.length;
  rowSpan = rowSpan>1 ? ' rowSpan='+rowSpan : '';

  var edit = ''; // " onClick=editCell()"
  for( i=0; i<cells.length; i++ ) {
    if( allSimple || i<1 || (i<2 && firstSymbol) ) {
      s1 += "<td"+(cells[i]=='.'?'':edit)
         + (i==0&&firstSymbol ? ' valign=top'+rowSpan : '')
         + ">" + cells[i] + "<\/td>";
    } else {
      s2 += "<tr><td"+(cells[i]=='.'?'':edit)
         + ">" + cells[i] + "<\/td><\/tr>";
    }
  }

  return '<table border=0 cellspacing=1 cellpadding=4>'
       + '<tr><td valign=top'+rowSpan+'>(<\/td>'
       + s1 + '<td valign=bottom'+rowSpan+'>)<\/td><\/tr>' + s2 + '<\/table>';
//  onClick=hv(this)
}

Boolean.prototype.Html = dumbHtml;
Char.prototype.Html = dumbHtml;
Number.prototype.Html = dumbHtml;
Pair.prototype.Html = pairHtml;
String.prototype.Html = dumbHtml;
Symbol.prototype.Html = dumbHtml;
Function.prototype.Html = dumbHtml;
Array.prototype.Html = dumbHtml;
Continuation.prototype.Html = dumbHtml;

//
// Environment
//

function Env(parent) {
  this.parentEnv = parent;
}

Env.prototype.get = function(name) {
  var v = this[name]; if( v != undefined ) return v;
  for( var o = this.parentEnv; o; o = o.parentEnv ) {
    v = o[name]; if( v != undefined ) return v;
  }
 // if( typeof(v) == 'undefined' ) {
 //   if( this.parentEnv ) return this.parentEnv.get(name); else
    throw new Ex("unbound symbol "+name);
 // } else return v;
}

Env.prototype.set = function( name, value ) {
  for( var o=this; o; o=o.parentEnv )
    if( o[name] != undefined ) return o[name]=value;
 // if( typeof(this[name]) == 'undefined' ) {
 //   if( this.parentEnv ) this.parentEnv.set(name,value); else
    throw new Ex("cannot set! unbound symbol "+name);
 // } else this[name] = value;
}

Env.prototype.Str = function() {
  var s = '',i;
  for( i in this ) {
    if( ! Env.prototype[i] && this[i]!=TopEnv ) {
      if( s != '' ) s += ',';
      var v = this[i];
      s += i + '=' + ( v instanceof Lambda ? '#lambda' :
                       typeof(v) == 'function' ? '#js' :
                       v ? v.Str() : v );
    }
  }
  return '['+s+']';
}

Env.prototype.With = function(a,v) { this[a]=v; this.Private=true; return this; }

// Top Environment

var TopEnv = new Env();

//

function Lambda(args,body,env,compiled) {
  this.args = args;
  this.body = body;
  this.env = env;
  this.compiled = compiled;
}

Lambda.prototype.clone = function(e) {
  if( this.env.Private ) {
    e = new Env(e);
    var i; for( i in this.env ) if(e[i]==undefined) e[i]=this.env[i];
  }

  return new Lambda( this.args, this.body, e, this.compiled);
}

Lambda.prototype.Html = dumbHtml;

Lambda.prototype.Str = function() {
  return "#lambda" + (trace ? "<"+this.args.Str()
        + ',' + this.body.Str()
       // + ( trace ? ',' + this.env.Str() : '' )
        + ">" : '');
}

//
// Evaluator - new state engine (for tail/rec and call/cc)
//

function State(obj,env,cc) {
  this.obj = obj;
  this.env = env;
  this.cc = cc;
}

function stateEval(noTrace) {
  if( this.obj == null ) this.ready = true;
  if( ! this.ready ) {
    this.ready = false;
    this.obj.Eval(this);
  }
  return this.ready;
}

function stateContinue() {
  this.cc.cont(this);
}

State.prototype.Eval = stateEval;
State.prototype.cont = stateContinue;

function Ex(s) { this.s = s; }
Ex.prototype.Str = function(){ return "#error<"+this.s+">"; }
Ex.prototype.Content = function(){ return this.s; }
Ex.prototype.Html = dumbHtml;

getSymbol('(').Eval = getSymbol(')').Eval = function() {
  throw new Ex('unbalanced bracket '+this.name);
}

var topCC = new Continuation(null,null,null,function(state){throw state;});

function doEval( obj, noTrans ) {
  try {
    if( obj instanceof Symbol && obj.Eval == Symbol.prototype.Eval )
      return TopEnv.get(obj.name);

    if( ! noTrans ) {
      try {
        var xformer = TopEnv.get('transform');
        if( xformer instanceof Lambda || xformer instanceof Function ) {
          var o = doEval( new Pair( xformer,
                        new Pair( new Pair( theQuote,
                                  new Pair( obj,
                                  theNil )),
                        theNil)), true );
          if( ! (o instanceof Ex) ) obj = o;
        }
      } catch( ex ) { }
    }

    var state = new State( obj, TopEnv, topCC );
    while( true ) {

      // Both state.Eval() and state.cont()
      // returns True if value was calculated
      // or False if continuation

      if( state.Eval(noTrans) ) {
        state.ready = false;
        state.cont();
      }
    }
  } catch(e) {
    if( e instanceof Ex )
      throw e;
    else if( e instanceof State )
      return e.obj;
    else 
      throw new Ex(e.description); // throw e;
  }
}

function evalTrue(state) {
  state.ready = true;
}

function evalVar(state) {
  state.obj = state.env.get(this.name);
  state.ready = true;
}

// ?? Continuation

function Continuation(obj,env,cc,f) {
  this.i = 0; // for List-cont
  this.obj = obj;
  this.env = env;
  this.cc = cc;
  this.cont = f;
}

Continuation.prototype.clone = function() {
  var r = clone( this );
  if( this.cc ) r.cc = this.cc.clone();
  return r;
}

function continuePair(state) {
  this[this.i++] = state.obj;
  if( isNil(this.obj) ) {
    // apply: 1. create arg list
    var args = theNil, prev = args;
    for( var i = 1; i < this.i; i++ ) {
      var cur = new Pair( this[i], theNil );
      if( args == theNil ) args = cur; else prev.cdr = cur;
      prev = cur;
    }
    // 2. call f()
    state.env = this.env;
    state.cc = this.cc;
    state.obj = callF( this[0], args, state );
  } else {
    state.obj = this.obj.car;
    state.env = this.env;
    state.cc = this;
    this.obj = this.obj.cdr;   // 2Do: (a.b) list!!
    state.ready = false;
  }
}

Pair.prototype.ListCopy = function() {
  var o,p,r = new Pair(this.car);
  for( o = this.cdr, p=r; o instanceof Pair; p=p.cdr=new Pair(o.car), o=o.cdr );
  p.cdr = o; return r;
}

function callF( f, args, state ) {

 Again: while(true) {

  if( typeof( f ) == 'function' ) {
    state.ready = true;
    return f(args,state);

  } else if( f instanceof Lambda ) {

    // map arguments to new env variables
    state.env = new Env(f.env);

    for( var vars = f.args, vals = args;
         (vars instanceof Pair) && !isNil(vars);
         vars = vars.cdr, vals = vals.cdr ) {
      if( vars.car instanceof Symbol ) {
        state.env[ vars.car.name ] = vals.car;
      } else throw new Ex("lambda arg is not symbol");
    }
    if( vars instanceof Symbol ) {
      state.env[ vars.name ] = vals;
    } else if( ! isNil(vars) ) throw new Ex("lambda args are not symbols");

    state.ready = false;
    return f.body;

  } else if( f instanceof Continuation ) {
    state.ready = true;
    state.cc = f.clone();
    // continue - multiple values case...
    if( state.cc.cont == continuePair ) {
      while( !isNil(args.cdr) ) {
        state.cc[state.cc.i++] = args.car;
        args = args.cdr;
      }
    }
    // if( state.cc == topCC ) { }
    return args.car;

  } else {
    throw new Ex("call to non-function " + ( f && f.Str ? f.Str() : f)
                 + (trace ? " with "+args.Str() : ''));
  }
}}

function continueDefine(state) {
  state.env = this.env;
  state.cc = this.cc;
  if( this.define ) {
    state.env[this.obj.name] = state.obj;
  } else {
    state.env.set( this.obj.name, state.obj );
  }
  state.ready = true;
}

function continueBegin(state) {
  state.obj = this.obj.car;
  state.env = this.env;
  state.ready = false;
  if( isNil(this.obj.cdr) ) {
    state.cc = this.cc;
  } else {
    this.obj = this.obj.cdr;
    state.cc = this;
  }
}

function continueIf(state) {
  state.obj = state.obj ? this.obj.car : this.obj.cdr.car;
  state.env = this.env;
  state.cc = this.cc;
  state.ready = false;
}

function continueSyntax(state) {
  state.env = this.env;
  state.cc = this.cc;
  state.ready = false;
}

function evalPair(state) {

  if( isNil(this) ) throw new Ex('Scheme is not Lisp, cannot eval ()');

  var f = (this.car instanceof Symbol) ? state.env.get(this.car.name) : null;

  // lambda, (define (f ...) ...)

  if( f == theLambda || (f == theDefine && (this.cdr.car instanceof Pair)) ) {

    // get function arguments and body

    var args, body;
    if( f == theLambda ) {
      args = this.cdr.car;
      body = this.cdr.cdr;
    } else {  // define
      args = this.cdr.car.cdr;
      body = this.cdr.cdr;
    }

    // create function object

    state.obj = new Lambda( args,
                            isNil(body.cdr) ? body.car :
                            new Pair( getSymbol("begin"), body ),
                            state.env );

    // define

    if( f == theDefine ) {
      state.env[ this.cdr.car.car.name ] = state.obj;
    }

    // OK, don't need to evaluate it any more

    state.ready = true;

  // define, set!

  } else if( f == theDefine || f == theSet ) {

    state.obj = this.cdr.cdr.car;
    state.cc = new Continuation( this.cdr.car, state.env, state.cc, continueDefine );
    state.cc.define = f == theDefine;
    state.ready = false; // evaluate expression first

  // begin

  } else if( f == theBegin ) {

    state.obj = this.cdr.car;
   // if( state.env != TopEnv )
   //   state.env = new Env(state.env);  // 2Do: that is wrong!!
    if( ! isNil(this.cdr.cdr) ) {
      state.cc = new Continuation( this.cdr.cdr, state.env, state.cc, continueBegin );
    }
    state.ready = false;

  // quote

  } else if( f == theQuote ) {
    state.obj = this.cdr.car;
    state.ready = true;

  // if

  } else if( f == theIf ) {
    state.obj = this.cdr.car;
    state.cc = new Continuation( this.cdr.cdr, state.env, state.cc, continueIf );
    state.ready = false;

  // define-syntax

  } else if( f == theDefineSyntax ) {

    state.env[ (state.obj = this.cdr.car).name ] = new Syntax(
      state.env.get(this.cdr.cdr.car.car.name), this.cdr.cdr.car.cdr );
    state.ready = true;

  // Syntax...

  } else if( f instanceof Syntax ) {

    state.cc = new Continuation( null, state.env, state.cc, continueSyntax );
    state.obj = callF( f.transformer, new Pair(state.obj, f.args), state );

  // (...)

  } else {
    state.obj = this.car;
    state.cc = new Continuation( this.cdr, state.env, state.cc, continuePair );
    state.ready = false;
  }
}

Nil.prototype.Eval = evalTrue;
Boolean.prototype.Eval = evalTrue;
Char.prototype.Eval = evalTrue;
Number.prototype.Eval = evalTrue;
Pair.prototype.Eval = evalPair;
String.prototype.Eval = evalTrue;
Symbol.prototype.Eval = evalVar;
Lambda.prototype.Eval = evalTrue;
Array.prototype.Eval = evalTrue;
Continuation.prototype.Eval = evalTrue;
Ex.prototype.Eval = evalTrue;
Function.prototype.Eval = evalTrue; // 2Do: throw Ex??

//
// Syntax transformers...
//

function Syntax( transformer, args ) {
  this.transformer = transformer;
  this.args = args;
}

Syntax.prototype.Eval = evalTrue;
Syntax.prototype.Html = dumbHtml;
Syntax.prototype.Str = function() { return '#syntax'; }

// syntax keywords

TopEnv['begin'] = theBegin = getSymbol('begin');
TopEnv['quote'] = theQuote = getSymbol('quote');
TopEnv['if'] = theIf = getSymbol('if');
TopEnv['define'] = theDefine = getSymbol('define');
TopEnv['set!'] = theSet = getSymbol('set!');
TopEnv['lambda'] = theLambda = getSymbol('lambda');
TopEnv['define-syntax'] = theDefineSyntax = getSymbol('define-syntax');
TopEnv['unquote'] = getSymbol('unquote');
TopEnv['unquote-splicing'] = getSymbol('unquote-splicing');

//
// Built-in functions
//

TopEnv['+'] = function(list) {
  var result = 0;
  while( list instanceof Pair ) {
    if( typeof(list.car)=='number' ) result += list.car;
    list = list.cdr;
  }
  return result;
}

TopEnv['*'] = function(list) {
  var result = 1;
  while( ! isNil(list) ) {
    result *= list.car.valueOf();
    list = list.cdr;
  }
  return result;
}

TopEnv['-'] = function(list) {
  var result = 0, count = 0;
  while( ! isNil(list) ) {
    var o = list.car.valueOf();
    result += (count++ > 0 ? -o : o);
    list = list.cdr;
  }
  return count > 1 ? result : -result;
}

TopEnv['/'] = function(list) {
  var result = 1, count = 0;
  while( ! isNil(list) ) {
    var o = list.car.valueOf();
    result *= (count++ > 0 ? 1/o : o);
    list = list.cdr;
  }
  return count > 1 ? result : 1/result;
}

TopEnv['string-append'] = function(list) {
  var result = '';
  while( ! isNil(list) ) {
    result += list.car;
    list = list.cdr;
  }
  return result;
}

TopEnv['string'] = function(list) {
  var result = '';
  while( ! isNil(list) ) {
    result += list.car.value;
    list = list.cdr;
  }
  return result;
}

TopEnv['vector'] = function(list) {
  var result = new Array();
  while( ! isNil(list) ) {
    result[result.length] = list.car;
    list = list.cdr;
  }
  return result;
}

TopEnv['string->list'] = function(list) {
  var i, result = theNil;
  for( i = list.car.length-1; i >= 0; --i ) {
    result = new Pair( getChar(list.car.charAt(i)), result );
  }
  return result;
}

// fixed arguments

TopEnv['car'] = function(list) { return list.car.car; }
TopEnv['cdr'] = function(list) { return list.car.cdr; }
TopEnv['cons'] = function(list) { return new Pair(list.car,list.cdr.car); }

TopEnv['eval'] = function(list) { return doEval(list.car); }
TopEnv['string->symbol'] = function(list) { return getSymbol(list.car,true); }
TopEnv['symbol->string'] = function(list) { return list.car.name; }

TopEnv['encode'] = function(list) { return encodeURIComponent(list.car); }

function truncate(x) {
  return x > 0 ? Math.floor(x) : Math.ceil(x);
}

TopEnv['ceiling'] = function(list) { return Math.ceil(list.car); }
TopEnv['floor'] = function(list) { return Math.floor(list.car); }
TopEnv['truncate'] = function(list) { return truncate(list.car); }
TopEnv['sqrt'] = function(list) { return Math.sqrt(list.car); }
TopEnv['exp'] = function(list) { return Math.exp(list.car); }
TopEnv['expt'] = function(list) { return Math.pow(list.car,list.cdr.car); }
TopEnv['log'] = function(list) { return Math.log(list.car); }
TopEnv['sin'] = function(list) { return Math.sin(list.car); }
TopEnv['cos'] = function(list) { return Math.cos(list.car); }
TopEnv['asin'] = function(list) { return Math.asin(list.car); }
TopEnv['acos'] = function(list) { return Math.acos(list.car); }
TopEnv['tan'] = function(list) { return Math.tan(list.car); }

TopEnv['atan'] = function(list) {
  return isNil(list.cdr) ? Math.atan(list.car)
                         : Math.atan2(list.car,list.cdr.car);
}

TopEnv['integer?'] = function(list) { return list.car == Math.round(list.car); }
TopEnv['quotient'] = function(list) { return truncate(list.car / list.cdr.car); }
TopEnv['remainder'] = function(list) { return list.car % list.cdr.car; }
TopEnv['modulo'] = function(list) {
  var v = list.car % list.cdr.car;
  if( v && (list.car < 0) != (list.cdr.car < 0) ) v += list.cdr.car;
  return v;
}
TopEnv['round'] = function(list) { return Math.round(list.car); }

TopEnv['apply'] = function(list,state) {
  var f = list.car, cur;
  for( cur = list; !isNil(cur.cdr.cdr); cur = cur.cdr );
  cur.cdr = cur.cdr.car;
  return callF( list.car, list.cdr, state );
}

TopEnv['clone'] = function(list,state) {
  return list.car.clone(state.env);
}

function isEq(a,b) { return a==b || isNil(a)&&isNil(b); }

TopEnv['string=?'] =
TopEnv['char=?'] =
TopEnv['eqv?'] =
TopEnv['='] =
TopEnv['eq?'] = function(list) { return isEq(list.car,list.cdr.car); }

TopEnv['substring'] = function(list) {
  return list.car.substring( list.cdr.car, list.cdr.cdr.car );
}

TopEnv['string>?'] =
TopEnv['>'] = function(list) { return list.car > list.cdr.car; }
TopEnv['string<?'] =
TopEnv['<'] = function(list) { return list.car < list.cdr.car; }
TopEnv['string>=?'] =
TopEnv['>='] = function(list) { return list.car >= list.cdr.car; }
TopEnv['string<=?'] =
TopEnv['<='] = function(list) { return list.car <= list.cdr.car; }

TopEnv['char>?'] = function(list) { return list.car.value > list.cdr.car.value; }
TopEnv['char<?'] = function(list) { return list.car.value < list.cdr.car.value; }
TopEnv['char>=?'] = function(list) { return list.car.value >= list.cdr.car.value; }
TopEnv['char<=?'] = function(list) { return list.car.value <= list.cdr.car.value; }

TopEnv['char-downcase'] = function(list) { return getChar(list.car.value.toLowerCase()); }
TopEnv['char-upcase'] = function(list) { return getChar(list.car.value.toUpperCase()); }
TopEnv['string-downcase'] = function(list) { return list.car.toLowerCase(); }
TopEnv['string-upcase'] = function(list) { return list.car.toUpperCase(); }

TopEnv['char->integer'] = function(list) { return list.car.value.charCodeAt(0); }
TopEnv['integer->char'] = function(list) {
  return getChar( String.fromCharCode(list.car) );
}

TopEnv['make-string'] = function(list) {
  var s = '', i;
  for( i = 0; i < list.car; i++ ) {
    s += list.cdr.car.value;
  }
  return s;
}
TopEnv['rnd'] = function(list) { return Math.random(); }
TopEnv['string->number'] = function(list) {
  return list.cdr.car ? parseInt(list.car,list.cdr.car) : parseFloat(list.car);
}
TopEnv['number->string'] = function(list) {
  return list.cdr.car ? list.car.toString(list.cdr.car) : ''+list.car;
}

TopEnv['set-car!'] = function(list) { list.car.car = list.cdr.car; return list.car; }
TopEnv['set-cdr!'] = function(list) { list.car.cdr = list.cdr.car; return list.car; }

TopEnv['vector-length'] =
TopEnv['string-length'] = function(list) { return list.car.length; }

TopEnv['string-ref'] = function(list) {
  return getChar(list.car.charAt(list.cdr.car));
}
TopEnv['get-prop'] =
TopEnv['vector-ref'] = function(list) { return list.car[list.cdr.car]; }
TopEnv['set-prop!'] =
TopEnv['vector-set!'] = function(list) { list.car[list.cdr.car] = list.cdr.cdr.car; }
TopEnv['make-vector'] = function(list) { var v = new Array(), i;
for( i=0; i<list.car; i++ ) v[i]=list.cdr.car; return v;
}

TopEnv['str'] = function(list) { return Str(list.car); }
TopEnv['html'] = function(list) { return Html(list.car); }

/* (alert "a message") */
TopEnv['alert'] = function(list) {
  alert(list.car);
}

/* (ajax-get url function) */
TopEnv['ajax-get'] = function(list) {
  $.get(list.car, function (xml) {
    doEval (new Pair(list.cdr.car, new Pair(new Pair(theQuote, new
    Pair(xml,theNil)), theNil)), true)
  })
}

/* (set-timeout! handler timeout) */
TopEnv['set-timeout!'] = function(list) {
  setTimeout(function () {
    doEval (new Pair(list.car, theNil), true);
  }, list.cdr.car)
}

/* (set-handler! object name handler) */
TopEnv['set-handler!'] = function(list) {
  list.car[list.cdr.car] = function() {
    doEval( new Pair( list.cdr.cdr.car,
            new Pair( new Pair( theQuote,
                      new Pair( this, theNil )), theNil)), true);
  }
}
TopEnv['list-props'] = function(list) {
  var r = theNil, i;
  for( i in list.car ) r = new Pair(i,r);
  return r;
}
TopEnv['parse'] = function(list) {
  var r = theNil, c = r, p = new Parser(list.car), o;
  while( (o = p.getObject()) != null ) {
    o = new Pair(o, theNil );
    if( r == theNil ) r = o; else c.cdr = o;
    c = o;
  }
  return r;
}
TopEnv['type-of'] = function(list) { return objType(list.car); }
TopEnv['js-call'] = function(list) {
  if( isNil( list.cdr ) ) {
    return list.car();
  } else if( isNil( list.cdr.cdr ) ) {
    return list.car( list.cdr.car );
  } else if( isNil( list.cdr.cdr.cdr ) ) {
    return list.car( list.cdr.car, list.cdr.cdr.car );
  } else {
    return list.car( list.cdr.car, list.cdr.cdr.car, list.cdr.cdr.cdr.car );
  }
}
TopEnv['js-invoke'] = function(list) {
  if( isNil( list.cdr.cdr ) ) {
    return list.car[list.cdr.car]();
  } else if( isNil( list.cdr.cdr.cdr ) ) {
    return list.car[list.cdr.car]( list.cdr.cdr.car );
  } else if( isNil( list.cdr.cdr.cdr.cdr ) ) {
    return list.car[list.cdr.car]( list.cdr.cdr.car, list.cdr.cdr.cdr.car );
  } else {
    return list.car[list.cdr.car]( list.cdr.cdr.car, list.cdr.cdr.cdr.car, list.cdr.cdr.cdr.cdr.car );
  }
}

function isPair(x) { return (x instanceof Pair) && !isNil(x); }
TopEnv['pair?'] = function(list) { return isPair(list.car); }

TopEnv['boolean?'] = function(list) { return typeof(list.car)=='boolean'; }
TopEnv['string?'] = function(list) { return typeof(list.car)=='string'; }
TopEnv['number?'] = function(list) { return typeof(list.car)=='number'; }
TopEnv['null?'] = function(list) { return isNil(list.car); }
TopEnv['symbol?'] = function(list) { return list.car instanceof Symbol; }
TopEnv['syntax?'] = function(list) { return list.car instanceof Syntax; }
TopEnv['char?'] = function(list) { return list.car instanceof Char; }
TopEnv['vector?'] = function(list) { return list.car instanceof Array; }
TopEnv['procedure?'] = function(list) {
  return list.car instanceof Function ||
         list.car instanceof Lambda ||
         list.car instanceof Continuation;
}
TopEnv['lambda?'] = function(list) { return list.car instanceof Lambda; }
TopEnv['function?'] = function(list) { return list.car instanceof Function; }
TopEnv['continuation?'] = function(list) { return list.car instanceof Continuation; }

TopEnv['js-eval'] = function(list) { return eval(list.car); }

// changed by MH
// error can take multiple arguments
TopEnv['error'] = function(list) { 
    var out_string = list.car;
    list = list.cdr;
    while (list.car != undefined) {
	out_string = out_string + " "+list.car.Str();
	list = list.cdr;
    }
    throw new Ex(out_string); 
}

TopEnv['trace'] = function(list) { trace = list.car.valueOf(); }
// changed by MH 19/6/2008
// TopEnv['read'] = function(list) { return TopParser.getObject(); }
TopEnv['read'] = function(list) { 
    var default_string = (window.scheme_statement != undefined) ? scheme_statement : '';
    var prompt_result = prompt('Enter Scheme expression',default_string);
    if (prompt_result != null) {
	return new Parser(prompt_result).getObject();
    }
    else return theNil;
}
TopEnv['write'] = function(list) { return; }
TopEnv['newline'] = function(list) { return; }
TopEnv['write-char'] =
TopEnv['display'] = function(list) {
    return;
}
TopEnv['nil'] = theNil;

TopEnv['eof-object?'] =
TopEnv['js-null?'] = function(list) { return list.car == null; }

theCallCC =
TopEnv['call-with-current-continuation'] = function(list,state) {
  state.ready = false;
  return callF( list.car, new Pair( state.cc.clone(), theNil ), state );
}

var genSymBase = 0;
TopEnv['gen-sym'] = function() { return getSymbol('_'+(genSymBase++)+'_'); }

// added by MH on 14/6/2008

// do not use toplevel name "display"; it is pre-defined in JavaScript
window.__display = function(list) {
    var toShow = ( typeof list.car == "string" ) ? list.car : list.car.Str();
    window[theText] = window[theText] + toShow;
    document['form_'+theText].resultScheme.value = window[theText];
    document['form_'+theText].resultScheme.scrollTop 
	    = document['form_'+theText].resultScheme.scrollHeight;
    return getSymbol('ok');
}

TopEnv['display'] = window.__display;

TopEnv['newline'] = function(list) { 
    return window.__display({car:"\n"});
}

TopEnv['runtime'] = function(list) { 
    var d = new Date();
    return d.getTime();
}

//
// Read-Eval-Print-Loop
//

function schemeEval(txt) {
    var o, res = null;
    TopParser = new Parser( txt );
    while( ( o = TopParser.getObject() ) != null ) {
	o = doEval( o );
	if( o != null ) res = o;
    }
    return res.Str();
}

// Need to wrap alert as calling it from Scheme
// in Firefox otherwise doesn't work
function jsAlert(text) {
  alert(text)
}

// Need to wrap settimeout as calling it from Scheme
// in Firefox otherwise doesn't work
function jsSetTimeout(f,t) {
  setTimeout(f,t)
}

function schemeInit() {

// Library begin

/*
  var o, p = new Parser( document.getElementById('lib').innerHTML );
  while( (o = p.getObject()) != null ) {
    doEval(o);
  }
*/

var e=TopEnv;
e['call/cc']=e.get('call-with-current-continuation');
e['list']=new Lambda(getSymbol('x'),getSymbol('x'),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list;r=e['x'];if(r!=theTC||r.f!=this)return r}});
e['not']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('if'),new Pair(getSymbol('x'),new Pair(false,new Pair(true,theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=((e['x'])!=false?false:true);if(r!=theTC||r.f!=this)return r}});
e['negative?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('<'),new Pair(getSymbol('x'),new Pair(0,theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x']<0;if(r!=theTC||r.f!=this)return r}});
e['positive?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('>'),new Pair(getSymbol('x'),new Pair(0,theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x']>0;if(r!=theTC||r.f!=this)return r}});
e['even?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('='),new Pair(new Pair(getSymbol('remainder'),new Pair(getSymbol('x'),new Pair(2,theNil))),new Pair(0,theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=isEq(Apply(TopEnv.get('remainder'),new Pair(e['x'],new Pair(2,theNil))),0);if(r!=theTC||r.f!=this)return r}});
e['odd?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('even?'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=(Apply(TopEnv.get('even?'),new Pair(e['x'],theNil))==false);if(r!=theTC||r.f!=this)return r}});
e['zero?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('='),new Pair(getSymbol('x'),new Pair(0,theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=isEq(e['x'],0);if(r!=theTC||r.f!=this)return r}});
e['abs']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('x'),new Pair(0,theNil))),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('x'),theNil)),new Pair(getSymbol('x'),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=((e['x']<0)!=false?(-e['x']):e['x']);if(r!=theTC||r.f!=this)return r}});
e['magnitude']=e.get('abs');
e['exact?']=e.get('integer?');
e['inexact?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('exact?'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=(Apply(TopEnv.get('exact?'),new Pair(e['x'],theNil))==false);if(r!=theTC||r.f!=this)return r}});
e['random']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('floor'),new Pair(new Pair(getSymbol('*'),new Pair(new Pair(getSymbol('rnd'),theNil),new Pair(getSymbol('x'),theNil))),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=TC(TopEnv.get('floor'),list=new Pair((Apply(TopEnv.get('rnd'),theNil)*e['x']),theNil));if(r!=theTC||r.f!=this)return r}});
e['char-ci=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('char=?'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=isEq(Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)),Apply(TopEnv.get('char-downcase'),new Pair(e['y'],theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-ci>?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('char>?'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('char>?'),list=new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-ci<?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('char<?'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('char<?'),list=new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-ci>=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('char>=?'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('char>=?'),list=new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-ci<=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('char<=?'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('char<=?'),list=new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('char-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-lower-case?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('char=?'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('char-downcase'),new Pair(getSymbol('x'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=isEq(e['x'],Apply(TopEnv.get('char-downcase'),new Pair(e['x'],theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-upper-case?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('char=?'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('char-upcase'),new Pair(getSymbol('x'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=isEq(e['x'],Apply(TopEnv.get('char-upcase'),new Pair(e['x'],theNil)));if(r!=theTC||r.f!=this)return r}});
e['char-alphabetic?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('char-ci>=?'),new Pair(getSymbol('x'),new Pair(getChar('a'),theNil))),new Pair(new Pair(getSymbol('char-ci<=?'),new Pair(getSymbol('x'),new Pair(getChar('z'),theNil))),new Pair(false,theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=((Apply(TopEnv.get('char-ci>=?'),new Pair(e['x'],new Pair(getChar('a'),theNil))))!=false?TC(TopEnv.get('char-ci<=?'),list=new Pair(e['x'],new Pair(getChar('z'),theNil))):false);if(r!=theTC||r.f!=this)return r}});
e['char-numeric?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('char>=?'),new Pair(getSymbol('x'),new Pair(getChar('0'),theNil))),new Pair(new Pair(getSymbol('char<=?'),new Pair(getSymbol('x'),new Pair(getChar('9'),theNil))),new Pair(false,theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=((Apply(TopEnv.get('char>=?'),new Pair(e['x'],new Pair(getChar('0'),theNil))))!=false?TC(TopEnv.get('char<=?'),list=new Pair(e['x'],new Pair(getChar('9'),theNil))):false);if(r!=theTC||r.f!=this)return r}});
e['char-whitespace?']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('char<=?'),new Pair(getSymbol('x'),new Pair(getChar(' '),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=TC(TopEnv.get('char<=?'),list=new Pair(e['x'],new Pair(getChar(' '),theNil)));if(r!=theTC||r.f!=this)return r}});
e['string-ci=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('string=?'),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=isEq(Apply(TopEnv.get('string-downcase'),new Pair(e['x'],theNil)),Apply(TopEnv.get('string-downcase'),new Pair(e['y'],theNil)));if(r!=theTC||r.f!=this)return r}});
e['string-ci>?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('string>?'),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('string>?'),list=new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['string-ci<?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('string<?'),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('string<?'),list=new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['string-ci>=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('string>=?'),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('string>=?'),list=new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['string-ci<=?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('string<=?'),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('string-downcase'),new Pair(getSymbol('y'),theNil)),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(TopEnv.get('string<=?'),list=new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['x'],theNil)),new Pair(Apply(TopEnv.get('string-downcase'),new Pair(e['y'],theNil)),theNil)));if(r!=theTC||r.f!=this)return r}});
e['map']=new Lambda(new Pair(getSymbol('f'),new Pair(getSymbol('ls'),getSymbol('more'))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('map1'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_8_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('map-more'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_9_'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('more'),theNil)),new Pair(new Pair(getSymbol('map1'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('map-more'),new Pair(getSymbol('ls'),new Pair(getSymbol('more'),theNil))),theNil)))),theNil)))),new Env(e).With('_8_',new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('f'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)),new Pair(new Pair(getSymbol('map1'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('f'),new Pair(getSymbol('l'),theNil)),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(((e['l']==theNil))!=false?theNil:((((e['l'])instanceof Pair))!=false?new Pair(Apply(e.parentEnv['f'],new Pair(e['l'].car,theNil)),Apply(e.parentEnv['map1'],new Pair(e['l'].cdr,theNil))):TC(e.parentEnv['f'],list=new Pair(e['l'],theNil))));if(r!=theTC||r.f!=this)return r}})).With('_9_',new Lambda(new Pair(getSymbol('l'),new Pair(getSymbol('m'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('map'),new Pair(getSymbol('car'),new Pair(getSymbol('m'),theNil))),theNil)))),new Pair(new Pair(getSymbol('map-more'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('map'),new Pair(getSymbol('cdr'),new Pair(getSymbol('m'),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(getSymbol('l'),new Pair(getSymbol('m'),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;e['m']=list.cdr.car;r=(((e['l']==theNil))!=false?theNil:((((e['l'])instanceof Pair))!=false?new Pair(Apply(e.parentEnv['f'],new Pair(e['l'].car,Apply(TopEnv.get('map'),new Pair(TopEnv.get('car'),new Pair(e['m'],theNil))).ListCopy())),Apply(e.parentEnv['map-more'],new Pair(e['l'].cdr,new Pair(Apply(TopEnv.get('map'),new Pair(TopEnv.get('cdr'),new Pair(e['m'],theNil))),theNil)))):TC(e.parentEnv['f'],list=new Pair(e['l'],e['m'].ListCopy()))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['f']=list.car;e['ls']=list.cdr.car;e['more']=list.cdr.cdr;r=(e['map1']=e.parentEnv['_8_'].clone(e),e['map-more']=e.parentEnv['_9_'].clone(e),(((e['more']==theNil))!=false?TC(e['map1'],list=new Pair(e['ls'],theNil)):TC(e['map-more'],list=new Pair(e['ls'],new Pair(e['more'],theNil)))));if(r!=theTC||r.f!=this)return r}});
e['map+']=new Lambda(new Pair(getSymbol('f'),getSymbol('lst')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('r'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('o'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('p'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('map-lst'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_10_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('do-map'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_11_'),theNil)),theNil))),new Pair(new Pair(getSymbol('do-map'),theNil),new Pair(getSymbol('r'),theNil)))))))),new Env(e).With('_10_',new Lambda(new Pair(getSymbol('op'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)),new Pair(new Pair(getSymbol('map-lst'),new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil))),theNil))),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['op']=list.car;e['l']=list.cdr.car;r=((((e['l'])instanceof Pair))!=false?new Pair(Apply(e['op'],new Pair(e['l'].car,theNil)),Apply(e.parentEnv['map-lst'],new Pair(e['op'],new Pair(e['l'].cdr,theNil)))):theNil);if(r!=theTC||r.f!=this)return r}})).With('_11_',new Lambda(theNil,new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('o'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(new Pair(getSymbol('map'),new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil))),theNil))),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('r'),theNil)),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('r'),new Pair(getSymbol('o'),theNil))),new Pair(new Pair(getSymbol('set-cdr!'),new Pair(getSymbol('p'),new Pair(getSymbol('o'),theNil))),theNil)))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('p'),new Pair(getSymbol('o'),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('lst'),new Pair(new Pair(getSymbol('map'),new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil))),theNil))),new Pair(new Pair(getSymbol('do-map'),theNil),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('p'),new Pair(new Pair(getSymbol('set-cdr!'),new Pair(getSymbol('p'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(getSymbol('lst'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('r'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(getSymbol('lst'),theNil))),theNil))),theNil)))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){r=((((e.parentEnv['lst'].car)instanceof Pair))!=false?(e.set('o',new Pair(Apply(e.parentEnv['f'],Apply(TopEnv.get('map'),new Pair(TopEnv.get('car'),new Pair(e.parentEnv['lst'],theNil))).ListCopy()),theNil)),(((e.parentEnv['r']==theNil))!=false?e.set('r',e.parentEnv['o']):Apply(TopEnv.get('set-cdr!'),new Pair(e.parentEnv['p'],new Pair(e.parentEnv['o'],theNil)))),e.set('p',e.parentEnv['o']),e.set('lst',Apply(TopEnv.get('map'),new Pair(TopEnv.get('cdr'),new Pair(e.parentEnv['lst'],theNil)))),TC(e.parentEnv['do-map'],list=theNil)):((((e.parentEnv['lst'].car==theNil)==false))!=false?((e.parentEnv['p'])!=false?TC(TopEnv.get('set-cdr!'),list=new Pair(e.parentEnv['p'],new Pair(Apply(e.parentEnv['f'],e.parentEnv['lst'].ListCopy()),theNil))):e.set('r',Apply(e.parentEnv['f'],e.parentEnv['lst'].ListCopy()))):null));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['f']=list.car;e['lst']=list.cdr;r=(e['r']=theNil,e['o']=false,e['p']=false,e['map-lst']=e.parentEnv['_10_'].clone(e),e['do-map']=e.parentEnv['_11_'].clone(e),Apply(e['do-map'],theNil),e['r']);if(r!=theTC||r.f!=this)return r}});
e['caar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.car;if(r!=theTC||r.f!=this)return r}});
e['cadr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.car;if(r!=theTC||r.f!=this)return r}});
e['cdar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.cdr;if(r!=theTC||r.f!=this)return r}});
e['cddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr;if(r!=theTC||r.f!=this)return r}});
e['caaar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.car.car;if(r!=theTC||r.f!=this)return r}});
e['caadr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.car.car;if(r!=theTC||r.f!=this)return r}});
e['cadar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.cdr.car;if(r!=theTC||r.f!=this)return r}});
e['caddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.car;if(r!=theTC||r.f!=this)return r}});
e['cdaar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.car.cdr;if(r!=theTC||r.f!=this)return r}});
e['cdadr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.car.cdr;if(r!=theTC||r.f!=this)return r}});
e['cddar']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].car.cdr.cdr;if(r!=theTC||r.f!=this)return r}});
e['cdddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.cdr;if(r!=theTC||r.f!=this)return r}});
e['caaddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.car.car;if(r!=theTC||r.f!=this)return r}});
e['cadddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.cdr.car;if(r!=theTC||r.f!=this)return r}});
e['cdaddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.car.cdr;if(r!=theTC||r.f!=this)return r}});
e['cddddr']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'].cdr.cdr.cdr.cdr;if(r!=theTC||r.f!=this)return r}});
e['length']=new Lambda(new Pair(getSymbol('lst'),getSymbol('x')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('x'),theNil)),new Pair(0,new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('length'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('l'),new Pair(1,theNil))),theNil))),new Pair(getSymbol('l'),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['x']=list.cdr;r=(e['l']=(((e['x']==theNil))!=false?0:e['x'].car),((((e['lst'])instanceof Pair))!=false?TC(TopEnv.get('length'),list=new Pair(e['lst'].cdr,new Pair((e['l']+1),theNil))):e['l']));if(r!=theTC||r.f!=this)return r}});
e['length+']=new Lambda(new Pair(getSymbol('lst'),getSymbol('x')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('x'),theNil)),new Pair(0,new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('length+'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('l'),new Pair(1,theNil))),theNil))),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('l'),new Pair(1,theNil))),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['x']=list.cdr;r=(e['l']=(((e['x']==theNil))!=false?0:e['x'].car),(((e['lst']==theNil))!=false?e['l']:((((e['lst'])instanceof Pair))!=false?TC(TopEnv.get('length+'),list=new Pair(e['lst'].cdr,new Pair((e['l']+1),theNil))):(e['l']+1))));if(r!=theTC||r.f!=this)return r}});
e['list-ref']=new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('n'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('n'),new Pair(0,theNil))),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('list-ref'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('n'),new Pair(1,theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['n']=list.cdr.car;r=((isEq(e['n'],0))!=false?e['lst'].car:TC(TopEnv.get('list-ref'),list=new Pair(e['lst'].cdr,new Pair((e['n']-1),theNil))));if(r!=theTC||r.f!=this)return r}});
e['list-tail']=new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('n'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('n'),new Pair(0,theNil))),new Pair(getSymbol('lst'),new Pair(new Pair(getSymbol('list-tail'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('n'),new Pair(1,theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['n']=list.cdr.car;r=((isEq(e['n'],0))!=false?e['lst']:TC(TopEnv.get('list-tail'),list=new Pair(e['lst'].cdr,new Pair((e['n']-1),theNil))));if(r!=theTC||r.f!=this)return r}});
e['reverse']=new Lambda(new Pair(getSymbol('lst'),getSymbol('l2')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('r'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l2'),theNil)),new Pair(getSymbol('l2'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l2'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('r'),new Pair(new Pair(getSymbol('reverse'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('r'),theNil))),theNil))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['l2']=list.cdr;r=(e['r']=(((e['l2']==theNil))!=false?e['l2']:e['l2'].car),(((e['lst']==theNil))!=false?e['r']:TC(TopEnv.get('reverse'),list=new Pair(e['lst'].cdr,new Pair(new Pair(e['lst'].car,e['r']),theNil)))));if(r!=theTC||r.f!=this)return r}});
e['append']=new Lambda(new Pair(getSymbol('l1'),getSymbol('more')),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('more'),theNil)),new Pair(getSymbol('l1'),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('l2'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('more'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('m2'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('more'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l1'),theNil)),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('append'),new Pair(getSymbol('l2'),new Pair(getSymbol('m2'),theNil)))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l1'),theNil)),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('append'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l1'),theNil)),new Pair(getSymbol('l2'),new Pair(getSymbol('m2'),theNil))))),theNil))),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['l1']=list.car;e['more']=list.cdr;r=(((e['more']==theNil))!=false?e['l1']:(e['l2']=e['more'].car,e['m2']=e['more'].cdr,(((e['l1']==theNil))!=false?TC(TopEnv.get('append'),list=new Pair(e['l2'],e['m2'].ListCopy())):new Pair(e['l1'].car,Apply(TopEnv.get('append'),new Pair(e['l1'].cdr,new Pair(e['l2'],e['m2'].ListCopy())))))));if(r!=theTC||r.f!=this)return r}});
e['sort']=false;
e['merge']=false;
Apply(new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('dosort'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_12_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('domerge'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_13_'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('sort'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_14_'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('merge'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_15_'),theNil)),theNil))),theNil))))),new Env(e).With('_12_',new Lambda(new Pair(getSymbol('pred?'),new Pair(getSymbol('ls'),new Pair(getSymbol('n'),theNil))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('n'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('n'),new Pair(2,theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('y'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ls'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pred?'),new Pair(getSymbol('y'),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('list'),new Pair(getSymbol('y'),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('list'),new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('i'),new Pair(new Pair(getSymbol('quotient'),new Pair(getSymbol('n'),new Pair(2,theNil))),theNil))),new Pair(new Pair(getSymbol('domerge'),new Pair(getSymbol('pred?'),new Pair(new Pair(getSymbol('dosort'),new Pair(getSymbol('pred?'),new Pair(getSymbol('ls'),new Pair(getSymbol('i'),theNil)))),new Pair(new Pair(getSymbol('dosort'),new Pair(getSymbol('pred?'),new Pair(new Pair(getSymbol('list-tail'),new Pair(getSymbol('ls'),new Pair(getSymbol('i'),theNil))),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('n'),new Pair(getSymbol('i'),theNil))),theNil)))),theNil)))),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['pred?']=list.car;e['ls']=list.cdr.car;e['n']=list.cdr.cdr.car;r=((isEq(e['n'],1))!=false?new Pair(e['ls'].car,theNil):((isEq(e['n'],2))!=false?(e['x']=e['ls'].car,e['y']=e['ls'].cdr.car,((Apply(e['pred?'],new Pair(e['y'],new Pair(e['x'],theNil))))!=false?new Pair(e['y'],new Pair(e['x'],theNil)):new Pair(e['x'],new Pair(e['y'],theNil)))):(e['i']=Apply(TopEnv.get('quotient'),new Pair(e['n'],new Pair(2,theNil))),TC(e.parentEnv['domerge'],list=new Pair(e['pred?'],new Pair(Apply(e.parentEnv['dosort'],new Pair(e['pred?'],new Pair(e['ls'],new Pair(e['i'],theNil)))),new Pair(Apply(e.parentEnv['dosort'],new Pair(e['pred?'],new Pair(Apply(TopEnv.get('list-tail'),new Pair(e['ls'],new Pair(e['i'],theNil))),new Pair((e['n']-e['i']),theNil)))),theNil)))))));if(r!=theTC||r.f!=this)return r}})).With('_13_',new Lambda(new Pair(getSymbol('pred?'),new Pair(getSymbol('l1'),new Pair(getSymbol('l2'),theNil))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l1'),theNil)),new Pair(getSymbol('l2'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l2'),theNil)),new Pair(getSymbol('l1'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pred?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l2'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l1'),theNil)),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l2'),theNil)),new Pair(new Pair(getSymbol('domerge'),new Pair(getSymbol('pred?'),new Pair(getSymbol('l1'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l2'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l1'),theNil)),new Pair(new Pair(getSymbol('domerge'),new Pair(getSymbol('pred?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l1'),theNil)),new Pair(getSymbol('l2'),theNil)))),theNil))),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['pred?']=list.car;e['l1']=list.cdr.car;e['l2']=list.cdr.cdr.car;r=(((e['l1']==theNil))!=false?e['l2']:(((e['l2']==theNil))!=false?e['l1']:((Apply(e['pred?'],new Pair(e['l2'].car,new Pair(e['l1'].car,theNil))))!=false?new Pair(e['l2'].car,Apply(e.parentEnv['domerge'],new Pair(e['pred?'],new Pair(e['l1'],new Pair(e['l2'].cdr,theNil))))):new Pair(e['l1'].car,Apply(e.parentEnv['domerge'],new Pair(e['pred?'],new Pair(e['l1'].cdr,new Pair(e['l2'],theNil))))))));if(r!=theTC||r.f!=this)return r}})).With('_14_',new Lambda(new Pair(getSymbol('pred?'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('dosort'),new Pair(getSymbol('pred?'),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('length'),new Pair(getSymbol('l'),theNil)),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['pred?']=list.car;e['l']=list.cdr.car;r=(((e['l']==theNil))!=false?e['l']:TC(e.parentEnv['dosort'],list=new Pair(e['pred?'],new Pair(e['l'],new Pair(Apply(TopEnv.get('length'),new Pair(e['l'],theNil)),theNil)))));if(r!=theTC||r.f!=this)return r}})).With('_15_',new Lambda(new Pair(getSymbol('pred?'),new Pair(getSymbol('l1'),new Pair(getSymbol('l2'),theNil))),new Pair(getSymbol('domerge'),new Pair(getSymbol('pred?'),new Pair(getSymbol('l1'),new Pair(getSymbol('l2'),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['pred?']=list.car;e['l1']=list.cdr.car;e['l2']=list.cdr.cdr.car;r=TC(e.parentEnv['domerge'],list=new Pair(e['pred?'],new Pair(e['l1'],new Pair(e['l2'],theNil))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(e['dosort']=e.parentEnv['_12_'].clone(e),e['domerge']=e.parentEnv['_13_'].clone(e),e.set('sort',e.parentEnv['_14_'].clone(e)),e.set('merge',e.parentEnv['_15_'].clone(e)));if(r!=theTC||r.f!=this)return r}}),theNil);
e['iota']=new Lambda(new Pair(getSymbol('count'),getSymbol('x')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('start'),new Pair(0,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('step'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('start'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('step'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('x'),theNil)),theNil))),theNil)),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('do-step'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_16_'),theNil)),theNil))),new Pair(new Pair(getSymbol('do-step'),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('count'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),theNil)))))),new Env(e).With('_16_',new Lambda(new Pair(getSymbol('cnt'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('cnt'),new Pair(0,theNil))),new Pair(getSymbol('lst'),new Pair(new Pair(getSymbol('do-step'),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('cnt'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('+'),new Pair(new Pair(getSymbol('*'),new Pair(getSymbol('step'),new Pair(getSymbol('cnt'),theNil))),new Pair(getSymbol('start'),theNil))),new Pair(getSymbol('lst'),theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['cnt']=list.car;e['lst']=list.cdr.car;r=((e['cnt']<0)!=false?e['lst']:TC(e.parentEnv['do-step'],list=new Pair((e['cnt']-1),new Pair(new Pair(((e.parentEnv['step']*e['cnt'])+e.parentEnv['start']),e['lst']),theNil))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['count']=list.car;e['x']=list.cdr;r=(e['start']=0,e['step']=1,((((e['x']==theNil)==false))!=false?(e['start']=e['x'].car,((((e['x'].cdr==theNil)==false))!=false?e['step']=e['x'].cdr.car:null)):null),e['do-step']=e.parentEnv['_16_'].clone(e),TC(e['do-step'],list=new Pair((e['count']-1),new Pair(theNil,theNil))));if(r!=theTC||r.f!=this)return r}});
e['list->string']=new Lambda(new Pair(getSymbol('lst'),theNil),new Pair(getSymbol('apply'),new Pair(getSymbol('string'),new Pair(getSymbol('lst'),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;r=TC(TopEnv.get('string'),list=e['lst'].ListCopy());if(r!=theTC||r.f!=this)return r}});
e['gcd']=new Lambda(new Pair(getSymbol('a'),new Pair(getSymbol('b'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('b'),new Pair(0,theNil))),new Pair(getSymbol('a'),new Pair(new Pair(getSymbol('gcd'),new Pair(getSymbol('b'),new Pair(new Pair(getSymbol('remainder'),new Pair(getSymbol('a'),new Pair(getSymbol('b'),theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['a']=list.car;e['b']=list.cdr.car;r=((isEq(e['b'],0))!=false?e['a']:TC(TopEnv.get('gcd'),list=new Pair(e['b'],new Pair(Apply(TopEnv.get('remainder'),new Pair(e['a'],new Pair(e['b'],theNil))),theNil))));if(r!=theTC||r.f!=this)return r}});
e['lcm']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('/'),new Pair(new Pair(getSymbol('*'),new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil))),new Pair(new Pair(getSymbol('gcd'),new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=((e['x']*e['y'])/Apply(TopEnv.get('gcd'),new Pair(e['x'],new Pair(e['y'],theNil))));if(r!=theTC||r.f!=this)return r}});
e['max']=new Lambda(new Pair(getSymbol('x'),getSymbol('l')),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('max'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('>'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil))),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)))),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['l']=list.cdr;r=(((e['l']==theNil))!=false?e['x']:TC(TopEnv.get('max'),list=new Pair(((e['x']>e['l'].car)!=false?e['x']:e['l'].car),e['l'].cdr.ListCopy())));if(r!=theTC||r.f!=this)return r}});
e['min']=new Lambda(new Pair(getSymbol('x'),getSymbol('l')),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('max'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil))),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)))),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['l']=list.cdr;r=(((e['l']==theNil))!=false?e['x']:TC(TopEnv.get('max'),list=new Pair(((e['x']<e['l'].car)!=false?e['x']:e['l'].car),e['l'].cdr.ListCopy())));if(r!=theTC||r.f!=this)return r}});
e['syntax-quasiquote']=Apply(new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_17_'),theNil)),theNil))),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_18_'),theNil)),theNil))),new Env(e).With('_17_',new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('unquote'),theNil)),theNil))),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('unquote-splicing'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(new Pair(getSymbol('cadar'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('append'),theNil)),new Pair(new Pair(getSymbol('cadar'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('list'),theNil)),new Pair(new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cons'),theNil)),new Pair(new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),theNil)),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('quote'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(getSymbol('x'),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=((((e['x'])instanceof Pair))!=false?(((e['x']==theNil))!=false?new Pair(getSymbol('quote'),new Pair(theNil,theNil)):((isEq(e['x'].car,getSymbol('unquote')))!=false?e['x'].cdr.car:((((((e['x'].car)instanceof Pair))!=false?isEq(e['x'].car.car,getSymbol('unquote-splicing')):false))!=false?(((e['x'].cdr==theNil))!=false?TC(TopEnv.get('cadar'),list=new Pair(e['x'],theNil)):new Pair(getSymbol('append'),new Pair(Apply(TopEnv.get('cadar'),new Pair(e['x'],theNil)),new Pair(Apply(e.parentEnv['ql'],new Pair(e['x'].cdr,theNil)),theNil)))):(((e['x'].cdr==theNil))!=false?new Pair(getSymbol('list'),new Pair(Apply(e.parentEnv['ql'],new Pair(e['x'].car,theNil)),theNil)):new Pair(getSymbol('cons'),new Pair(Apply(e.parentEnv['ql'],new Pair(e['x'].car,theNil)),new Pair(Apply(e.parentEnv['ql'],new Pair(e['x'].cdr,theNil)),theNil))))))):((((e['x'])instanceof Symbol))!=false?new Pair(getSymbol('quote'),new Pair(e['x'],theNil)):e['x']));if(r!=theTC||r.f!=this)return r}})).With('_18_',new Lambda(new Pair(getSymbol('expr'),theNil),new Pair(getSymbol('ql'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('expr'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['expr']=list.car;r=TC(e.parentEnv['ql'],list=new Pair(e['expr'].cdr.car,theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(e['ql']=e.parentEnv['_17_'].clone(e),e.parentEnv['_18_'].clone(e));if(r!=theTC||r.f!=this)return r}}),theNil);
e['quasiquote']=new Syntax(e.get('syntax-quasiquote'),theNil);
e['f-and']=new Lambda(getSymbol('lst'),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f-and'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),theNil))),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list;r=(((e['lst']==theNil))!=false?true:((e['lst'].car)!=false?TC(TopEnv.get('f-and'),list=e['lst'].cdr.ListCopy()):false));if(r!=theTC||r.f!=this)return r}});
e['f-or']=new Lambda(getSymbol('lst'),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(true,new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f-or'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list;r=(((e['lst']==theNil))!=false?false:((e['lst'].car)!=false?true:TC(TopEnv.get('f-or'),list=e['lst'].cdr.ListCopy())));if(r!=theTC||r.f!=this)return r}});
e['syntax-rules']=new Lambda(new Pair(getSymbol('expr'),new Pair(getSymbol('literals'),new Pair(getSymbol('p1'),getSymbol('more')))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('match'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_19_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('match-many'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_20_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('find-all'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_21_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('p-each'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_22_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('process-many'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_23_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('gen-many'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_24_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ren'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_25_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_26_'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('match'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('expr'),theNil)),new Pair(new Pair(getSymbol('cdar'),new Pair(getSymbol('p1'),theNil)),theNil))),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('p1'),theNil)),new Pair(true,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('more'),theNil)),new Pair(new Pair(getSymbol('error'),new Pair(new Pair(getSymbol('string-append'),new Pair("no pattern matches ",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('expr'),theNil)),theNil)),theNil))),theNil)),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('syntax-rules'),new Pair(getSymbol('expr'),new Pair(getSymbol('literals'),new Pair(getSymbol('more'),theNil))))),theNil)))),theNil)))),theNil))))))))))),new Env(e).With('_19_',new Lambda(new Pair(getSymbol('ex'),new Pair(getSymbol('pat'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('pat'),new Pair(getSymbol('ex'),theNil))),new Pair(getSymbol('vars'),theNil))),theNil))),new Pair(true,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('...'),theNil)),theNil))),new Pair(new Pair(getSymbol('match-many'),new Pair(getSymbol('ex'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('memq+'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),new Pair(getSymbol('literals'),theNil))),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil))),new Pair(getSymbol('vars'),theNil))),theNil))),new Pair(true,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(true,new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),theNil)))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('match'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),theNil))),new Pair(new Pair(getSymbol('eqv?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('pat'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil)))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('match'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('pat'),theNil)),theNil))),new Pair(false,theNil)))),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['pat']=list.cdr.car;r=(((e['pat']==theNil))!=false?(e['ex']==theNil):((((e['pat'])instanceof Symbol))!=false?(e.set('vars',new Pair(new Pair(e['pat'],e['ex']),e.parentEnv['vars'])),true):((isEq(e['pat'].cdr.car,getSymbol('...')))!=false?TC(e.parentEnv['match-many'],list=new Pair(e['ex'],new Pair(e['pat'].car,theNil))):(((((e['ex']==theNil))!=false?false:((Apply(TopEnv.get('memq+'),new Pair(e['pat'].car,new Pair(e.parentEnv['literals'],theNil))))!=false?isEq(e['pat'].car,e['ex'].car):((((e['pat'].car)instanceof Symbol))!=false?(e.set('vars',new Pair(new Pair(e['pat'].car,e['ex'].car),e.parentEnv['vars'])),true):((((((e['pat'].car)instanceof Pair))!=false?(((e['ex'].car==theNil))!=false?true:((e['ex'].car)instanceof Pair)):false))!=false?Apply(e.parentEnv['match'],new Pair(e['ex'].car,new Pair(e['pat'].car,theNil))):isEq(e['pat'].car,e['ex'].car))))))!=false?TC(e.parentEnv['match'],list=new Pair(e['ex'].cdr,new Pair(e['pat'].cdr,theNil))):false))));if(r!=theTC||r.f!=this)return r}})).With('_20_',new Lambda(new Pair(getSymbol('ex'),new Pair(getSymbol('pat'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('match'),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('list'),new Pair(getSymbol('pat'),theNil)),theNil))),new Pair(new Pair(getSymbol('match-many'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('pat'),theNil))),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['pat']=list.cdr.car;r=(((e['ex']==theNil))!=false?true:((Apply(e.parentEnv['match'],new Pair(new Pair(e['ex'].car,theNil),new Pair(new Pair(e['pat'],theNil),theNil))))!=false?TC(e.parentEnv['match-many'],list=new Pair(e['ex'].cdr,new Pair(e['pat'],theNil))):false));if(r!=theTC||r.f!=this)return r}})).With('_21_',new Lambda(new Pair(getSymbol('var'),new Pair(getSymbol('lst'),new Pair(getSymbol('out'),theNil))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('out'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('var'),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('lst'),theNil)),theNil))),new Pair(new Pair(getSymbol('find-all'),new Pair(getSymbol('var'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cdar'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('out'),theNil))),theNil)))),new Pair(new Pair(getSymbol('find-all'),new Pair(getSymbol('var'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('out'),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['var']=list.car;e['lst']=list.cdr.car;e['out']=list.cdr.cdr.car;r=(((e['lst']==theNil))!=false?e['out']:((isEq(e['var'],e['lst'].car.car))!=false?TC(e.parentEnv['find-all'],list=new Pair(e['var'],new Pair(e['lst'].cdr,new Pair(new Pair(e['lst'].car.cdr,e['out']),theNil)))):TC(e.parentEnv['find-all'],list=new Pair(e['var'],new Pair(e['lst'].cdr,new Pair(e['out'],theNil))))));if(r!=theTC||r.f!=this)return r}})).With('_22_',new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('lst'),theNil)),theNil)))),new Pair(new Pair(getSymbol('p-each'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('templ'),theNil)),theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['templ']=list.cdr.car;r=(((e['lst']==theNil))!=false?theNil:new Pair((((e['lst'].car==theNil))!=false?e['templ'].car:e['lst'].car.car),Apply(e.parentEnv['p-each'],new Pair(e['lst'].cdr,new Pair(e['templ'].cdr,theNil)))));if(r!=theTC||r.f!=this)return r}})).With('_23_',new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('not-empty'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('l2'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_27_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ll'),new Pair(new Pair(getSymbol('l2'),new Pair(getSymbol('lst'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('not-empty'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('p-each'),new Pair(getSymbol('lst'),new Pair(getSymbol('templ'),theNil))),new Pair(new Pair(getSymbol('process-many'),new Pair(getSymbol('ll'),new Pair(getSymbol('templ'),theNil))),theNil))),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil)))),theNil))))),new Env(e).With('_27_',new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('a'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('a'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('not-empty'),new Pair(true,theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('a'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('a'),theNil)),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('a'),new Pair(new Pair(getSymbol('l2'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(((e['l']==theNil))!=false?theNil:(e['a']=e['l'].car,((((e['a']==theNil)==false))!=false?(e.set('not-empty',true),e['a']=e['a'].cdr):null),new Pair(e['a'],Apply(e.parentEnv['l2'],new Pair(e['l'].cdr,theNil)))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['templ']=list.cdr.car;r=(e['not-empty']=false,e['l2']=e.parentEnv['_27_'].clone(e),e['ll']=Apply(e['l2'],new Pair(e['lst'],theNil)),((e['not-empty'])!=false?new Pair(Apply(e.parentEnv.parentEnv['p-each'],new Pair(e['lst'],new Pair(e['templ'],theNil))),Apply(e.parentEnv.parentEnv['process-many'],new Pair(e['ll'],new Pair(e['templ'],theNil)))):theNil));if(r!=theTC||r.f!=this)return r}})).With('_24_',new Lambda(new Pair(getSymbol('templ'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('process-many'),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('gen-many'),new Pair(getSymbol('templ'),theNil))),new Pair(getSymbol('templ'),theNil))),new Pair(new Pair(getSymbol('find-all'),new Pair(getSymbol('templ'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil)))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['templ']=list.car;r=(((e['templ']==theNil))!=false?theNil:((((e['templ'])instanceof Pair))!=false?TC(e.parentEnv['process-many'],list=new Pair(Apply(TopEnv.get('map+'),new Pair(e.parentEnv['gen-many'],new Pair(e['templ'],theNil))),new Pair(e['templ'],theNil))):TC(e.parentEnv['find-all'],list=new Pair(e['templ'],new Pair(e.parentEnv['vars'],new Pair(theNil,theNil))))));if(r!=theTC||r.f!=this)return r}})).With('_25_',new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('new'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('...'),theNil)),theNil))),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('new'),new Pair(new Pair(getSymbol('gen-sym'),new Pair(getSymbol('x'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('x'),new Pair(getSymbol('new'),theNil))),new Pair(getSymbol('vars'),theNil))),theNil))),new Pair(getSymbol('new'),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=(e['new']=false,((isEq(e['x'],getSymbol('...')))!=false?e['x']:(e['new']=Apply(TopEnv.get('gen-sym'),new Pair(e['x'],theNil)),e.set('vars',new Pair(new Pair(e['x'],e['new']),e.parentEnv['vars'])),e['new'])));if(r!=theTC||r.f!=this)return r}})).With('_26_',new Lambda(new Pair(getSymbol('templ'),new Pair(getSymbol('no...'),theNil)),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('old-vars'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('args'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('body'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('new'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('x'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('no...'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('...'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('append'),new Pair(new Pair(getSymbol('gen-many'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('templ'),theNil)),theNil)),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('no...'),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('no...'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('lambda'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('old-vars'),new Pair(getSymbol('vars'),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('args'),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('no...'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('body'),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('no...'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('vars'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('new'),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('ren'),new Pair(getSymbol('args'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('new'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('templ'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('new'),new Pair(new Pair(getSymbol('gen'),new Pair(getSymbol('body'),new Pair(false,theNil))),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('vars'),new Pair(getSymbol('old-vars'),theNil))),new Pair(getSymbol('new'),theNil))))))))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('no...'),theNil))),new Pair(new Pair(getSymbol('gen'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('templ'),theNil)),new Pair(getSymbol('no...'),theNil))),theNil))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('assq'),new Pair(getSymbol('templ'),new Pair(getSymbol('vars'),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),new Pair(getSymbol('templ'),theNil)))),theNil))),theNil)))),theNil)))),theNil))))))),e,function(list){var r,e=new Env(this.env);while(true){e['templ']=list.car;e['no...']=list.cdr.car;r=(e['old-vars']=false,e['args']=false,e['body']=false,e['new']=false,e['x']=false,(((e['templ']==theNil))!=false?theNil:((((e['templ'])instanceof Pair))!=false?((((e['no...'])!=false?isEq(e['templ'].cdr.car,getSymbol('...')):false))!=false?TC(TopEnv.get('append'),list=new Pair(Apply(e.parentEnv['gen-many'],new Pair(e['templ'].car,theNil)),new Pair(Apply(e.parentEnv['gen'],new Pair(e['templ'].cdr.cdr,new Pair(e['no...'],theNil))),theNil))):((((e['no...'])!=false?isEq(e['templ'].car,getSymbol('lambda')):false))!=false?(e['old-vars']=e.parentEnv['vars'],e['args']=Apply(e.parentEnv['gen'],new Pair(e['templ'].cdr.car,new Pair(e['no...'],theNil))),e['body']=Apply(e.parentEnv['gen'],new Pair(e['templ'].cdr.cdr,new Pair(e['no...'],theNil))),e.set('vars',theNil),e['new']=Apply(TopEnv.get('map+'),new Pair(e.parentEnv['ren'],new Pair(e['args'],theNil))),e['new']=new Pair(e['templ'].car,new Pair(e['new'],Apply(e.parentEnv['gen'],new Pair(e['body'],new Pair(false,theNil))))),e.set('vars',e['old-vars']),e['new']):new Pair(Apply(e.parentEnv['gen'],new Pair(e['templ'].car,new Pair(e['no...'],theNil))),Apply(e.parentEnv['gen'],new Pair(e['templ'].cdr,new Pair(e['no...'],theNil)))))):(e['x']=Apply(TopEnv.get('assq'),new Pair(e['templ'],new Pair(e.parentEnv['vars'],theNil))),((e['x'])!=false?e['x'].cdr:e['templ'])))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['expr']=list.car;e['literals']=list.cdr.car;e['p1']=list.cdr.cdr.car;e['more']=list.cdr.cdr.cdr;r=(e['vars']=theNil,e['match']=e.parentEnv['_19_'].clone(e),e['match-many']=e.parentEnv['_20_'].clone(e),e['find-all']=e.parentEnv['_21_'].clone(e),e['p-each']=e.parentEnv['_22_'].clone(e),e['process-many']=e.parentEnv['_23_'].clone(e),e['gen-many']=e.parentEnv['_24_'].clone(e),e['ren']=e.parentEnv['_25_'].clone(e),e['gen']=e.parentEnv['_26_'].clone(e),((Apply(e['match'],new Pair(e['expr'].cdr,new Pair(e['p1'].car.cdr,theNil))))!=false?TC(e['gen'],list=new Pair(e['p1'].cdr.car,new Pair(true,theNil))):(((e['more']==theNil))!=false?TC(TopEnv.get('error'),list=new Pair(("no pattern matches "+e['expr'].car.name),theNil)):TC(TopEnv.get('syntax-rules'),list=new Pair(e['expr'],new Pair(e['literals'],e['more'].ListCopy()))))));if(r!=theTC||r.f!=this)return r}});
e['and']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),theNil),new Pair(true,theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('test'),theNil)),new Pair(getSymbol('test'),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('test1'),new Pair(getSymbol('test2'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('test1'),new Pair(new Pair(getSymbol('and'),new Pair(getSymbol('test2'),new Pair(getSymbol('...'),theNil))),new Pair(false,theNil)))),theNil)),theNil)))));
e['or']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),theNil),new Pair(false,theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('test'),theNil)),new Pair(getSymbol('test'),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('test1'),new Pair(getSymbol('test2'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('let'),new Pair(new Pair(new Pair(getSymbol('_tmp_'),new Pair(getSymbol('test1'),theNil)),theNil),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('_tmp_'),new Pair(getSymbol('_tmp_'),new Pair(new Pair(getSymbol('or'),new Pair(getSymbol('test2'),new Pair(getSymbol('...'),theNil))),theNil)))),theNil))),theNil)),theNil)))));
e['let']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(new Pair(getSymbol('name'),new Pair(getSymbol('val'),theNil)),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(new Pair(getSymbol('lambda'),new Pair(new Pair(getSymbol('name'),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),new Pair(getSymbol('val'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('tag'),new Pair(new Pair(new Pair(getSymbol('name'),new Pair(getSymbol('val'),theNil)),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil))))),new Pair(new Pair(new Pair(getSymbol('letrec'),new Pair(new Pair(new Pair(getSymbol('tag'),new Pair(new Pair(getSymbol('lambda'),new Pair(new Pair(getSymbol('name'),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),theNil)),theNil),new Pair(getSymbol('tag'),theNil))),new Pair(getSymbol('val'),new Pair(getSymbol('...'),theNil))),theNil)),theNil))));
e['cond']=new Syntax(e.get('syntax-rules'),new Pair(new Pair(getSymbol('else'),new Pair(getSymbol('=>'),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('else'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),new Pair(getSymbol('=>'),new Pair(getSymbol('result'),theNil))),theNil)),new Pair(new Pair(getSymbol('let'),new Pair(new Pair(new Pair(getSymbol('_tmp_'),new Pair(getSymbol('test'),theNil)),theNil),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('_tmp_'),new Pair(new Pair(getSymbol('result'),new Pair(getSymbol('_tmp_'),theNil)),theNil))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),new Pair(getSymbol('=>'),new Pair(getSymbol('result'),theNil))),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('let'),new Pair(new Pair(new Pair(getSymbol('_tmp_'),new Pair(getSymbol('test'),theNil)),theNil),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('_tmp_'),new Pair(new Pair(getSymbol('result'),new Pair(getSymbol('_tmp_'),theNil)),new Pair(new Pair(getSymbol('cond'),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil))),theNil)))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),theNil),theNil)),new Pair(getSymbol('test'),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),theNil),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('let'),new Pair(new Pair(new Pair(getSymbol('_tmp_'),new Pair(getSymbol('test'),theNil)),theNil),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('_tmp_'),new Pair(getSymbol('_tmp_'),new Pair(new Pair(getSymbol('cond'),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil))),theNil)))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('test'),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('test'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('test'),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),new Pair(new Pair(getSymbol('cond'),new Pair(getSymbol('clause1'),new Pair(getSymbol('...'),theNil))),theNil)))),theNil)),theNil)))))))));
e['let*']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(theNil,new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(new Pair(getSymbol('name1'),new Pair(getSymbol('val1'),theNil)),new Pair(new Pair(getSymbol('name2'),new Pair(getSymbol('val2'),theNil)),new Pair(getSymbol('...'),theNil))),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(new Pair(getSymbol('lambda'),new Pair(new Pair(getSymbol('name1'),theNil),new Pair(new Pair(getSymbol('let*'),new Pair(new Pair(new Pair(getSymbol('name2'),new Pair(getSymbol('val2'),theNil)),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body1'),new Pair(getSymbol('...'),theNil)))),theNil))),new Pair(getSymbol('val1'),theNil)),theNil)),theNil))));
e['letrec']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(new Pair(getSymbol('var1'),new Pair(getSymbol('init1'),theNil)),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('body'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(new Pair(getSymbol('lambda'),new Pair(theNil,new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('var1'),new Pair(false,theNil))),new Pair(getSymbol('...'),new Pair(new Pair(new Pair(getSymbol('lambda'),new Pair(getSymbol('_tmplst_'),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('var1'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('_tmplst_'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('_tmplst_'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('_tmplst_'),theNil)),theNil))),theNil))),new Pair(getSymbol('...'),theNil)))),new Pair(getSymbol('init1'),new Pair(getSymbol('...'),theNil))),new Pair(getSymbol('body'),new Pair(getSymbol('...'),theNil))))))),theNil),theNil)),theNil)));
e['let-syntax']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(new Pair(getSymbol('_var1_'),new Pair(getSymbol('_init1_'),theNil)),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('_body_'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(new Pair(getSymbol('lambda'),new Pair(theNil,new Pair(new Pair(getSymbol('define-syntax'),new Pair(getSymbol('_var1_'),new Pair(getSymbol('_init1_'),theNil))),new Pair(getSymbol('...'),new Pair(getSymbol('_body_'),new Pair(getSymbol('...'),theNil)))))),theNil),theNil)),theNil)));
e['letrec-syntax']=e.get('let-syntax');
e['case']=new Syntax(e.get('syntax-rules'),new Pair(new Pair(getSymbol('else'),theNil),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(getSymbol('key'),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('clauses'),new Pair(getSymbol('...'),theNil)))),new Pair(new Pair(getSymbol('let'),new Pair(new Pair(new Pair(getSymbol('_tmp_'),new Pair(new Pair(getSymbol('key'),new Pair(getSymbol('...'),theNil)),theNil)),theNil),new Pair(new Pair(getSymbol('case'),new Pair(getSymbol('_tmp_'),new Pair(getSymbol('clauses'),new Pair(getSymbol('...'),theNil)))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('key'),new Pair(new Pair(getSymbol('else'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('key'),new Pair(new Pair(new Pair(getSymbol('atoms'),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('memv'),new Pair(getSymbol('key'),new Pair(new Pair(getSymbol('quote'),new Pair(new Pair(getSymbol('atoms'),new Pair(getSymbol('...'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('key'),new Pair(new Pair(new Pair(getSymbol('atoms'),new Pair(getSymbol('...'),theNil)),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),new Pair(getSymbol('clause'),new Pair(getSymbol('...'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('memv'),new Pair(getSymbol('key'),new Pair(new Pair(getSymbol('quote'),new Pair(new Pair(getSymbol('atoms'),new Pair(getSymbol('...'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('result1'),new Pair(getSymbol('...'),theNil))),new Pair(new Pair(getSymbol('case'),new Pair(getSymbol('key'),new Pair(getSymbol('clause'),new Pair(getSymbol('...'),theNil)))),theNil)))),theNil)),theNil))))));
e['do']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(new Pair(new Pair(getSymbol('var'),new Pair(getSymbol('init'),new Pair(getSymbol('step'),theNil))),new Pair(getSymbol('...'),theNil)),new Pair(new Pair(getSymbol('test'),new Pair(getSymbol('expr'),new Pair(getSymbol('...'),theNil))),new Pair(getSymbol('command'),new Pair(getSymbol('...'),theNil))))),new Pair(new Pair(getSymbol('letrec'),new Pair(new Pair(new Pair(getSymbol('_loop_'),new Pair(new Pair(getSymbol('lambda'),new Pair(new Pair(getSymbol('var'),new Pair(getSymbol('...'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('test'),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('expr'),new Pair(getSymbol('...'),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(getSymbol('command'),new Pair(getSymbol('...'),new Pair(new Pair(getSymbol('_loop_'),new Pair(new Pair(getSymbol('do'),new Pair("step",new Pair(getSymbol('var'),new Pair(getSymbol('step'),theNil)))),new Pair(getSymbol('...'),theNil))),theNil)))),theNil)))),theNil))),theNil)),theNil),new Pair(new Pair(getSymbol('_loop_'),new Pair(getSymbol('init'),new Pair(getSymbol('...'),theNil))),theNil))),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair("step",new Pair(getSymbol('x'),theNil))),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(new Pair(getSymbol('_'),new Pair("step",new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)))),new Pair(getSymbol('y'),theNil)),theNil)))));
e['memq+']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(getSymbol('ls'),new Pair(new Pair(getSymbol('memq+'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil))),new Pair(getSymbol('ls'),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=((((e['ls'])instanceof Pair))!=false?((isEq(e['ls'].car,e['x']))!=false?e['ls']:TC(TopEnv.get('memq+'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))):((isEq(e['x'],e['ls']))!=false?e['ls']:false));if(r!=theTC||r.f!=this)return r}});
e['memq']=e.get('memq+');
e['memv']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eqv?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(getSymbol('ls'),new Pair(new Pair(getSymbol('memv'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eqv?'),new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil))),new Pair(getSymbol('ls'),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=((((e['ls'])instanceof Pair))!=false?((isEq(e['ls'].car,e['x']))!=false?e['ls']:TC(TopEnv.get('memv'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))):((isEq(e['x'],e['ls']))!=false?e['ls']:false));if(r!=theTC||r.f!=this)return r}});
e['member']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('equal?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(getSymbol('ls'),new Pair(new Pair(getSymbol('member'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('equal?'),new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil))),new Pair(getSymbol('ls'),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=((((e['ls'])instanceof Pair))!=false?((Apply(TopEnv.get('equal?'),new Pair(e['ls'].car,new Pair(e['x'],theNil))))!=false?e['ls']:TC(TopEnv.get('member'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))):((Apply(TopEnv.get('equal?'),new Pair(e['x'],new Pair(e['ls'],theNil))))!=false?e['ls']:false));if(r!=theTC||r.f!=this)return r}});
e['assq']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ls'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('assq'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=(((e['ls']==theNil))!=false?false:((isEq(e['ls'].car.car,e['x']))!=false?e['ls'].car:TC(TopEnv.get('assq'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))));if(r!=theTC||r.f!=this)return r}});
e['assv']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ls'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eqv?'),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('assv'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=(((e['ls']==theNil))!=false?false:((isEq(e['ls'].car.car,e['x']))!=false?e['ls'].car:TC(TopEnv.get('assv'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))));if(r!=theTC||r.f!=this)return r}});
e['assoc']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ls'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('equal?'),new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('ls'),theNil)),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ls'),theNil)),new Pair(new Pair(getSymbol('assoc'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ls'),theNil)),theNil))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['ls']=list.cdr.car;r=(((e['ls']==theNil))!=false?false:((Apply(TopEnv.get('equal?'),new Pair(e['ls'].car.car,new Pair(e['x'],theNil))))!=false?e['ls'].car:TC(TopEnv.get('assoc'),list=new Pair(e['x'],new Pair(e['ls'].cdr,theNil)))));if(r!=theTC||r.f!=this)return r}});
e['list?']=Apply(new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('race'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_28_'),theNil)),theNil))),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_29_'),theNil)),theNil))),new Env(e).With('_28_',new Lambda(new Pair(getSymbol('h'),new Pair(getSymbol('t'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('h'),theNil)),new Pair(new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_30_'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('h'),theNil)),theNil)),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('h'),theNil)),theNil)))),new Env(e).With('_30_',new Lambda(new Pair(getSymbol('h'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('h'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('h'),new Pair(getSymbol('t'),theNil))),theNil)),new Pair(new Pair(getSymbol('race'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('h'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('t'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('h'),theNil)),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['h']=list.car;r=((((e['h'])instanceof Pair))!=false?(((isEq(e['h'],e.parentEnv['t'])==false))!=false?TC(e.parentEnv.parentEnv.parentEnv['race'],list=new Pair(e['h'].cdr,new Pair(e.parentEnv['t'].cdr,theNil))):false):(e['h']==theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['h']=list.car;e['t']=list.cdr.car;r=((((e['h'])instanceof Pair))!=false?TC(e.parentEnv['_30_'].clone(e),list=new Pair(e['h'].cdr,theNil)):(e['h']==theNil));if(r!=theTC||r.f!=this)return r}})).With('_29_',new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('race'),new Pair(getSymbol('x'),new Pair(getSymbol('x'),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=TC(e.parentEnv['race'],list=new Pair(e['x'],new Pair(e['x'],theNil)));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(e['race']=e.parentEnv['_28_'].clone(e),e.parentEnv['_29_'].clone(e));if(r!=theTC||r.f!=this)return r}}),theNil);
e['equal?']=new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_31_'),theNil)),new Pair(new Pair(getSymbol('eqv?'),new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil))),theNil)),new Env(e).With('_31_',new Lambda(new Pair(getSymbol('eqv'),theNil),new Pair(getSymbol('if'),new Pair(getSymbol('eqv'),new Pair(getSymbol('eqv'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('y'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('equal?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('y'),theNil)),theNil))),new Pair(new Pair(getSymbol('equal?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('y'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(false,theNil)))),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('vector?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('vector?'),new Pair(getSymbol('y'),theNil)),new Pair(new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_32_'),theNil)),new Pair(new Pair(getSymbol('vector-length'),new Pair(getSymbol('x'),theNil)),theNil)),new Pair(false,theNil)))),new Pair(false,theNil)))),theNil)))),theNil)))),new Env(e).With('_32_',new Lambda(new Pair(getSymbol('n'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('='),new Pair(new Pair(getSymbol('vector-length'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('n'),theNil))),new Pair(new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_33_'),theNil)),theNil))),new Pair(getSymbol('loop'),theNil))),new Pair(0,theNil)),new Pair(false,theNil)))),new Env(e).With('_33_',new Lambda(new Pair(getSymbol('i'),theNil),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_34_'),theNil)),new Pair(new Pair(getSymbol('='),new Pair(getSymbol('i'),new Pair(getSymbol('n'),theNil))),theNil)),new Env(e).With('_34_',new Lambda(new Pair(getSymbol('eq-len'),theNil),new Pair(getSymbol('if'),new Pair(getSymbol('eq-len'),new Pair(getSymbol('eq-len'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('equal?'),new Pair(new Pair(getSymbol('vector-ref'),new Pair(getSymbol('x'),new Pair(getSymbol('i'),theNil))),new Pair(new Pair(getSymbol('vector-ref'),new Pair(getSymbol('y'),new Pair(getSymbol('i'),theNil))),theNil))),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('i'),new Pair(1,theNil))),theNil)),new Pair(false,theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['eq-len']=list.car;r=((e['eq-len'])!=false?e['eq-len']:((Apply(TopEnv.get('equal?'),new Pair(Apply(TopEnv.get('vector-ref'),new Pair(e.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv['x'],new Pair(e.parentEnv['i'],theNil))),new Pair(Apply(TopEnv.get('vector-ref'),new Pair(e.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv['y'],new Pair(e.parentEnv['i'],theNil))),theNil))))!=false?TC(e.parentEnv.parentEnv.parentEnv['loop'],list=new Pair((e.parentEnv['i']+1),theNil)):false));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['i']=list.car;r=TC(e.parentEnv['_34_'].clone(e),list=new Pair(isEq(e['i'],e.parentEnv.parentEnv['n']),theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['n']=list.car;r=((isEq(Apply(TopEnv.get('vector-length'),new Pair(e.parentEnv.parentEnv.parentEnv.parentEnv['y'],theNil)),e['n']))!=false?TC((e['loop']=e.parentEnv['_33_'].clone(e),e['loop']),list=new Pair(0,theNil)):false);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['eqv']=list.car;r=((e['eqv'])!=false?e['eqv']:((((e.parentEnv.parentEnv['x'])instanceof Pair))!=false?((((e.parentEnv.parentEnv['y'])instanceof Pair))!=false?((Apply(TopEnv.get('equal?'),new Pair(e.parentEnv.parentEnv['x'].car,new Pair(e.parentEnv.parentEnv['y'].car,theNil))))!=false?TC(TopEnv.get('equal?'),list=new Pair(e.parentEnv.parentEnv['x'].cdr,new Pair(e.parentEnv.parentEnv['y'].cdr,theNil))):false):false):((Apply(TopEnv.get('vector?'),new Pair(e.parentEnv.parentEnv['x'],theNil)))!=false?((Apply(TopEnv.get('vector?'),new Pair(e.parentEnv.parentEnv['y'],theNil)))!=false?TC(e.parentEnv['_32_'].clone(e),list=new Pair(Apply(TopEnv.get('vector-length'),new Pair(e.parentEnv.parentEnv['x'],theNil)),theNil)):false):false)));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=TC(e.parentEnv['_31_'].clone(e),list=new Pair(isEq(e['x'],e['y']),theNil));if(r!=theTC||r.f!=this)return r}});
e['values']=new Lambda(getSymbol('things'),new Pair(getSymbol('call/cc'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_35_'),theNil)),theNil)),new Env(e).With('_35_',new Lambda(new Pair(getSymbol('cont'),theNil),new Pair(getSymbol('apply'),new Pair(getSymbol('cont'),new Pair(getSymbol('things'),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['cont']=list.car;r=TC(e['cont'],list=e.parentEnv['things'].ListCopy());if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['things']=list;r=TC(TopEnv.get('call/cc'),list=new Pair(e.parentEnv['_35_'].clone(e),theNil));if(r!=theTC||r.f!=this)return r}});
e['call-with-values']=new Lambda(new Pair(getSymbol('producer'),new Pair(getSymbol('consumer'),theNil)),new Pair(getSymbol('consumer'),new Pair(new Pair(getSymbol('producer'),theNil),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['producer']=list.car;e['consumer']=list.cdr.car;r=TC(e['consumer'],list=new Pair(Apply(e['producer'],theNil),theNil));if(r!=theTC||r.f!=this)return r}});
e['for-each']=new Lambda(new Pair(getSymbol('f'),getSymbol('lst')),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('f'),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil))),theNil))),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('for-each'),new Pair(getSymbol('f'),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil))),theNil)))),theNil))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['f']=list.car;e['lst']=list.cdr;r=((((e['lst'].car==theNil)==false))!=false?(Apply(e['f'],Apply(TopEnv.get('map+'),new Pair(TopEnv.get('car'),new Pair(e['lst'],theNil))).ListCopy()),TC(TopEnv.get('for-each'),list=new Pair(e['f'],Apply(TopEnv.get('map+'),new Pair(TopEnv.get('cdr'),new Pair(e['lst'],theNil))).ListCopy()))):null);if(r!=theTC||r.f!=this)return r}});
e['delay']=new Syntax(e.get('syntax-rules'),new Pair(theNil,new Pair(new Pair(new Pair(getSymbol('_'),new Pair(getSymbol('exp'),theNil)),new Pair(new Pair(getSymbol('make-promise'),new Pair(new Pair(getSymbol('lambda'),new Pair(theNil,new Pair(getSymbol('exp'),theNil))),theNil)),theNil)),theNil)));
e['make-promise']=new Lambda(new Pair(getSymbol('p'),theNil),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_36_'),theNil)),theNil),new Env(e).With('_36_',new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('val'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('set?'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_37_'),theNil)),theNil)))),new Env(e).With('_37_',new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(getSymbol('set?'),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('p'),theNil),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(getSymbol('set?'),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('val'),new Pair(getSymbol('x'),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('set?'),new Pair(true,theNil))),theNil))),theNil))),theNil))),theNil))),new Pair(getSymbol('val'),theNil))),e,function(list){var r,e=new Env(this.env);while(true){r=((((e.parentEnv['set?']==false))!=false?(e['x']=Apply(e.parentEnv.parentEnv.parentEnv['p'],theNil),(((e.parentEnv['set?']==false))!=false?(e.set('val',e['x']),e.set('set?',true)):null)):null),e.parentEnv['val']);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(e['val']=false,e['set?']=false,e.parentEnv['_37_'].clone(e));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['p']=list.car;r=TC(e.parentEnv['_36_'].clone(e),list=theNil);if(r!=theTC||r.f!=this)return r}});
e['force']=new Lambda(new Pair(getSymbol('promise'),theNil),new Pair(getSymbol('promise'),theNil),e,function(list){var r,e=new Env(this.env);while(true){e['promise']=list.car;r=TC(e['promise'],list=theNil);if(r!=theTC||r.f!=this)return r}});
e['string-copy']=new Lambda(new Pair(getSymbol('x'),theNil),getSymbol('x'),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=e['x'];if(r!=theTC||r.f!=this)return r}});
e['vector-fill!']=new Lambda(new Pair(getSymbol('v'),new Pair(getSymbol('obj'),theNil)),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('vector-length'),new Pair(getSymbol('v'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('vf'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_38_'),theNil)),theNil))),new Pair(new Pair(getSymbol('vf'),new Pair(0,theNil)),theNil)))),new Env(e).With('_38_',new Lambda(new Pair(getSymbol('i'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('i'),new Pair(getSymbol('l'),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('vector-set!'),new Pair(getSymbol('v'),new Pair(getSymbol('i'),new Pair(getSymbol('obj'),theNil)))),new Pair(new Pair(getSymbol('vf'),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('i'),new Pair(1,theNil))),theNil)),theNil))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['i']=list.car;r=((e['i']<e.parentEnv['l'])!=false?(Apply(TopEnv.get('vector-set!'),new Pair(e.parentEnv['v'],new Pair(e['i'],new Pair(e.parentEnv['obj'],theNil)))),TC(e.parentEnv['vf'],list=new Pair((e['i']+1),theNil))):null);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['v']=list.car;e['obj']=list.cdr.car;r=(e['l']=Apply(TopEnv.get('vector-length'),new Pair(e['v'],theNil)),e['vf']=e.parentEnv['_38_'].clone(e),TC(e['vf'],list=new Pair(0,theNil)));if(r!=theTC||r.f!=this)return r}});
e['vector->list']=new Lambda(new Pair(getSymbol('v'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_39_'),theNil)),theNil))),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('-'),new Pair(new Pair(getSymbol('vector-length'),new Pair(getSymbol('v'),theNil)),new Pair(1,theNil))),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),theNil))),new Env(e).With('_39_',new Lambda(new Pair(getSymbol('i'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('i'),new Pair(0,theNil))),new Pair(getSymbol('l'),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('i'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('vector-ref'),new Pair(getSymbol('v'),new Pair(getSymbol('i'),theNil))),new Pair(getSymbol('l'),theNil))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['i']=list.car;e['l']=list.cdr.car;r=((e['i']<0)!=false?e['l']:TC(e.parentEnv['loop'],list=new Pair((e['i']-1),new Pair(new Pair(Apply(TopEnv.get('vector-ref'),new Pair(e.parentEnv['v'],new Pair(e['i'],theNil))),e['l']),theNil))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['v']=list.car;r=(e['loop']=e.parentEnv['_39_'].clone(e),TC(e['loop'],list=new Pair((Apply(TopEnv.get('vector-length'),new Pair(e['v'],theNil))-1),new Pair(theNil,theNil))));if(r!=theTC||r.f!=this)return r}});
e['list->vector']=new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('v'),new Pair(new Pair(getSymbol('make-vector'),new Pair(0,theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_40_'),theNil)),theNil))),new Pair(new Pair(getSymbol('loop'),new Pair(0,new Pair(getSymbol('l'),theNil))),new Pair(getSymbol('v'),theNil))))),new Env(e).With('_40_',new Lambda(new Pair(getSymbol('i'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('vector-set!'),new Pair(getSymbol('v'),new Pair(getSymbol('i'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)))),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('+'),new Pair(getSymbol('i'),new Pair(1,theNil))),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('l'),theNil)),theNil)),new Pair(new Pair(getSymbol('vector-set!'),new Pair(getSymbol('v'),new Pair(getSymbol('i'),new Pair(getSymbol('l'),theNil)))),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['i']=list.car;e['l']=list.cdr.car;r=((((e['l'])instanceof Pair))!=false?(Apply(TopEnv.get('vector-set!'),new Pair(e.parentEnv['v'],new Pair(e['i'],new Pair(e['l'].car,theNil)))),TC(e.parentEnv['loop'],list=new Pair((e['i']+1),new Pair(e['l'].cdr,theNil)))):((((e['l']==theNil)==false))!=false?TC(TopEnv.get('vector-set!'),list=new Pair(e.parentEnv['v'],new Pair(e['i'],new Pair(e['l'],theNil)))):null));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(e['v']=Apply(TopEnv.get('make-vector'),new Pair(0,theNil)),e['loop']=e.parentEnv['_40_'].clone(e),Apply(e['loop'],new Pair(0,new Pair(e['l'],theNil))),e['v']);if(r!=theTC||r.f!=this)return r}});
e['dynamic-wind']=false;
Apply(new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('winders'),new Pair(new Pair(getSymbol('quote'),new Pair(theNil,theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('common-tail'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_41_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('do-wind'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_42_'),theNil)),theNil))),new Pair(new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_43_'),theNil)),new Pair(getSymbol('call/cc'),theNil)),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('call-with-current-continuation'),new Pair(getSymbol('call/cc'),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('dynamic-wind'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_44_'),theNil)),theNil))),theNil))))))),new Env(e).With('_41_',new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('lx'),new Pair(new Pair(getSymbol('length'),new Pair(getSymbol('x'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ly'),new Pair(new Pair(getSymbol('length'),new Pair(getSymbol('y'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_45_'),theNil)),theNil))),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('>'),new Pair(getSymbol('lx'),new Pair(getSymbol('ly'),theNil))),new Pair(new Pair(getSymbol('list-tail'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('lx'),new Pair(getSymbol('ly'),theNil))),theNil))),new Pair(getSymbol('x'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('>'),new Pair(getSymbol('ly'),new Pair(getSymbol('lx'),theNil))),new Pair(new Pair(getSymbol('list-tail'),new Pair(getSymbol('y'),new Pair(new Pair(getSymbol('-'),new Pair(getSymbol('ly'),new Pair(getSymbol('lx'),theNil))),theNil))),new Pair(getSymbol('y'),theNil)))),theNil))),theNil))))),new Env(e).With('_45_',new Lambda(new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('x'),new Pair(getSymbol('y'),theNil))),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('loop'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('y'),theNil)),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=((isEq(e['x'],e['y']))!=false?e['x']:TC(e.parentEnv['loop'],list=new Pair(e['x'].cdr,new Pair(e['y'].cdr,theNil))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;e['y']=list.cdr.car;r=(e['lx']=Apply(TopEnv.get('length'),new Pair(e['x'],theNil)),e['ly']=Apply(TopEnv.get('length'),new Pair(e['y'],theNil)),e['loop']=e.parentEnv['_45_'].clone(e),TC(e['loop'],list=new Pair(((e['lx']>e['ly'])!=false?Apply(TopEnv.get('list-tail'),new Pair(e['x'],new Pair((e['lx']-e['ly']),theNil))):e['x']),new Pair(((e['ly']>e['lx'])!=false?Apply(TopEnv.get('list-tail'),new Pair(e['y'],new Pair((e['ly']-e['lx']),theNil))):e['y']),theNil))));if(r!=theTC||r.f!=this)return r}})).With('_42_',new Lambda(new Pair(getSymbol('new'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('common-tail'),new Pair(getSymbol('new'),new Pair(getSymbol('winders'),theNil))),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('f1'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_46_'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('f2'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_47_'),theNil)),theNil))),new Pair(new Pair(getSymbol('f1'),new Pair(getSymbol('winders'),theNil)),new Pair(new Pair(getSymbol('f2'),new Pair(getSymbol('new'),theNil)),theNil)))))),new Env(e).With('_46_',new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('l'),new Pair(getSymbol('tail'),theNil))),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('winders'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil))),new Pair(new Pair(new Pair(getSymbol('cdar'),new Pair(getSymbol('l'),theNil)),theNil),new Pair(new Pair(getSymbol('f1'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(((isEq(e['l'],e.parentEnv['tail'])==false))!=false?(e.set('winders',e['l'].cdr),Apply(e['l'].car.cdr,theNil),TC(e.parentEnv['f1'],list=new Pair(e['l'].cdr,theNil))):null);if(r!=theTC||r.f!=this)return r}})).With('_47_',new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('l'),new Pair(getSymbol('tail'),theNil))),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('f2'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('l'),theNil)),theNil)),new Pair(new Pair(new Pair(getSymbol('caar'),new Pair(getSymbol('l'),theNil)),theNil),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('winders'),new Pair(getSymbol('l'),theNil))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(((isEq(e['l'],e.parentEnv['tail'])==false))!=false?(Apply(e.parentEnv['f2'],new Pair(e['l'].cdr,theNil)),Apply(e['l'].car.car,theNil),e.set('winders',e['l'])):null);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['new']=list.car;r=(e['tail']=Apply(e.parentEnv.parentEnv['common-tail'],new Pair(e['new'],new Pair(e.parentEnv.parentEnv['winders'],theNil))),e['f1']=e.parentEnv['_46_'].clone(e),e['f2']=e.parentEnv['_47_'].clone(e),Apply(e['f1'],new Pair(e.parentEnv.parentEnv['winders'],theNil)),TC(e['f2'],list=new Pair(e['new'],theNil)));if(r!=theTC||r.f!=this)return r}})).With('_43_',new Lambda(new Pair(getSymbol('c'),theNil),new Pair(getSymbol('set!'),new Pair(getSymbol('call/cc'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_48_'),theNil)),theNil))),new Env(e).With('_48_',new Lambda(new Pair(getSymbol('f'),theNil),new Pair(getSymbol('c'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_49_'),theNil)),theNil)),new Env(e).With('_49_',new Lambda(new Pair(getSymbol('k'),theNil),new Pair(getSymbol('f'),new Pair(new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_50_'),theNil)),new Pair(getSymbol('winders'),theNil)),theNil)),new Env(e).With('_50_',new Lambda(new Pair(getSymbol('save'),theNil),new Pair(getSymbol('clone'),new Pair(getSymbol('_51_'),theNil)),new Env(e).With('_51_',new Lambda(getSymbol('x'),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('save'),new Pair(getSymbol('winders'),theNil))),theNil)),new Pair(new Pair(getSymbol('do-wind'),new Pair(getSymbol('save'),theNil)),theNil))),new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('k'),new Pair(getSymbol('x'),theNil))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list;r=((((isEq(e.parentEnv['save'],e.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv['winders'])==false))!=false?Apply(e.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv['do-wind'],new Pair(e.parentEnv['save'],theNil)):null),TC(e.parentEnv.parentEnv.parentEnv['k'],list=e['x'].ListCopy()));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['save']=list.car;r=e.parentEnv['_51_'].clone(e);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['k']=list.car;r=TC(e.parentEnv.parentEnv['f'],list=new Pair(Apply(e.parentEnv['_50_'].clone(e),new Pair(e.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv.parentEnv['winders'],theNil)),theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['f']=list.car;r=TC(e.parentEnv.parentEnv['c'],list=new Pair(e.parentEnv['_49_'].clone(e),theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['c']=list.car;r=e.set('call/cc',e.parentEnv['_48_'].clone(e));if(r!=theTC||r.f!=this)return r}})).With('_44_',new Lambda(new Pair(getSymbol('in'),new Pair(getSymbol('body'),new Pair(getSymbol('out'),theNil))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ans'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('in'),theNil),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('winders'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('in'),new Pair(getSymbol('out'),theNil))),new Pair(getSymbol('winders'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('ans'),new Pair(new Pair(getSymbol('body'),theNil),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('winders'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('winders'),theNil)),theNil))),new Pair(new Pair(getSymbol('out'),theNil),new Pair(getSymbol('ans'),theNil)))))))),e,function(list){var r,e=new Env(this.env);while(true){e['in']=list.car;e['body']=list.cdr.car;e['out']=list.cdr.cdr.car;r=(e['ans']=false,Apply(e['in'],theNil),e.set('winders',new Pair(new Pair(e['in'],e['out']),e.parentEnv['winders'])),e['ans']=Apply(e['body'],theNil),e.set('winders',e.parentEnv['winders'].cdr),Apply(e['out'],theNil),e['ans']);if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(e['winders']=theNil,e['common-tail']=e.parentEnv['_41_'].clone(e),e['do-wind']=e.parentEnv['_42_'].clone(e),Apply(e.parentEnv['_43_'].clone(e),new Pair(TopEnv.get('call/cc'),theNil)),e.set('call-with-current-continuation',TopEnv.get('call/cc')),e.set('dynamic-wind',e.parentEnv['_44_'].clone(e)));if(r!=theTC||r.f!=this)return r}}),theNil);
e['js-char']=new Lambda(new Pair(getSymbol('c'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('char-code'),new Pair(new Pair(getSymbol('char->integer'),new Pair(getSymbol('c'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('>='),new Pair(getSymbol('char-code'),new Pair(32,theNil))),new Pair(new Pair(getSymbol('string'),new Pair(getSymbol('c'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair("\\x",new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('<'),new Pair(getSymbol('char-code'),new Pair(16,theNil))),new Pair("0",new Pair("",theNil)))),new Pair(new Pair(getSymbol('number->string'),new Pair(getSymbol('char-code'),new Pair(16,theNil))),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['c']=list.car;r=(e['char-code']=Apply(TopEnv.get('char->integer'),new Pair(e['c'],theNil)),((e['char-code']>=32)!=false?TC(TopEnv.get('string'),list=new Pair(e['c'],theNil)):("\\x"+((e['char-code']<16)!=false?"0":"")+Apply(TopEnv.get('number->string'),new Pair(e['char-code'],new Pair(16,theNil))))));if(r!=theTC||r.f!=this)return r}});
e['compile']=new Lambda(new Pair(getSymbol('ex'),getSymbol('tt')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('tail'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('locs'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('app'),new Pair("Apply",theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('prefix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('suffix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('tt'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('tt'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('tt'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('tt'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('tt'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('tt'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('suffix'),new Pair(new Pair(getSymbol('cadddr'),new Pair(getSymbol('tt'),theNil)),theNil))),theNil))),theNil))),theNil))),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('app'),new Pair("TC",theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('number?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('number->string'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('gen'),theNil)),new Pair(getSymbol('ex'),new Pair("e",theNil)))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e.get('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(getSymbol('ex'),theNil)),new Pair("')",new Pair(getSymbol('suffix'),theNil)))))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('string?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('str'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('char?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("getChar('",new Pair(new Pair(getSymbol('js-char'),new Pair(getSymbol('ex'),theNil)),new Pair("')",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('error'),new Pair("cannot compile ()",theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('boolean?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('ex'),new Pair("true",new Pair("false",theNil)))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('vector?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(getSymbol('app'),new Pair("(e.get('list->vector'),",new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('tail'),new Pair("list=",new Pair("",theNil)))),new Pair("new Pair(",new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('vector->list'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(",theNil),e)",new Pair(getSymbol('suffix'),theNil))))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('error'),new Pair(new Pair(getSymbol('string-append'),new Pair("cannot compile ",new Pair(new Pair(getSymbol('str'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil)),new Pair(new Pair(getSymbol('compile-pair'),new Pair(getSymbol('ex'),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),new Pair(getSymbol('app'),theNil))))))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil))))))))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['tt']=list.cdr;r=(e['tail']=false,e['locs']=false,e['app']="Apply",e['prefix']="",e['suffix']="",((((e['tt']==theNil)==false))!=false?(e['locs']=e['tt'].car,((((e['tt'].cdr==theNil)==false))!=false?(e['tail']=e['tt'].cdr.car,((((e['tt'].cdr.cdr==theNil)==false))!=false?(e['prefix']=e['tt'].cdr.cdr.car,e['suffix']=e['tt'].cdr.cdr.cdr.car):null)):null)):null),((e['tail'])!=false?e['app']="TC":null),(((typeof(e['ex'])=='number'))!=false?(e['prefix']+Apply(TopEnv.get('number->string'),new Pair(e['ex'],theNil))+e['suffix']):((((e['ex'])instanceof Symbol))!=false?((e['locs'])!=false?(e['prefix']+Apply(e['locs'],new Pair(getSymbol('gen'),new Pair(e['ex'],new Pair("e",theNil))))+e['suffix']):(e['prefix']+"e.get('"+e['ex'].name+"')"+e['suffix'])):(((typeof(e['ex'])=='string'))!=false?(e['prefix']+Str(e['ex'])+e['suffix']):((((e['ex'])instanceof Char))!=false?(e['prefix']+"getChar('"+Apply(TopEnv.get('js-char'),new Pair(e['ex'],theNil))+"')"+e['suffix']):(((e['ex']==theNil))!=false?TC(TopEnv.get('error'),list=new Pair("cannot compile ()",theNil)):(((typeof(e['ex'])=='boolean'))!=false?(e['prefix']+((e['ex'])!=false?"true":"false")+e['suffix']):((Apply(TopEnv.get('vector?'),new Pair(e['ex'],theNil)))!=false?(e['prefix']+e['app']+"(e.get('list->vector'),"+((e['tail'])!=false?"list=":"")+"new Pair("+Apply(TopEnv.get('compile-quote'),new Pair(Apply(TopEnv.get('vector->list'),new Pair(e['ex'],theNil)),theNil))+",theNil),e)"+e['suffix']):(((((e['ex'])instanceof Pair)==false))!=false?TC(TopEnv.get('error'),list=new Pair(("cannot compile "+Str(e['ex'])),theNil)):TC(TopEnv.get('compile-pair'),list=new Pair(e['ex'],new Pair(e['locs'],new Pair(e['tail'],new Pair(e['prefix'],new Pair(e['suffix'],new Pair(e['app'],theNil))))))))))))))));if(r!=theTC||r.f!=this)return r}});
e['compile-pair']=new Lambda(new Pair(getSymbol('ex'),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),new Pair(getSymbol('app'),theNil)))))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('list-len'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('locs'),theNil)),new Pair(new Pair(getSymbol('length'),new Pair(getSymbol('locs'),theNil)),new Pair(false,theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('begin'),theNil)),theNil))),new Pair(new Pair(getSymbol('compile-begin'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('quote'),theNil)),theNil))),new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('not'),theNil)),theNil))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(false,new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(",theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair("==false)",new Pair(getSymbol('suffix'),theNil))),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('symbol->string'),theNil)),theNil))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(false,new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('suffix'),new Pair(".name",theNil))),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('car'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cdr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('caar'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".car.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cadr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cdar'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".car.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('caaar'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".car.car.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('caddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cdaar'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".car.car.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cdddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('caaddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.car.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cadddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.cdr.car",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cdaddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.car.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cddddr'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".cdr.cdr.cdr.cdr",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('cons'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("new Pair(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",new Pair(getSymbol('suffix'),theNil)))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('boolean?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(typeof(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")=='boolean')",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('string?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(typeof(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")=='string')",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('number?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(typeof(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")=='number')",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('char?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")instanceof Char)",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('symbol?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")instanceof Symbol)",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('syntax?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")instanceof Syntax)",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('null?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair("==theNil)",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('pair?'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")instanceof Pair)",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('str'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("Str(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('clone'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(".clone(e)",new Pair(getSymbol('suffix'),theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('get-prop'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair("[",new Pair(new Pair(getSymbol('str'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("]",new Pair(getSymbol('suffix'),theNil))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('>'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('<'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('>='),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('<='),theNil)),theNil))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-predicate'),new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil)))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('+'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-append'),new Pair("0",new Pair("+",new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('*'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-append'),new Pair("1",new Pair("*",new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('-'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-minus'),new Pair("-",new Pair("-",new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('/'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-minus'),new Pair("1/",new Pair("/",new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('string-append'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-append'),new Pair("''",new Pair("+",new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('eq?'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('='),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('eqv?'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('string=?'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('char=?'),theNil)),theNil))),theNil)))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("isEq(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",new Pair(getSymbol('suffix'),theNil)))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('list'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-list'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('if'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdddr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")!=false?",theNil))))),new Pair(new Pair(getSymbol('string-append'),new Pair(":null)",new Pair(getSymbol('suffix'),theNil))),theNil)))))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("((",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")!=false?",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),theNil)))),new Pair(":",theNil))))))),new Pair(new Pair(getSymbol('string-append'),new Pair(")",new Pair(getSymbol('suffix'),theNil))),theNil)))))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define-syntax'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("']=new Syntax(e.get('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('caaddr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("'),",new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('cdaddr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(")",new Pair(getSymbol('suffix'),theNil)))))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define'),theNil)),theNil))),new Pair(new Pair(getSymbol('symbol?'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('add'),theNil)),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("']=",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('suffix'),theNil))))))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('set!'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('memq'),theNil)),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(false,new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("']=",theNil))))),new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('caddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(false,new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e.set('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("',",theNil))))),new Pair(new Pair(getSymbol('string-append'),new Pair(")",new Pair(getSymbol('suffix'),theNil))),theNil)))))),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('lambda'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('compile-lambda-obj'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil)))),new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define'),theNil)),theNil))),new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('add'),theNil)),new Pair(new Pair(getSymbol('caadr'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('caadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("']=",new Pair(new Pair(getSymbol('compile-lambda-obj'),new Pair(new Pair(getSymbol('cdadr'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil)))),new Pair(getSymbol('suffix'),theNil))))))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('apply'),theNil)),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(getSymbol('app'),new Pair("(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('tail'),new Pair("list=",new Pair("",theNil)))),new Pair(new Pair(getSymbol('compile-apply-list'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",new Pair(getSymbol('suffix'),theNil)))))))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('number?'),new Pair(getSymbol('list-len'),theNil)),new Pair(new Pair(getSymbol('>='),new Pair(getSymbol('list-len'),new Pair(new Pair(getSymbol('length'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil)),theNil))),new Pair(false,theNil)))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("(",new Pair(new Pair(getSymbol('compile-reuse'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair("list",new Pair(getSymbol('locs'),theNil)))),new Pair(",",new Pair("theTC.f=",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",theTC.args=list,theTC)",new Pair(getSymbol('suffix'),theNil))))))))),new Pair(new Pair(getSymbol('compile-list'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(getSymbol('app'),new Pair("(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('tail'),new Pair("list=",new Pair("",theNil)))),theNil))))))),new Pair(new Pair(getSymbol('string-append'),new Pair(")",new Pair(getSymbol('suffix'),theNil))),theNil))))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['locs']=list.cdr.car;e['tail']=list.cdr.cdr.car;e['prefix']=list.cdr.cdr.cdr.car;e['suffix']=list.cdr.cdr.cdr.cdr.car;e['app']=list.cdr.cdr.cdr.cdr.cdr.car;r=(e['list-len']=((((e['locs'])instanceof Pair))!=false?Apply(TopEnv.get('length'),new Pair(e['locs'],theNil)):false),((isEq(e['ex'].car,getSymbol('begin')))!=false?TC(TopEnv.get('compile-begin'),list=new Pair(e['ex'].cdr,new Pair(e['locs'],new Pair(e['tail'],new Pair(e['prefix'],new Pair(e['suffix'],theNil)))))):((isEq(e['ex'].car,getSymbol('quote')))!=false?TC(TopEnv.get('compile-quote'),list=new Pair(e['ex'].cdr.car,new Pair(e['prefix'],new Pair(e['suffix'],theNil)))):((isEq(e['ex'].car,getSymbol('not')))!=false?TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.car,new Pair(e['locs'],new Pair(false,new Pair((e['prefix']+"("),new Pair(("==false)"+e['suffix']),theNil)))))):((isEq(e['ex'].car,getSymbol('symbol->string')))!=false?TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.car,new Pair(e['locs'],new Pair(false,new Pair(e['prefix'],new Pair((e['suffix']+".name"),theNil)))))):((isEq(e['ex'].car,getSymbol('car')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cdr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('caar')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".car.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cadr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cdar')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".car.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('cddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('caaar')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".car.car.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('caddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cdaar')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".car.car.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('cdddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('caaddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.car.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cadddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.cdr.car"+e['suffix']):((isEq(e['ex'].car,getSymbol('cdaddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.car.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('cddddr')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".cdr.cdr.cdr.cdr"+e['suffix']):((isEq(e['ex'].car,getSymbol('cons')))!=false?(e['prefix']+"new Pair("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+","+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],theNil)))+")"+e['suffix']):((isEq(e['ex'].car,getSymbol('boolean?')))!=false?(e['prefix']+"(typeof("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")=='boolean')"+e['suffix']):((isEq(e['ex'].car,getSymbol('string?')))!=false?(e['prefix']+"(typeof("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")=='string')"+e['suffix']):((isEq(e['ex'].car,getSymbol('number?')))!=false?(e['prefix']+"(typeof("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")=='number')"+e['suffix']):((isEq(e['ex'].car,getSymbol('char?')))!=false?(e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")instanceof Char)"+e['suffix']):((isEq(e['ex'].car,getSymbol('symbol?')))!=false?(e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")instanceof Symbol)"+e['suffix']):((isEq(e['ex'].car,getSymbol('syntax?')))!=false?(e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")instanceof Syntax)"+e['suffix']):((isEq(e['ex'].car,getSymbol('null?')))!=false?(e['prefix']+"("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+"==theNil)"+e['suffix']):((isEq(e['ex'].car,getSymbol('pair?')))!=false?(e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")instanceof Pair)"+e['suffix']):((isEq(e['ex'].car,getSymbol('str')))!=false?(e['prefix']+"Str("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")"+e['suffix']):((isEq(e['ex'].car,getSymbol('clone')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+".clone(e)"+e['suffix']):((isEq(e['ex'].car,getSymbol('get-prop')))!=false?(e['prefix']+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+"["+Str(e['ex'].cdr.cdr.car)+"]"+e['suffix']):((((isEq(e['ex'].car,getSymbol('>')))!=false?true:((isEq(e['ex'].car,getSymbol('<')))!=false?true:((isEq(e['ex'].car,getSymbol('>=')))!=false?true:isEq(e['ex'].car,getSymbol('<='))))))!=false?(e['prefix']+Apply(TopEnv.get('compile-predicate'),new Pair(e['ex'].car.name,new Pair(e['ex'].cdr,new Pair(e['locs'],theNil))))+e['suffix']):((isEq(e['ex'].car,getSymbol('+')))!=false?(e['prefix']+Apply(TopEnv.get('compile-append'),new Pair("0",new Pair("+",new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))))+e['suffix']):((isEq(e['ex'].car,getSymbol('*')))!=false?(e['prefix']+Apply(TopEnv.get('compile-append'),new Pair("1",new Pair("*",new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))))+e['suffix']):((isEq(e['ex'].car,getSymbol('-')))!=false?(e['prefix']+Apply(TopEnv.get('compile-minus'),new Pair("-",new Pair("-",new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))))+e['suffix']):((isEq(e['ex'].car,getSymbol('/')))!=false?(e['prefix']+Apply(TopEnv.get('compile-minus'),new Pair("1/",new Pair("/",new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))))+e['suffix']):((isEq(e['ex'].car,getSymbol('string-append')))!=false?(e['prefix']+Apply(TopEnv.get('compile-append'),new Pair("''",new Pair("+",new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))))+e['suffix']):((((isEq(e['ex'].car,getSymbol('eq?')))!=false?true:((isEq(e['ex'].car,getSymbol('=')))!=false?true:((isEq(e['ex'].car,getSymbol('eqv?')))!=false?true:((isEq(e['ex'].car,getSymbol('string=?')))!=false?true:isEq(e['ex'].car,getSymbol('char=?')))))))!=false?(e['prefix']+"isEq("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+","+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],theNil)))+")"+e['suffix']):((isEq(e['ex'].car,getSymbol('list')))!=false?(e['prefix']+Apply(TopEnv.get('compile-list'),new Pair(e['ex'].cdr,new Pair(e['locs'],theNil)))+e['suffix']):((isEq(e['ex'].car,getSymbol('if')))!=false?(((e['ex'].cdr.cdr.cdr==theNil))!=false?TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],new Pair(e['tail'],new Pair((e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")!=false?"),new Pair((":null)"+e['suffix']),theNil)))))):TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.cdr.cdr.car,new Pair(e['locs'],new Pair(e['tail'],new Pair((e['prefix']+"(("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+")!=false?"+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],new Pair(e['tail'],theNil))))+":"),new Pair((")"+e['suffix']),theNil))))))):((isEq(e['ex'].car,getSymbol('define-syntax')))!=false?(e['prefix']+"e['"+e['ex'].cdr.car.name+"']=new Syntax(e.get('"+e['ex'].cdr.cdr.car.car.name+"'),"+Apply(TopEnv.get('compile-quote'),new Pair(e['ex'].cdr.cdr.car.cdr,theNil))+")"+e['suffix']):((((isEq(e['ex'].car,getSymbol('define')))!=false?((e['ex'].cdr.car)instanceof Symbol):false))!=false?(((e['locs'])!=false?Apply(e['locs'],new Pair(getSymbol('add'),new Pair(e['ex'].cdr.car,theNil))):null),(e['prefix']+"e['"+e['ex'].cdr.car.name+"']="+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],theNil)))+e['suffix'])):((isEq(e['ex'].car,getSymbol('set!')))!=false?((((e['locs'])!=false?Apply(e['locs'],new Pair(getSymbol('memq'),new Pair(e['ex'].cdr.car,theNil))):false))!=false?TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],new Pair(false,new Pair((e['prefix']+"e['"+e['ex'].cdr.car.name+"']="),new Pair(e['suffix'],theNil)))))):TC(TopEnv.get('compile'),list=new Pair(e['ex'].cdr.cdr.car,new Pair(e['locs'],new Pair(false,new Pair((e['prefix']+"e.set('"+e['ex'].cdr.car.name+"',"),new Pair((")"+e['suffix']),theNil))))))):((isEq(e['ex'].car,getSymbol('lambda')))!=false?(e['prefix']+Apply(TopEnv.get('compile-lambda-obj'),new Pair(e['ex'].cdr.car,new Pair(e['ex'].cdr.cdr,new Pair(e['locs'],theNil))))+e['suffix']):((((isEq(e['ex'].car,getSymbol('define')))!=false?((e['ex'].cdr.car)instanceof Pair):false))!=false?(((e['locs'])!=false?Apply(e['locs'],new Pair(getSymbol('add'),new Pair(Apply(TopEnv.get('caadr'),new Pair(e['ex'],theNil)),theNil))):null),(e['prefix']+"e['"+Apply(TopEnv.get('caadr'),new Pair(e['ex'],theNil)).name+"']="+Apply(TopEnv.get('compile-lambda-obj'),new Pair(Apply(TopEnv.get('cdadr'),new Pair(e['ex'],theNil)),new Pair(e['ex'].cdr.cdr,new Pair(e['locs'],theNil))))+e['suffix'])):((isEq(e['ex'].car,getSymbol('apply')))!=false?(e['prefix']+e['app']+"("+Apply(TopEnv.get('compile'),new Pair(e['ex'].cdr.car,new Pair(e['locs'],theNil)))+","+((e['tail'])!=false?"list=":"")+Apply(TopEnv.get('compile-apply-list'),new Pair(e['ex'].cdr.cdr,new Pair(e['locs'],theNil)))+")"+e['suffix']):((((e['tail'])!=false?(((typeof(e['list-len'])=='number'))!=false?e['list-len']>=Apply(TopEnv.get('length'),new Pair(e['ex'].cdr,theNil)):false):false))!=false?(e['prefix']+"("+Apply(TopEnv.get('compile-reuse'),new Pair(e['ex'].cdr,new Pair("list",new Pair(e['locs'],theNil))))+","+"theTC.f="+Apply(TopEnv.get('compile'),new Pair(e['ex'].car,new Pair(e['locs'],theNil)))+",theTC.args=list,theTC)"+e['suffix']):TC(TopEnv.get('compile-list'),list=new Pair(e['ex'].cdr,new Pair(e['locs'],new Pair((e['prefix']+e['app']+"("+Apply(TopEnv.get('compile'),new Pair(e['ex'].car,new Pair(e['locs'],theNil)))+","+((e['tail'])!=false?"list=":"")),new Pair((")"+e['suffix']),theNil))))))))))))))))))))))))))))))))))))))))))))))))))));if(r!=theTC||r.f!=this)return r}});
e['compile-reuse']=new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('var'),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair("(",new Pair(getSymbol('var'),new Pair(".car=",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair("),",new Pair(new Pair(getSymbol('compile-reuse'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('var'),new Pair(".cdr",theNil))),new Pair(getSymbol('locs'),theNil)))),theNil))))))),new Pair(new Pair(getSymbol('string-append'),new Pair("(",new Pair(getSymbol('var'),new Pair("=",new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair("theNil",new Pair(new Pair(getSymbol('compile'),new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),theNil))),theNil)))),new Pair(")",theNil)))))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['var']=list.cdr.car;e['locs']=list.cdr.cdr.car;r=((((e['lst'])instanceof Pair))!=false?("("+e['var']+".car="+Apply(TopEnv.get('compile'),new Pair(e['lst'].car,new Pair(e['locs'],theNil)))+"),"+Apply(TopEnv.get('compile-reuse'),new Pair(e['lst'].cdr,new Pair((e['var']+".cdr"),new Pair(e['locs'],theNil))))):("("+e['var']+"="+(((e['lst']==theNil))!=false?"theNil":Apply(TopEnv.get('compile'),new Pair(e['lst'],new Pair(e['locs'],theNil))))+")"));if(r!=theTC||r.f!=this)return r}});
e['compile-predicate']=new Lambda(new Pair(getSymbol('op'),new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('s'),new Pair(new Pair(getSymbol('string-append'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(getSymbol('s'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('s'),new Pair("&&",new Pair(new Pair(getSymbol('compile-predicate'),new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil)))),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['op']=list.car;e['lst']=list.cdr.car;e['locs']=list.cdr.cdr.car;r=(e['s']=(Apply(TopEnv.get('compile'),new Pair(e['lst'].car,new Pair(e['locs'],theNil)))+e['op']+Apply(TopEnv.get('compile'),new Pair(e['lst'].cdr.car,new Pair(e['locs'],theNil)))),(((e['lst'].cdr.cdr==theNil))!=false?e['s']:(e['s']+"&&"+Apply(TopEnv.get('compile-predicate'),new Pair(e['op'],new Pair(e['lst'].cdr,new Pair(e['locs'],theNil)))))));if(r!=theTC||r.f!=this)return r}});
e['compile-minus']=new Lambda(new Pair(getSymbol('one'),new Pair(getSymbol('op'),new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),theNil)))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair("(",new Pair(getSymbol('one'),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",theNil))))),new Pair(new Pair(getSymbol('compile-append'),new Pair("0",new Pair(getSymbol('op'),new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),theNil))))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['one']=list.car;e['op']=list.cdr.car;e['lst']=list.cdr.cdr.car;e['locs']=list.cdr.cdr.cdr.car;r=(((e['lst'].cdr==theNil))!=false?("("+e['one']+Apply(TopEnv.get('compile'),new Pair(e['lst'].car,new Pair(e['locs'],theNil)))+")"):TC(TopEnv.get('compile-append'),list=new Pair("0",new Pair(e['op'],new Pair(e['lst'],new Pair(e['locs'],theNil))))));if(r!=theTC||r.f!=this)return r}});
e['compile-append']=new Lambda(new Pair(getSymbol('zero'),new Pair(getSymbol('op'),new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),getSymbol('q'))))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('zero'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('q'),theNil)),new Pair("(",new Pair("",theNil)))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('compile-append'),new Pair(getSymbol('zero'),new Pair(getSymbol('op'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),new Pair(true,theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('q'),theNil)),new Pair(")",new Pair("",theNil)))),theNil)))))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['zero']=list.car;e['op']=list.cdr.car;e['lst']=list.cdr.cdr.car;e['locs']=list.cdr.cdr.cdr.car;e['q']=list.cdr.cdr.cdr.cdr;r=(((e['lst']==theNil))!=false?e['zero']:(((e['lst'].cdr==theNil))!=false?TC(TopEnv.get('compile'),list=new Pair(e['lst'].car,new Pair(e['locs'],theNil))):((((e['q']==theNil))!=false?"(":"")+Apply(TopEnv.get('compile'),new Pair(e['lst'].car,new Pair(e['locs'],theNil)))+e['op']+Apply(TopEnv.get('compile-append'),new Pair(e['zero'],new Pair(e['op'],new Pair(e['lst'].cdr,new Pair(e['locs'],new Pair(true,theNil))))))+(((e['q']==theNil))!=false?")":""))));if(r!=theTC||r.f!=this)return r}});
e['compile-list']=new Lambda(new Pair(getSymbol('ex'),new Pair(getSymbol('locs'),getSymbol('tt'))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('prefix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('suffix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('tt'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('tt'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('suffix'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('tt'),theNil)),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("theNil",new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('compile-list'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("new Pair(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",theNil))))),new Pair(new Pair(getSymbol('string-append'),new Pair(")",new Pair(getSymbol('suffix'),theNil))),theNil))))),new Pair(new Pair(getSymbol('compile'),new Pair(getSymbol('ex'),new Pair(getSymbol('locs'),new Pair(false,new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),theNil)))))),theNil)))),theNil)))),theNil))))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['locs']=list.cdr.car;e['tt']=list.cdr.cdr;r=(e['prefix']="",e['suffix']="",((((e['tt']==theNil)==false))!=false?(e['prefix']=e['tt'].car,e['suffix']=e['tt'].cdr.car):null),(((e['ex']==theNil))!=false?(e['prefix']+"theNil"+e['suffix']):((((e['ex'])instanceof Pair))!=false?TC(TopEnv.get('compile-list'),list=new Pair(e['ex'].cdr,new Pair(e['locs'],new Pair((e['prefix']+"new Pair("+Apply(TopEnv.get('compile'),new Pair(e['ex'].car,new Pair(e['locs'],theNil)))+","),new Pair((")"+e['suffix']),theNil))))):TC(TopEnv.get('compile'),list=new Pair(e['ex'],new Pair(e['locs'],new Pair(false,new Pair(e['prefix'],new Pair(e['suffix'],theNil)))))))));if(r!=theTC||r.f!=this)return r}});
e['compile-quote']=new Lambda(new Pair(getSymbol('ex'),getSymbol('tt')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('prefix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('suffix'),new Pair("",theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('tt'),theNil)),theNil)),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('tt'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('suffix'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('tt'),theNil)),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("theNil",new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("getSymbol('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(getSymbol('ex'),theNil)),new Pair("')",new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("new Pair(",new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(",",theNil))))),new Pair(new Pair(getSymbol('string-append'),new Pair(")",new Pair(getSymbol('suffix'),theNil))),theNil)))),new Pair(new Pair(getSymbol('compile'),new Pair(getSymbol('ex'),new Pair(false,new Pair(false,new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),theNil)))))),theNil)))),theNil)))),theNil)))),theNil))))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['tt']=list.cdr;r=(e['prefix']="",e['suffix']="",((((e['tt']==theNil)==false))!=false?(e['prefix']=e['tt'].car,e['suffix']=e['tt'].cdr.car):null),(((e['ex']==theNil))!=false?(e['prefix']+"theNil"+e['suffix']):((((e['ex'])instanceof Symbol))!=false?(e['prefix']+"getSymbol('"+e['ex'].name+"')"+e['suffix']):((((e['ex'])instanceof Pair))!=false?TC(TopEnv.get('compile-quote'),list=new Pair(e['ex'].cdr,new Pair((e['prefix']+"new Pair("+Apply(TopEnv.get('compile-quote'),new Pair(e['ex'].car,theNil))+","),new Pair((")"+e['suffix']),theNil)))):TC(TopEnv.get('compile'),list=new Pair(e['ex'],new Pair(false,new Pair(false,new Pair(e['prefix'],new Pair(e['suffix'],theNil))))))))));if(r!=theTC||r.f!=this)return r}});
e['compile-begin']=new Lambda(new Pair(getSymbol('ex'),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),getSymbol('q')))))),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair("null",new Pair(getSymbol('suffix'),theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(getSymbol('prefix'),new Pair(getSymbol('suffix'),theNil)))))),new Pair(new Pair(getSymbol('compile-begin'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),new Pair(getSymbol('tail'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('prefix'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('q'),theNil)),new Pair("(",new Pair("",theNil)))),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",theNil))))),new Pair(new Pair(getSymbol('string-append'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('q'),theNil)),new Pair(")",new Pair("",theNil)))),new Pair(getSymbol('suffix'),theNil))),new Pair(true,theNil))))))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;e['locs']=list.cdr.car;e['tail']=list.cdr.cdr.car;e['prefix']=list.cdr.cdr.cdr.car;e['suffix']=list.cdr.cdr.cdr.cdr.car;e['q']=list.cdr.cdr.cdr.cdr.cdr;r=(((e['ex']==theNil))!=false?(e['prefix']+"null"+e['suffix']):(((e['ex'].cdr==theNil))!=false?TC(TopEnv.get('compile'),list=new Pair(e['ex'].car,new Pair(e['locs'],new Pair(e['tail'],new Pair(e['prefix'],new Pair(e['suffix'],theNil)))))):TC(TopEnv.get('compile-begin'),list=new Pair(e['ex'].cdr,new Pair(e['locs'],new Pair(e['tail'],new Pair((e['prefix']+(((e['q']==theNil))!=false?"(":"")+Apply(TopEnv.get('compile'),new Pair(e['ex'].car,new Pair(e['locs'],theNil)))+","),new Pair(((((e['q']==theNil))!=false?")":"")+e['suffix']),new Pair(true,theNil)))))))));if(r!=theTC||r.f!=this)return r}});
e['compile-apply-list']=new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('locs'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),new Pair(false,new Pair("",new Pair(".ListCopy()",theNil)))))),new Pair(new Pair(getSymbol('string-append'),new Pair("new Pair(",new Pair(new Pair(getSymbol('compile'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(",",new Pair(new Pair(getSymbol('compile-apply-list'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('lst'),theNil)),new Pair(getSymbol('locs'),theNil))),new Pair(")",theNil)))))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['locs']=list.cdr.car;r=(((e['lst'].cdr==theNil))!=false?TC(TopEnv.get('compile'),list=new Pair(e['lst'].car,new Pair(e['locs'],new Pair(false,new Pair("",new Pair(".ListCopy()",theNil)))))):("new Pair("+Apply(TopEnv.get('compile'),new Pair(e['lst'].car,new Pair(e['locs'],theNil)))+","+Apply(TopEnv.get('compile-apply-list'),new Pair(e['lst'].cdr,new Pair(e['locs'],theNil)))+")"));if(r!=theTC||r.f!=this)return r}});
e['compile-lambda-args']=new Lambda(new Pair(getSymbol('args'),new Pair(getSymbol('var'),theNil)),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('args'),theNil)),new Pair("",new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(getSymbol('args'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(getSymbol('args'),theNil)),new Pair("']=",new Pair(getSymbol('var'),new Pair(";",theNil)))))),new Pair(new Pair(getSymbol('string-append'),new Pair("e['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('args'),theNil)),theNil)),new Pair("']=",new Pair(getSymbol('var'),new Pair(".car;",new Pair(new Pair(getSymbol('compile-lambda-args'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('args'),theNil)),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('var'),new Pair(".cdr",theNil))),theNil))),theNil))))))),theNil)))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['args']=list.car;e['var']=list.cdr.car;r=(((e['args']==theNil))!=false?"":((((e['args'])instanceof Symbol))!=false?("e['"+e['args'].name+"']="+e['var']+";"):("e['"+e['args'].car.name+"']="+e['var']+".car;"+Apply(TopEnv.get('compile-lambda-args'),new Pair(e['args'].cdr,new Pair((e['var']+".cdr"),theNil))))));if(r!=theTC||r.f!=this)return r}});
e['compile-extract-children']=new Lambda(new Pair(getSymbol('obj'),getSymbol('c')),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('tmp-name'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('a'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('d'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('quote'),theNil)),theNil))),theNil)),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('lambda'),theNil)),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('tmp-name'),new Pair(new Pair(getSymbol('gen-sym'),theNil),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('clone'),theNil)),new Pair(getSymbol('tmp-name'),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('tmp-name'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('obj'),theNil)),theNil))),new Pair(getSymbol('c'),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define'),theNil)),theNil))),new Pair(new Pair(getSymbol('pair?'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('obj'),theNil)),theNil)),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('tmp-name'),new Pair(new Pair(getSymbol('gen-sym'),theNil),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define'),theNil)),new Pair(new Pair(getSymbol('caadr'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('list'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('clone'),theNil)),new Pair(getSymbol('tmp-name'),theNil))),theNil)))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('tmp-name'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cdadr'),new Pair(getSymbol('obj'),theNil)),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('obj'),theNil)),theNil))),theNil))),new Pair(getSymbol('c'),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('a'),new Pair(new Pair(getSymbol('compile-extract-children'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('obj'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('d'),new Pair(new Pair(getSymbol('compile-extract-children'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('obj'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('a'),theNil)),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('d'),theNil)),theNil))),new Pair(new Pair(getSymbol('append'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('a'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('d'),theNil)),theNil))),theNil))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('obj'),new Pair(getSymbol('c'),theNil))),theNil)))),theNil))))),e,function(list){var r,e=new Env(this.env);while(true){e['obj']=list.car;e['c']=list.cdr;r=(e['tmp-name']=false,e['a']=false,e['d']=false,((((((e['obj'])instanceof Pair))!=false?(isEq(e['obj'].car,getSymbol('quote'))==false):false))!=false?((isEq(e['obj'].car,getSymbol('lambda')))!=false?(e['tmp-name']=Apply(TopEnv.get('gen-sym'),theNil),new Pair(new Pair(getSymbol('clone'),new Pair(e['tmp-name'],theNil)),new Pair(new Pair(e['tmp-name'],e['obj'].cdr),e['c']))):((((isEq(e['obj'].car,getSymbol('define')))!=false?((e['obj'].cdr.car)instanceof Pair):false))!=false?(e['tmp-name']=Apply(TopEnv.get('gen-sym'),theNil),new Pair(new Pair(getSymbol('define'),new Pair(Apply(TopEnv.get('caadr'),new Pair(e['obj'],theNil)),new Pair(new Pair(getSymbol('clone'),new Pair(e['tmp-name'],theNil)),theNil))),new Pair(new Pair(e['tmp-name'],new Pair(Apply(TopEnv.get('cdadr'),new Pair(e['obj'],theNil)),e['obj'].cdr.cdr)),e['c']))):(e['a']=Apply(TopEnv.get('compile-extract-children'),new Pair(e['obj'].car,theNil)),e['d']=Apply(TopEnv.get('compile-extract-children'),new Pair(e['obj'].cdr,theNil)),new Pair(new Pair(e['a'].car,e['d'].car),Apply(TopEnv.get('append'),new Pair(e['a'].cdr,new Pair(e['d'].cdr,theNil))))))):new Pair(e['obj'],e['c'])));if(r!=theTC||r.f!=this)return r}});
e['compile-lambda-obj']=new Lambda(new Pair(getSymbol('args'),new Pair(getSymbol('body'),getSymbol('tt'))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('parent-locs'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('tt'),theNil)),new Pair(false,new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('tt'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ex'),new Pair(new Pair(getSymbol('compile-extract-children'),new Pair(getSymbol('body'),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('ll'),new Pair(false,theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('body'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('not'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil)),theNil)),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('parent-locs'),new Pair(new Pair(getSymbol('compile-make-locals'),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('car'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil))),new Pair(getSymbol('parent-locs'),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('parent-locs'),new Pair(new Pair(getSymbol('compile-make-locals'),new Pair(getSymbol('args'),new Pair(getSymbol('parent-locs'),theNil))),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('ll'),new Pair(new Pair(getSymbol('compile-lambda'),new Pair(getSymbol('args'),new Pair(getSymbol('body'),new Pair(getSymbol('parent-locs'),theNil)))),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair("new Lambda(",new Pair(new Pair(getSymbol('compile-quote'),new Pair(getSymbol('args'),theNil)),new Pair(",",new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('body'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('body'),theNil)),theNil)),new Pair(new Pair(getSymbol('compile-quote'),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('begin'),theNil)),new Pair(getSymbol('body'),theNil))),theNil)),theNil)))),new Pair(",",new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair("e",new Pair(new Pair(getSymbol('apply'),new Pair(getSymbol('string-append'),new Pair("new Env(e)",new Pair(new Pair(getSymbol('map+'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_52_'),theNil)),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil)))),theNil)))),new Pair(",",new Pair(getSymbol('ll'),new Pair(")",theNil)))))))))),theNil))))))))),new Env(e).With('_52_',new Lambda(new Pair(getSymbol('l'),theNil),new Pair(getSymbol('string-append'),new Pair(".With('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('l'),theNil)),theNil)),new Pair("',",new Pair(new Pair(getSymbol('compile-lambda-obj'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('l'),theNil)),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('l'),theNil)),new Pair(getSymbol('parent-locs'),theNil)))),new Pair(")",theNil)))))),e,function(list){var r,e=new Env(this.env);while(true){e['l']=list.car;r=(".With('"+e['l'].car.name+"',"+Apply(TopEnv.get('compile-lambda-obj'),new Pair(e['l'].cdr.car,new Pair(e['l'].cdr.cdr,new Pair(e.parentEnv['parent-locs'],theNil))))+")");if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['args']=list.car;e['body']=list.cdr.car;e['tt']=list.cdr.cdr;r=(e['parent-locs']=(((e['tt']==theNil))!=false?false:e['tt'].car),e['ex']=Apply(TopEnv.get('compile-extract-children'),new Pair(e['body'],theNil)),e['ll']=false,e['body']=e['ex'].car,((((e['ex'].cdr==theNil)==false))!=false?e['parent-locs']=Apply(TopEnv.get('compile-make-locals'),new Pair(Apply(TopEnv.get('map+'),new Pair(TopEnv.get('car'),new Pair(e['ex'].cdr,theNil))),new Pair(e['parent-locs'],theNil))):null),e['parent-locs']=Apply(TopEnv.get('compile-make-locals'),new Pair(e['args'],new Pair(e['parent-locs'],theNil))),e['ll']=Apply(TopEnv.get('compile-lambda'),new Pair(e['args'],new Pair(e['body'],new Pair(e['parent-locs'],theNil)))),("new Lambda("+Apply(TopEnv.get('compile-quote'),new Pair(e['args'],theNil))+","+(((e['body'].cdr==theNil))!=false?Apply(TopEnv.get('compile-quote'),new Pair(e['body'].car,theNil)):Apply(TopEnv.get('compile-quote'),new Pair(new Pair(getSymbol('begin'),e['body']),theNil)))+","+(((e['ex'].cdr==theNil))!=false?"e":Apply(TopEnv.get('string-append'),new Pair("new Env(e)",Apply(TopEnv.get('map+'),new Pair(e.parentEnv['_52_'].clone(e),new Pair(e['ex'].cdr,theNil))).ListCopy())))+","+e['ll']+")"));if(r!=theTC||r.f!=this)return r}});
e['compile-make-locals']=new Lambda(new Pair(getSymbol('lst'),new Pair(getSymbol('parent'),theNil)),new Pair(getSymbol('clone'),new Pair(getSymbol('_53_'),theNil)),new Env(e).With('_53_',new Lambda(new Pair(getSymbol('msg'),new Pair(getSymbol('v'),getSymbol('tt'))),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('e'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(getSymbol('tt'),theNil)),new Pair("e",new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('tt'),theNil)),theNil)))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('msg'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('set!'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('lst'),new Pair(getSymbol('v'),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('msg'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('get'),theNil)),theNil))),new Pair(getSymbol('lst'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('msg'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('add'),theNil)),theNil))),new Pair(new Pair(getSymbol('set!'),new Pair(getSymbol('lst'),new Pair(new Pair(getSymbol('cons'),new Pair(getSymbol('v'),new Pair(getSymbol('lst'),theNil))),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('msg'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('memq'),theNil)),theNil))),new Pair(new Pair(getSymbol('memq'),new Pair(getSymbol('v'),new Pair(getSymbol('lst'),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(getSymbol('msg'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('gen'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('memq'),new Pair(getSymbol('v'),new Pair(getSymbol('lst'),theNil))),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('e'),new Pair("['",new Pair(new Pair(getSymbol('symbol->string'),new Pair(getSymbol('v'),theNil)),new Pair("']",theNil))))),new Pair(new Pair(getSymbol('if'),new Pair(getSymbol('parent'),new Pair(new Pair(getSymbol('parent'),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('gen'),theNil)),new Pair(getSymbol('v'),new Pair(new Pair(getSymbol('string-append'),new Pair(getSymbol('e'),new Pair(".parentEnv",theNil))),theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair("TopEnv.get('",new Pair(new Pair(getSymbol('symbol->string'),new Pair(getSymbol('v'),theNil)),new Pair("')",theNil)))),theNil)))),theNil)))),theNil))),theNil)))),theNil)))),theNil)))),theNil)))),theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['msg']=list.car;e['v']=list.cdr.car;e['tt']=list.cdr.cdr;r=(e['e']=(((e['tt']==theNil))!=false?"e":e['tt'].car),((isEq(e['msg'],getSymbol('set!')))!=false?e.set('lst',e['v']):((isEq(e['msg'],getSymbol('get')))!=false?e.parentEnv['lst']:((isEq(e['msg'],getSymbol('add')))!=false?e.set('lst',new Pair(e['v'],e.parentEnv['lst'])):((isEq(e['msg'],getSymbol('memq')))!=false?TC(TopEnv.get('memq'),list=new Pair(e['v'],new Pair(e.parentEnv['lst'],theNil))):((isEq(e['msg'],getSymbol('gen')))!=false?((Apply(TopEnv.get('memq'),new Pair(e['v'],new Pair(e.parentEnv['lst'],theNil))))!=false?(e['e']+"['"+e['v'].name+"']"):((e.parentEnv['parent'])!=false?TC(e.parentEnv['parent'],list=new Pair(getSymbol('gen'),new Pair(e['v'],new Pair((e['e']+".parentEnv"),theNil)))):("TopEnv.get('"+e['v'].name+"')"))):null))))));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){e['lst']=list.car;e['parent']=list.cdr.car;r=e.parentEnv['_53_'].clone(e);if(r!=theTC||r.f!=this)return r}});
e['compile-lambda']=new Lambda(new Pair(getSymbol('args'),new Pair(getSymbol('body'),new Pair(getSymbol('locs'),theNil))),new Pair(getSymbol('compile-begin'),new Pair(getSymbol('body'),new Pair(getSymbol('locs'),new Pair(true,new Pair(new Pair(getSymbol('string-append'),new Pair("function(list){var r,e=new Env(this.env);while(true){",new Pair(new Pair(getSymbol('compile-lambda-args'),new Pair(getSymbol('args'),new Pair("list",theNil))),new Pair("r=",theNil)))),new Pair(new Pair(getSymbol('string-append'),new Pair(";if(r!=theTC||r.f!=this)return r}}",theNil)),theNil)))))),e,function(list){var r,e=new Env(this.env);while(true){e['args']=list.car;e['body']=list.cdr.car;e['locs']=list.cdr.cdr.car;r=TC(TopEnv.get('compile-begin'),list=new Pair(e['body'],new Pair(e['locs'],new Pair(true,new Pair(("function(list){var r,e=new Env(this.env);while(true){"+Apply(TopEnv.get('compile-lambda-args'),new Pair(e['args'],new Pair("list",theNil)))+"r="),new Pair(";if(r!=theTC||r.f!=this)return r}}",theNil))))));if(r!=theTC||r.f!=this)return r}});
e['eval-compiled']=new Lambda(new Pair(getSymbol('s'),theNil),new Pair(getSymbol('js-eval'),new Pair(new Pair(getSymbol('string-append'),new Pair("var e=TopEnv;",new Pair(getSymbol('s'),theNil))),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['s']=list.car;r=TC(TopEnv.get('js-eval'),list=new Pair(("var e=TopEnv;"+e['s']),theNil));if(r!=theTC||r.f!=this)return r}});
e['compiled']=new Lambda(new Pair(getSymbol('s'),theNil),new Pair(getSymbol('js-invoke'),new Pair(new Pair(getSymbol('get-prop'),new Pair(getSymbol('s'),new Pair("compiled",theNil))),new Pair("toString",theNil))),e,function(list){var r,e=new Env(this.env);while(true){e['s']=list.car;r=TC(TopEnv.get('js-invoke'),list=new Pair(e['s']["compiled"],new Pair("toString",theNil)));if(r!=theTC||r.f!=this)return r}});
e['compile-lib']=new Lambda(theNil,new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('js-eval'),new Pair("document.getElementById('jit').checked=true",theNil)),new Pair(new Pair(getSymbol('js-eval'),new Pair("document.getElementById('echoInp').checked=false",theNil)),new Pair(new Pair(getSymbol('js-eval'),new Pair("document.getElementById('echoRes').checked=false",theNil)),new Pair(new Pair(getSymbol('js-eval'),new Pair("document.getElementById('log').value=''",theNil)),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('lib'),new Pair(new Pair(getSymbol('parse'),new Pair(new Pair(getSymbol('js-eval'),new Pair("document.getElementById('lib').innerHTML",theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('print'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_54_'),theNil)),theNil))),new Pair(new Pair(getSymbol('print'),new Pair("var e=TopEnv",theNil)),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('print-compiled'),new Pair(new Pair(getSymbol('clone'),new Pair(getSymbol('_55_'),theNil)),theNil))),new Pair(new Pair(getSymbol('for-each'),new Pair(getSymbol('print-compiled'),new Pair(getSymbol('lib'),theNil))),theNil)))))))))),new Env(e).With('_54_',new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('display'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('display'),new Pair(getChar(';'),theNil)),new Pair(new Pair(getSymbol('newline'),theNil),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=(Apply(TopEnv.get('display'),new Pair(e['x'],theNil)),Apply(TopEnv.get('display'),new Pair(getChar(';'),theNil)),TC(TopEnv.get('newline'),list=theNil));if(r!=theTC||r.f!=this)return r}})).With('_55_',new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('print'),new Pair(new Pair(getSymbol('compile'),new Pair(getSymbol('x'),theNil)),theNil)),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=TC(e.parentEnv['print'],list=new Pair(Apply(TopEnv.get('compile'),new Pair(e['x'],theNil)),theNil));if(r!=theTC||r.f!=this)return r}})),function(list){var r,e=new Env(this.env);while(true){r=(Apply(TopEnv.get('js-eval'),new Pair("document.getElementById('jit').checked=true",theNil)),Apply(TopEnv.get('js-eval'),new Pair("document.getElementById('echoInp').checked=false",theNil)),Apply(TopEnv.get('js-eval'),new Pair("document.getElementById('echoRes').checked=false",theNil)),Apply(TopEnv.get('js-eval'),new Pair("document.getElementById('log').value=''",theNil)),e['lib']=Apply(TopEnv.get('parse'),new Pair(Apply(TopEnv.get('js-eval'),new Pair("document.getElementById('lib').innerHTML",theNil)),theNil)),e['print']=e.parentEnv['_54_'].clone(e),Apply(e['print'],new Pair("var e=TopEnv",theNil)),e['print-compiled']=e.parentEnv['_55_'].clone(e),TC(TopEnv.get('for-each'),list=new Pair(e['print-compiled'],new Pair(e['lib'],theNil))));if(r!=theTC||r.f!=this)return r}});
e['server']=new Lambda(new Pair(getSymbol('x'),theNil),new Pair(getSymbol('js-invoke'),new Pair(new Pair(getSymbol('js-eval'),new Pair("window.frames.hf",theNil)),new Pair("navigate",new Pair(new Pair(getSymbol('string-append'),new Pair("servlet/db?s=",new Pair(new Pair(getSymbol('encode'),new Pair(new Pair(getSymbol('str'),new Pair(getSymbol('x'),theNil)),theNil)),theNil))),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['x']=list.car;r=TC(TopEnv.get('js-invoke'),list=new Pair(Apply(TopEnv.get('js-eval'),new Pair("window.frames.hf",theNil)),new Pair("navigate",new Pair(("servlet/db?s="+Apply(TopEnv.get('encode'),new Pair(Str(e['x']),theNil))),theNil))));if(r!=theTC||r.f!=this)return r}});
e['transform']=new Lambda(new Pair(getSymbol('ex'),theNil),new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('pair?'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('symbol?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('quote'),theNil)),theNil))),new Pair(getSymbol('ex'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('begin'),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(false,new Pair(new Pair(getSymbol('null?'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('ex'),theNil)),theNil)),theNil)))),new Pair(false,theNil)))),new Pair(new Pair(getSymbol('transform'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),theNil)),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('lambda'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('define'),theNil)),theNil))),new Pair(true,new Pair(new Pair(getSymbol('eq?'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('quote'),new Pair(getSymbol('set!'),theNil)),theNil))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('cadr'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('transform'),new Pair(new Pair(getSymbol('cddr'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil))),theNil))),new Pair(new Pair(getSymbol('begin'),new Pair(new Pair(getSymbol('define'),new Pair(getSymbol('x'),new Pair(new Pair(getSymbol('eval'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),theNil)),theNil))),new Pair(new Pair(getSymbol('if'),new Pair(new Pair(getSymbol('syntax?'),new Pair(getSymbol('x'),theNil)),new Pair(new Pair(getSymbol('transform'),new Pair(new Pair(getSymbol('apply'),new Pair(new Pair(getSymbol('get-prop'),new Pair(getSymbol('x'),new Pair("transformer",theNil))),new Pair(getSymbol('ex'),new Pair(new Pair(getSymbol('get-prop'),new Pair(getSymbol('x'),new Pair("args",theNil))),theNil)))),theNil)),new Pair(new Pair(getSymbol('cons'),new Pair(new Pair(getSymbol('car'),new Pair(getSymbol('ex'),theNil)),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('transform'),new Pair(new Pair(getSymbol('cdr'),new Pair(getSymbol('ex'),theNil)),theNil))),theNil))),theNil)))),theNil))),theNil)))),theNil)))),theNil)))),new Pair(new Pair(getSymbol('map+'),new Pair(getSymbol('transform'),new Pair(getSymbol('ex'),theNil))),theNil)))),new Pair(getSymbol('ex'),theNil)))),e,function(list){var r,e=new Env(this.env);while(true){e['ex']=list.car;r=((((e['ex'])instanceof Pair))!=false?((((e['ex'].car)instanceof Symbol))!=false?((isEq(e['ex'].car,getSymbol('quote')))!=false?e['ex']:((((isEq(e['ex'].car,getSymbol('begin')))!=false?(((e['ex'].cdr==theNil))!=false?false:(e['ex'].cdr.cdr==theNil)):false))!=false?TC(TopEnv.get('transform'),list=new Pair(e['ex'].cdr.car,theNil)):((((isEq(e['ex'].car,getSymbol('lambda')))!=false?true:((isEq(e['ex'].car,getSymbol('define')))!=false?true:isEq(e['ex'].car,getSymbol('set!')))))!=false?new Pair(e['ex'].car,new Pair(e['ex'].cdr.car,Apply(TopEnv.get('map+'),new Pair(TopEnv.get('transform'),new Pair(e['ex'].cdr.cdr,theNil))))):(e['x']=Apply(TopEnv.get('eval'),new Pair(e['ex'].car,theNil)),((((e['x'])instanceof Syntax))!=false?TC(TopEnv.get('transform'),list=new Pair(Apply(e['x']["transformer"],new Pair(e['ex'],e['x']["args"].ListCopy())),theNil)):new Pair(e['ex'].car,Apply(TopEnv.get('map+'),new Pair(TopEnv.get('transform'),new Pair(e['ex'].cdr,theNil))))))))):TC(TopEnv.get('map+'),list=new Pair(TopEnv.get('transform'),new Pair(e['ex'],theNil)))):e['ex']);if(r!=theTC||r.f!=this)return r}});

// added by MH on 14/6/08
e['true'] = true;
e['false'] = false;

// Library end

  ShowEnv = TopEnv = new Env(TopEnv);
  //  showSymbols();
}

//
// Compiler...
//

var theCannot = new Ex("Lambda cannot be compiled")

function Apply(f,args) {

Again: while(true) {

  if( f instanceof Lambda ) {

    if( f.compiled == undefined ) {

     // var jitComp = TopEnv.get('compile-lambda');
      try {
        var jitComp = TopEnv.get('compile-lambda-obj');
      } catch( ee ) { throw theCannot }

      f.compiled = false;
      var expr = new Pair(jitComp,
                 new Pair(new Pair(theQuote,new Pair(f.args,theNil)),
                 new Pair(new Pair(theQuote,new Pair(
                          new Pair(f.body,theNil),theNil)),
                 theNil)));
      try {
        var res = doEval(expr,true);
       // f.compiled = eval("var tmp="+res+";tmp");
        e = f.env; eval("tmp="+res);
        f.compiled = tmp.compiled;
       // Rebuild lambda to change local (lambda())s to (clone)s
        f.body = tmp.body;
        f.env = tmp.env;
      } catch( ex ) { throw ex;
      }
    }
    if( f.compiled == false ) {
     // Back to interpretation...
      try {
        var state = new State(null,null,topCC);
        state.obj = callF(f,args,state);
        while( true ) {
          if( state.Eval(true) ) {
            state.ready = false;
            state.cont();
          }
        }
     // throw theCannot;
      } catch(ex) {
        if( ex instanceof Ex )
          return ex;
        else if( ex instanceof State )
          return ex.obj;
        else
          throw new Ex(ex.description); // throw ex;
      }
    }

    var res = f.compiled(args);
    if( res == theTC ) {
      f = res.f; args = res.args;
      continue Again;
    }
    return res;

  } else if( f instanceof Function ) {

    if( f.FType == undefined ) {
      if( /^\s*function\s*\(\s*(list|)\s*\)/.exec(f) ) f.FType=1;
     // else if( /^\s*function\s*\(list,env\)/.exec(f) ) f.FType=2;
      else f.FType=3;
    }

    if( f.FType == 1 ) return f(args);
/*
    if( f.FType == 2 ) {
      var res = f(args);
      if( res == theTC ) {
        f = res.f; args = res.args;
        continue Again;
      }
      return res;
    }
*/
    throw new Ex("JIT: Apply to invalid function, maybe call/cc");

  } else if( f instanceof Continuation ) {
    throw new State(args,null,f); // Give it to the interpreter
  } else throw new Ex("JIT: Apply to "+Str(f));
}}

// Tail-Calls

function TC(f,args) {
  theTC.f=f; theTC.args=args;
  return theTC;
}

var theTC = new Object();

//
// Interface things...
//

var buf1='';

function key1(srcElement) {
  buf1 = srcElement.value;
}

function key2(srcElement) {
  var buf2 = srcElement.value;
  var re = /(\n|\r\n){2}$/;
  if( !re.test(buf1) && re.test(buf2) ) {
    clickEval(); buf1 = buf2;
  }
}

function checkEdit(srcElement) {
  var e = srcElement, p = new Parser(e.value);
  var o = p.getObject();
  if( o instanceof Pair ) {
    e.parentElement.innerHTML = o.Html();
  }
  while( (m = p.getObject()) != null ) {
    var td = e.parentElement,
        tr = td.parentElement,
        tb = tr.parentElement,
        r0 = tb.rows[0];
    if( tb.rows.length == 1 ) { // horizontal
      var cell = tr.insertCell(td.cellIndex+1);
    } else if( r0.cells.length == 3 ) { // vertical
      r0.cells[0].rowSpan++;
      r0.cells[2].rowSpan++;
      var row = tb.insertRow(tr.rowIndex+1),
          cell = row.insertCell(0);
    } else {
      alert('Error!'); return;
    }
    cell.innerHTML = m.Html();
    cell.onclick = editCell;
    e.value = o.Str();
  }
}

function editCell(event) {
  var i, o = event.srcElement;
  if( o.children.length == 0 && // 2Do: merge subtrees...
      ! /^(\(|\)|)$/.test( o.innerHTML ) ) {
    var inp = document.createElement('input');
    inp.value = o.innerHTML;
    inp.onkeyup = function() { checkEdit(inp) };
    o.innerHTML = '';
    o.appendChild(inp);
    inp.focus();
  }
}

function hv(o) {
  var tr = o.parentElement, tbody = tr.parentElement;

  var isH = tbody.rows.length == 1 && tr.cells.length > 3;
  var isV = tbody.rows.length > 1 && tr.cells.length == 3;
  var isT = tbody.rows.length > 1 && tr.cells.length == 4;

  // 2Do: insert cell - esp. in (), move up/down, etc.

  if( isH /*tr.cells.length > 3*/ ) {
    tr.cells[0].rowSpan = tr.cells.length - 2;
    tr.cells[tr.cells.length-1].rowSpan = tr.cells.length - 2;
    //
    while( tr.cells.length > 3) {
      var cell = tr.cells[2];
/*
      tbody.insertRow().insertCell().innerHTML = cell.innerHTML;
      tr.deleteCell(2);
*/
      tr.removeChild(cell);
      tbody.insertRow().appendChild(cell);
    }
  } else if( isV ) {
    while( tbody.rows.length > 1 ) {
      var cell = tbody.rows[1].cells[0];
/*
      tr.insertCell(tr.cells.length-1).innerHTML = cell.innerHTML;
*/
      tr.insertBefore(cell,tr.cells[tr.cells.length-1]);
      tbody.deleteRow(1);
    }
  }
}

function objType(o) {
  if( isNil(o) ) return 'null';
  if( o instanceof Lambda ) return 'lambda';
  if( o instanceof Pair ) return 'list';
  if( o instanceof Char ) return 'char';
  if( o instanceof Array ) return 'vector';
  if( o instanceof Symbol ) return 'symbol';
  if( o instanceof Continuation ) return 'continuation';
  if( o instanceof Syntax ) return 'syntax';
  return typeof(o);
}

