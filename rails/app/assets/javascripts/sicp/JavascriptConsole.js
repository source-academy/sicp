//
// window.Console
//

// getAbsolutePosition is not used

function getAbsolutePosition(element) {
    var r = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
	var tmp = getAbsolutePosition(element.offsetParent);
	r.x += tmp.x;
	r.y += tmp.y;
    }
    return r;
};

window.JavascriptConsole = function (what,name,stmt,evt,factor) {

    this.lineHeight = ((navigator.appName.indexOf("Microsoft")!=-1) ? 20 : 15);

    if (window.opera) {
        this.charWidth = 7.2;
    } else {
        this.charWidth = 8;
    }

    this.codePadding = 10;
    this.textPadding = 20;

    this.svgWidth = (stmt == "svg()") ? 400 : 0;

    this.sicpPath = "";

    window.javascript_statement = stmt;

    if (parseInt(navigator.appVersion)>3) {
        if (navigator.appName.indexOf("Microsoft")!=-1) {
            this._windowWidth = document.body.offsetWidth;
        } else { // (navigator.appName=="Netscape")
            this._windowWidth = window.innerWidth;
        }
    }

    // see book.css: subtract margins on left in px and right 4%
    this._textWidth =
        ((navigator.appName.indexOf("Microsoft")!=-1) ?
	    (this._windowWidth * 0.5) - 210  + 2 * this.textPadding
        : (this._windowWidth * 0.5) - 160 + 2 * this.textPadding);

    var pos = window.JavascriptConsole.find_pos(evt);

    xPos = pos[0];

    yPos = pos[1]+40;

    var lines = Math.min(this._count_lines(what),50);

    this._mainDiv = null;
    this._dragMode = 0;

    this._event = evt;

    this._name = name;

    this._displayString = "";

    var content =
    	'<table class="table table-condensed">' +
    	'<colgroup><col width="50%"/><col width="50%"/></colgroup>' +
    	'<tr>' +
            '<td align="left">' +
            '<button id="'+
    	this._name+'_eval_button">Evaluate</button>' +
    	'</td>' +
            '<td align="right">' +
            '<button onclick="window.JavascriptConsole.close(\''+
            this._name+'\');">Close</button>' +
    	'</td>' +
            '</tr>' +
            '</table>' +
    	'<table class="table table-condensed">' +
    	'<tr>' +
    	(( stmt == "svg()" ) ?
             '<td><embed id="embed_' + this._name + '"' +
    	 ' src="svg/svg.svg" type="image/svg+xml" width="400" height="400"></td>'
    	 : ''
    	)+
    	'<td><textarea class="popupoutput form-control" readonly="true" id="'+
    	this._name+'_result_textarea" cols="'+
            ((this._textWidth - this.svgWidth)* factor / this.charWidth) +
    	'" rows="' +
    	((stmt == "svg()") ? (this.svgWidth)/this.lineHeight : 8) +
    	'">' +
    	'</textarea></td>' +
    	'</tr>' +
            '</table>'
    	;

    this._codeHook = document.getElementById(name+"_div");

    this._mainDiv = document.createElement('div');
    // className especially for IE
    this._mainDiv.setAttribute('className',"popup");
    this._mainDiv.setAttribute('class',"popup");
    this._mainDiv.setAttribute('id',name);
    this._mainDiv.style.position = "absolute";
    //this._mainDiv.style.width = this._textWidth * factor + 2 * this.textPadding;
    this._mainDiv.style.width = this._codeHook.style.width
    this._mainDiv.style.left = xPos + "px";
    this._mainDiv.style.top = yPos + "px";
    this._mainDiv.style.zIndex = 4;

    this._mainDiv.innerHTML =
	   "<div class='popupinner'>" +
	    content +
        "</div>";


    this._codeHook.style.display = "block";
    this._codeHook.style.border = "solid 1px #424242"

    this._codeHook.style.left = (xPos + 20) + "px";
    this._codeHook.style.top = (yPos - 10) + "px";
    this._codeHook.style.zIndex = 5;

    this._codeHook.innerHTML = "";

    this._sourceObject = CodeMirror(this._codeHook, {
    	height: (lines * this.lineHeight + this.codePadding)+'px',
        //width: (this._textWidth * factor)+'px',
        mode: 'javascript',
        lineSeparator: '\n',
        tabMode: "indent",
    	value: what,
    	parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
    	theme: "default",
        // path: "public/codemirror/",
        autoMatchParens: true
    });

    document.body.appendChild(this._mainDiv);

    // Hook mousedown for dragging
    window.Event.addEventListener(this._mainDiv, "mousedown", this,
        window.JavascriptConsole.prototype._drag_mousedown);

    this._resultTextarea = document.getElementById(name+"_result_textarea");

    var evalButton = document.getElementById(name+"_eval_button");
    var self = this;

    evalButton.onclick = function () {
   	    self.eval_javascript(self._name);
    };

    window.latestConsole = this;

    //if (stmt == "svg()") {
    //    this.svg_init();
    //}
}

