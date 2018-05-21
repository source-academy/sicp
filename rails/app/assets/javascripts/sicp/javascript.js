
function pair(x,xs) {
    return [x,xs];
}

function is_pair(x) {
    return x instanceof Array && x.length == 2;
}

function head(xs) {
    return xs[0];
}

function tail(xs) {
    return xs[1];
}

function is_list(xs) {
    return is_empty_list(xs) || (tail(xs) !== undefined && is_list(tail(xs)));
}

function list() {
    var the_list = [];
    for (var i = arguments.length - 1; i >= 0; i--)
	the_list = pair(arguments[i],the_list);
    return the_list;
}


function array_test(x) {
    if (this.Array.isArray === undefined) {
	return x instanceof Array;
    } else {
	return Array.isArray(x);
    }
}

function is_empty_list(xs) {
    if (array_test(xs)) {
        if  (xs.length === 0) {
            return true; }
        else if (xs.length === 2) {
            return false; }
        else {
	    return false;
        }
    } else {
	return false;
    }
}

function is_number(xs) {
    return typeof xs == "number";
}

function is_string(xs) {
    return typeof xs == "string";
}

function length(xs) {
    return  (is_empty_list(xs)) ? 0 : 1 + length(tail(xs));
}

function apply(f,xs) {
    var args = [];
    var len = length(xs);
    for (var i=0; i < len; i++) {
       args[i] = head(xs);
       xs = tail(xs);
    }
    return f.apply(f,args);
}

function map(f) {
   if (is_empty_list(arguments[1])) return [];
   else {
      var f = arguments[0];
      var f_args = [];
      var map_args = [f];
      for (var i=1; i < arguments.length; i++) {
          f_args[i-1] = head(arguments[i]);
          map_args[i] = tail(arguments[i]);
      }
      return pair(f.apply(f,f_args),map.apply(map,map_args));
   }
}

function display(x) {
    print(format(x));
}

function print(x) {
    window.latestConsole.display(x);
    return undefined;
}

function newline() { 
    print('');
    return;
}

function runtime() {
    var d = new Date();
    return d.getTime();
}

function error(x) {
    var output_string = x;
    for (var i=1; i < arguments.length; i++)
	output_string = output_string + " " + format(arguments[i]);
    alert(output_string);
    return 
}
