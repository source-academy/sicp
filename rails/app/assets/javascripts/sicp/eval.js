// communication of data between the main pages and
// the popup windows turned out to be tricky, because
// Opera does not allow attaching fields to the created
// window.

// roughly:
// all browsers except IE get their data from the name
// (key-data pairs separated by escape characters).
// IE is picky about characters in the name, so the
// data is attached to the window object.

function getHeightFactor() {
    return (window.XMLHttpRequest) ?
	(
	 (window.ActiveXObject) ?
	 // IE 7
	 17
	 :
	 // Opera, Safari, Firefox
	 14
	 )
	:
	//IE 6 and below
	15
	;
}

function getHeightOffset() {
    return (window.XMLHttpRequest) ?
	(
	 (window.ActiveXObject) ?
	 // IE 7
	 300
	 :
	 // Opera, Safari, Firefox
	 250
	 )
	:
	//IE 6 and below
	285
	;
}

function onMouseOver(obj) {
    obj.style.cursor='pointer';
}

function onMouseOverImg(obj) {
    obj.style.cursor='pointer';
    obj.style.border='solid thin';
    obj.style.borderColor='red';
}

function countLines(s) {
    var counter = 0;
    for (i=0;i<s.length;i++)
	if (s.charAt(i) == '\n') counter++;
    return counter;
}

// format: JavaScript value to string
// limit the recursion so that circularity does
// not lead to runtime errors
function format(x) {
    return formatIt(x,10);
}

function formatIt(x,d) {
    if (d == 0) return "...";
    if ( x == undefined || x == null || typeof x == "number" || typeof x == "boolean" ) return x;
    else if (typeof x == "string") { var s = '"' + x + '"'; return s; }
    else if (typeof x == "object")
        if (x.tag == "exit") { return "";}
	else if (x instanceof Array) return formatArray(x,d-1);
        else return formatObject(x,d-1);
    else if (typeof x == "function")
	return x.toString();
}

function formatArray(x,d) {
    var l = x.length;
    var s = "";
    for (var i = 0; i < l-1; i++)
	s += formatIt(x[i],d) + ",";
    if (l > 0) s += formatIt(x[l-1],d);
    return "[" + s + "]";
}

function formatObject(x,d) {
    var s = "";
    for (var prop in x)
	s += prop + ":" + formatIt(x[prop],d) + ",";
    return "{" + s.substring(0,s.length-1) + "}";
}

function evalScheme(where,what,accumulating) {
    theText = where;
    if (!window[where]) window[where] = '';
    if (!accumulating) {
	if (document['form_'+where].resultScheme.style.display == "none")
	    document['form_'+where].resultScheme.style.display = "";
	else document['form_'+where].resultScheme.style.display = "none";
	if (document['form_'+where].buttonScheme.style.display == "none")
	    document['form_'+where].buttonScheme.style.display = "";
	else document['form_'+where].buttonScheme.style.display = "none";
    }

    try {
	var output = schemeEval(what);
	window[where]
	    = (accumulating)
	    ? window[where] + '\n' + output + '\n'
	    : output;
	document['form_'+where].resultScheme.value
	    = window[where];
	document['form_'+where].resultScheme.scrollTop
	    = document['form_'+where].resultScheme.scrollHeight;
    } catch ( ee ) {
	var toShow = 'Error: ' + ee.Content();
	window[where]
	    = (accumulating)
	    ? window[where] + toShow + '\n'
	    : toShow;
	document['form_'+where].resultScheme.value
	    = window[where];
	document['form_'+where].resultScheme.scrollTop
	    = document['form_'+where].resultScheme.scrollHeight;
    }
};

var evalLib = {
    localEval: function (what) {
	window.what = what;
	with (window) {
	    window.result = window.eval(what); };
	return window.result;
    }
}