window.JavascriptConsole.prototype.svg_init = function(s) {

}

window.JavascriptConsole.prototype._count_lines = function(s) {
    var counter = 1;
    for (i=0;i<s.length;i++)
	if (s.charAt(i) == '\n') counter++;
    return counter;
}

window.JavascriptConsole.prototype._get_height_factor = function() {
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

window.JavascriptConsole.prototype._get_height_offset = function() {
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

/********************
 *  Event Handlers  *
 ********************/

window.JavascriptConsole.prototype._close_click = function() {
    document.body.removeChild(this._mainDiv);
}

window.JavascriptConsole.prototype._drag_mousedown = function(evt) {
    this._mainDiv.style.zIndex ++;
    this._codeHook.style.zIndex ++;

    if (window.HTMLTextAreaElement && evt.target instanceof HTMLTextAreaElement) {
	this._dragMode = 0;
	return;
    }

    this._dragMode = 1;

    // Save initial window location
    this._drag_offsetLeft = this._mainDiv.offsetLeft;
    this._drag_offsetTop = this._mainDiv.offsetTop;

    // Save initial codeHook location
    this._drag_offsetLeftCodeHook = this._codeHook.offsetLeft;
    this._drag_offsetTopCodeHook = this._codeHook.offsetTop;

    // Save initial mouse down position
    this._drag_clientX = evt.clientX;
    this._drag_clientY = evt.clientY;

    // Save initial window scroll position
    if(typeof window.scrollY === "number") {
        this._drag_scrollX = window.scrollX;
        this._drag_scrollY = window.scrollY;
    } else if(typeof document.body.scrollTop === "number") {
        this._drag_scrollX = document.body.scrollLeft;
        this._drag_scrollY = document.body.scrollTop;
    }

    // Listen for mousemove and mouseup
    window.Event.addEventListener(document, "mousemove", this,
				  window.JavascriptConsole.prototype._drag_mousemove);
    window.Event.addEventListener(document, "mouseup", this,
				  window.JavascriptConsole.prototype._drag_mouseup);
}

window.JavascriptConsole.prototype._drag_mousemove = function(evt) {
    // Calculate movement delta (from initial mousedown position)
    var dx = evt.clientX - this._drag_clientX;
    var dy = evt.clientY - this._drag_clientY;

    // Adjust for the window scroll
    if(typeof window.scrollX === "number") {
        dx += (window.scrollX - this._drag_scrollX);
        dy += (window.scrollY - this._drag_scrollY);
    } else if(typeof document.body.scrollTop === "number") {
        dx += (document.body.scrollLeft - this._drag_scrollX);
        dy += (document.body.scrollTop - this._drag_scrollY);
    }

    // Do the move (from initial window position)
    switch (this._dragMode) {
    case 1:
        this._mainDiv.style.left = (this._drag_offsetLeft + dx) + "px";
        this._mainDiv.style.top = (this._drag_offsetTop + dy) + "px";
        this._codeHook.style.left = (this._drag_offsetLeftCodeHook + dx) + "px";
        this._codeHook.style.top = (this._drag_offsetTopCodeHook + dy) + "px";
        break;
    case 2:
        var w = this._drag_offsetWidth + dx, h = this._drag_offsetHeight + dy;
        if (w < 100) dx = (w = 100) - this._drag_offsetWidth;
        if (h < 50) dy = (h = 50) - this._drag_offsetHeight;
        this._mainDiv.style.width = w + "px";
        this._mainDiv.style.height = "auto";
        break;
    }

    return false;
}

window.JavascriptConsole.prototype._drag_mouseup = function(evt) {

    window.Event.removeEventListener(document, "mousemove", this,
				     this._drag_mousemove);
    window.Event.removeEventListener(document, "mouseup", this,
				     this._drag_mouseup);
    this._dragMode = 0;

    //	evt.target.style.cursor = "move";

    return false;
}

// from http://www.quirksmode.org/js/findpos.html

window.JavascriptConsole.find_pos = function(e) {
    var curtop = 0;
    var curleft = 0;
    var obj = e.target ? e.target : e.srcElement;

    if (obj && obj.offsetParent) {

    	do {
	    curleft += obj.offsetLeft;
	    curtop += obj.offsetTop;

	} while (obj = obj.offsetParent);
    }

    return [curleft,curtop];

}

window.JavascriptConsole.prototype.eval_javascript = function(nam) {
    window.name = nam;
    var svgdoc = null;

/*
    try {
	var embed = document.getElementById('embed_'+nam);
	svgdoc = embed.getSVGDocument();
    var svgobj = svgdoc.getElementById('outer-svg');
    var svgNS = "http://www.w3.org/2000/svg";
    var xlinkNS = "http://www.w3.org/1999/xlink";
    var newRect = document.createElementNS(svgNS,"rect");
    newRect.setAttributeNS(null,"width", 400);
    newRect.setAttributeNS(null,"height", 400);
    newRect.setAttributeNS(null,"x", 0);
    newRect.setAttributeNS(null,"y", 0);
    newRect.setAttributeNS(null,"fill","#dddddd");
    svgobj.appendChild(newRect);
    }
    catch(exception) {
	// ignore errors
    }
*/

    try {
        with (window) {
	           window.make_painter_from_url = function(url) {
                   return function(frame) {
                       var x0=frame[0][0];
		               var y0=frame[0][1];
                       var x1=frame[1][0][0];
                       var y1=frame[1][0][1];
                       var x2=frame[1][1][0][0];
                       var y2=frame[1][1][0][1];

		               var svgdoc = null;

                       var embed = document.getElementById('embed_'+name);

		               try {
                           svgdoc = embed.getSVGDocument();
		               } catch(exception) {
                           alert('error: embed: '+embed);
                           alert('error: svgdoc: '+svgdoc);
                       }

                       var svgobj = svgdoc.getElementById('outer-svg');
                       //svgobj.setAttribute("viewBox", "0 0 400 400");
                       //svgobj.setAttribute("width",400);
                       //svgobj.setAttribute("height",400);
                       var svgNS = "http://www.w3.org/2000/svg";
                       var xlinkNS = "http://www.w3.org/1999/xlink";

                       var newTransform = document.createElementNS(svgNS,"g");
                       var matrix_string = "matrix("+x1+","+(-1)*y1+","+
                            (-1)*x2+","+y2+","+400*(x0+x2)+","+400*(1-y0-y2)+")";

                       newTransform.setAttributeNS(null,"transform",matrix_string);
                       svgobj.appendChild(newTransform);

                       var newPict = document.createElementNS(svgNS,"image");
                       newPict.setAttributeNS(null,"x",0);
                       newPict.setAttributeNS(null,"y",0);
                       newPict.setAttributeNS(null,"width",400);
                       newPict.setAttributeNS(null,"height",400);
                       newPict.setAttributeNS(xlinkNS,"href",url);
                       //newPict.setAttributeNS(null, "viewBox", "0 0 400 400");
                       newTransform.appendChild(newPict);
                   };
               // make_painter_from_url()
               };
               // Wave & Rogers are not snippets but required as snippets
               window.wave = make_painter_from_url(
                   "http://www.comp.nus.edu.sg/~henz/sicp/img_original/my_wave.png");
               window.rogers = make_painter_from_url(
                "http://www.comp.nus.edu.sg/~henz/sicp/img_original/ch2-Z-G-30.gif");
               window.result = window.eval(this._sourceObject.getValue());
           }
           toShow = this.format(window.result);
       } catch ( ee ) {
	       toShow = 'Exception: '+ ee;
       }
    this.display(toShow);
}

window.JavascriptConsole.prototype.display = function(toShow) {
    this._displayString = this._displayString + '\n' + toShow + '\n';
    this._resultTextarea.value = this._displayString;
    this._resultTextarea.scrollTop = this._resultTextarea.scrollHeight;
}

window.JavascriptConsole.close = function(name) {
    document.body.removeChild(document.getElementById(name));
    var codeHook = document.getElementById(name+"_div");
    codeHook.style.display = "none";
}

// format: JavaScript value to string
// limit the recursion so that circularity does
// not lead to runtime errors
window.JavascriptConsole.prototype.format = function(x) {
    return this._format_it(x,10);
}

window.JavascriptConsole.prototype._format_it = function(x,d) {
    if (d == 0) return "...";
    if ( x == undefined || x == null || typeof x == "number"
	 || typeof x == "boolean" ) return x;
    else if (typeof x == "string") { var s = '"' + x + '"'; return s; }
    else if (typeof x == "object")
	if (x.tag == "exit") { return "";}
    else if (x instanceof Array) return this._format_array(x,d-1);
    else return this._format_object(x,d-1);
    else if (typeof x == "function")
	return x.toString();
}

window.JavascriptConsole.prototype._format_array = function(x,d) {
    var l = x.length;
    var s = "";
    for (var i = 0; i < l-1; i++)
	s += this._format_it(x[i],d) + ",";
    if (l > 0) s += this._format_it(x[l-1],d);
    return "[" + s + "]";
}

window.JavascriptConsole.prototype._format_object = function(x,d) {
    var s = "";
    for (var prop in x)
	s += prop + ":" + this._format_it(x[prop],d) + ",";
    return "{" + s.substring(0,s.length-1) + "}";
}