function evalJavaScript(where,what,accumulating) {
	theText = where;
	if (!window[where]) window[where] = '';
	if (!accumulating) {
	    if (document['form_'+where].resultJavaScript.style.display == "none")
		document['form_'+where].resultJavaScript.style.display = "";
	    else document['form_'+where].resultJavaScript.style.display = "none";
	    if (document['form_'+where].buttonJavaScript.style.display == "none")
		document['form_'+where].buttonJavaScript.style.display = "";
	    else document['form_'+where].buttonJavaScript.style.display = "none";
	}
	try {       var result;

	    var toShow = // (result==undefined && !accumulating)
		// ? 'Evaluation completed'
		//:
		format(evalLib.localEval(what));
	    window[where]
		= (accumulating)
		? window[where] + '\n' + toShow + '\n'
		: toShow;
	    document['form_'+where].resultJavaScript.value
		= window[where];
	    document['form_'+where].resultJavaScript.scrollTop
		= document['form_'+where].resultJavaScript.scrollHeight;
	} catch ( ee ) {
	    var toShow = 'Exception: '+ ee;
	    window[where]
		= (accumulating)
		? window[where] + toShow + '\n'
		: toShow;
	    document['form_'+where].resultJavaScript.value
		= window[where];
	    document['form_'+where].resultJavaScript.scrollTop
		= document['form_'+where].resultJavaScript.scrollHeight;
	}
}


function generateSchemeContent() {
    // once we get to execute this on IE, document.all
    // is there. Do the following for IE, and do the
    // else part for all other browsers.
    if (document.all) {
	var what = window.what;
	var where = window.where;
	var lines = window.lines;
	window.document.body.innerHTML =
	    'Scheme expression from Section '+
	    window.section +
	    '; click "Eval" to evaluate it.' +
	    '<form name="form_'+where+'">' +
	    '<table>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="source" rows="' +
	    lines +
	    '" cols="80">' +
	    what +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonScheme" type="button" value="Eval" onclick="evalScheme(\''+
	    where +
	    '\',document.form_'+where+'.source.value,true)">' +
	    '</input>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="resultScheme" readonly="true" rows="8" cols="80">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '</table>' +
	    '</form>'
	    ;
	schemeInit();
    } else {
	// retrieve URL arguments, which serve
	// to pass content data to the window.
	// (see comment on Opera under popupScheme)
	var args = getArgs(window);
	var section = args.section;
	var where = args.where;
	var what = args.what;
	var lines = parseInt(args.lines);

	window.scheme_statement = args.scheme_statement;

	window.document.body.innerHTML =
	    'Scheme expression from Section '+
	    section +
	    '; click "Eval" to evaluate it.' +
	    '<form name="form_'+where+'">' +
	    '<table>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="source" spellcheck="false" rows="' +
	    lines +
	    '" cols="80">' +
	    what +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonScheme" type="button" value="Eval" onclick="evalScheme(\''+
	    where +
	    '\',document.form_'+where+'.source.value,true)">' +
	    '</input>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="resultScheme" readonly="true" rows="8" cols="80">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '</table>' +
	    '</form>'
	    ;
	schemeInit();
    }
}

// The following characters are used as escape characters
// in order to separate arguments. Hopefully, they do not
// appear in any Scheme or JavaScript programs in the book.

var escape1 = "@";
var escape2 = "^";

// Note the trick to open an empty page first,
// and then have that page call generateSchemeContent().
// If the content is placed into innerHtml immediately,
// Firefox 2.0 will not display it.

// we pass relevant data as URL arguments;
// Opera does not preserve window attributes as in "win.lines = lines"

function popupScheme(where,what,section,stmt) {

    if (document.all) {
	var lines = countLines(what);
	var win = window.open("html_scheme/emptyScheme.html", "Evaluator_"+where,
			      "width=710,height="+((lines*getHeightFactor())+getHeightOffset())+",scrollbars=yes");
	win.where = where;
	win.what = what;
	win.lines = lines;
	win.section = section;
	win.scheme_statement = stmt;
    } else {
	var lines = countLines(what);
	var heightOffset = getHeightFactor();
	var win = window.open("html_scheme/emptyScheme.html",
			      "lines"+escape2+lines+
			      escape1+"where"+escape2+where+
			      escape1+"what"+escape2+what+
			      escape1+"section"+escape2+section+
			      escape1+"scheme_statement"+escape2+stmt,
			      "width=710"+
			      ",height="+((lines*getHeightFactor())+
					  getHeightOffset())+
			      ",scrollbars=yes");
    }
}


// get data from name of window; modified
// from JavaScript Definitive Guide, page 214
function getArgs(win) {
    var args = new Object();
    var query = win.name;
    var pairs = query.split(escape1);
    for (var i = 0; i < pairs.length; i++) {
	var pos = pairs[i].indexOf(escape2);
	if (pos == -1) continue;
	var argname = pairs[i].substring(0,pos);
	var value = pairs[i].substring(pos+1);
	args[argname] = value;
    }
    return args;
}

function generateJavaScriptContent() {
    // once we get to execute this on IE, document.all
    // is there. Do the following for IE, and do the
    // else part for all other browsers.
    if (document.all) {

	window.document.body.innerHTML =
	    'JavaScript expression from Section '+
	    window.section +
	    '; click "Eval" to evaluate it.' +
	    '<form name="form_'+window.where+'">' +
	    '<table>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="source" rows="' +
	    (window.lines+1) +
	    '" cols="80">' +
	    window.what +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonJavaScript" type="button" value="Eval" onclick="evalJavaScript(\''+
	    window.where +
	    '\',document.form_'+window.where+'.source.value,true)">' +
	    '</input>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea readonly="true" name="resultJavaScript" rows="8" cols="80">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="grammar" style="display:none;" rows="40" cols="120">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonGrammar" style="display:none;" type="button" value="Load Grammar" onclick="load_grammar(\'' + window.where + '\')"></input>' +
	    '</td>' +
	    '</tr>' +
	    '</table>' +
	    '</form>'
	    ;
    } else {
        window.latestConsole.display("other browsers: eval");
	// retrieve data from window name, a trick
	// to pass content data to the window.
	// (see comment on Opera under popupJavaScript)
	var args = getArgs(window);
	var section = args.section;
	var where = args.where;
	var what = args.what;
	var lines = parseInt(args.lines);

	window.javascript_statement = args.javascript_statement;

	window.document.body.innerHTML =
	    'JavaScript expression from Section '+
	    section +
	    '; click "Eval" to evaluate it.' +
	    '<form name="form_'+where+'">' +
	    '<table>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="source" spellcheck="false" rows="' +
	    (lines+1) +
	    '" cols="80">' +
	    what +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonJavaScript" type="button" value="Eval" onclick="evalJavaScript(\''+
	    where +
	    '\',document.form_'+where+'.source.value,true)">' +
	    '</input>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea readonly="true" name="resultJavaScript" rows="8" cols="80">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<textarea name="grammar" style="display:none;" rows="40" cols="120">' +
	    '</textarea>' +
	    '</td>' +
	    '</tr>' +
	    '<tr>' +
	    '<td>' +
	    '<input name="buttonGrammar" style="display:none;" type="button" value="Load Grammar" onclick="load_grammar(\'' + where + '\')"></input>' +
	    '</td>' +
	    '</tr>' +
	    '</table>' +
	    '</form>'
	    ;
    }
}

// Note the trick to open an empty page first,
// and then have that page call generateJavaScriptContent().
// If the content is placed into innerHtml immediately,
// Firefox 2.0 will not display it.

// We pass relevant data in the name. This works in all browsers,
// whereas Opera does not preserve window attributes as in "win.lines = lines"

function popupJavaScript(where,what,section,stmt) {

    if (document.all) {

	var lines = countLines(what);
	var heightOffset = getHeightFactor();
	var win = window.open("emptyJavaScript.html", "Evaluator_"+where,
			      "width=710,height="+((lines*getHeightFactor())+getHeightOffset())+",scrollbars=yes");
	win.lines = lines;
	win.where = where;
	win.what = what;
	win.section = section;
	win.javascript_statement = stmt;
    } else {
	var lines = countLines(what);
	var heightOffset = getHeightFactor();
	var win = window.open("emptyJavaScript.html",
			      "lines"+escape2+lines+
			      escape1+"where"+escape2+where+
			      escape1+"what"+escape2+what+
			      escape1+"section"+escape2+section+
			      escape1+"javascript_statement"+escape2+stmt,
			      "width=710"+
			      ",height="+((lines*getHeightFactor())+
					  getHeightOffset())+
			      ",scrollbars=yes");
    }
}
