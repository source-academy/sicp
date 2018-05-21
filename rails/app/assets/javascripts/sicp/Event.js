//
// tc.platform.browser.Event
//

window.Event = function(evt)
{
    if(evt){
        this.srcEvent = evt;
        this.keyCode = evt.keyCode;
        this.charCode = evt.charCode;
        this.target = evt.target;
    } else{
        this.srcEvent = window.event;
        this.keyCode = window.event.keyCode;
        this.charCode = window.event.keyCode;
        this.target = window.event.srcElement;
    }
    this.clientX = this.srcEvent.clientX;
    this.clientY = this.srcEvent.clientY;

    return this;
};

window.Event.addEventListener = function(node, eventname, obj, fn)
{
    if(node.addEventListener) {
        var wrapperfn = function(e) {
            var e = new window.Event(e);
            return fn.apply(obj, [ e, node ]);
        };
        fn.wrapper = wrapperfn;
        node.addEventListener(eventname, wrapperfn, false);
    } else if(node.attachEvent) {
        var wrapperfn = function() {
            var e = new window.Event();
            return fn.apply(obj, [ e, node ]);
        };
        fn.wrapper = wrapperfn;
        node.attachEvent("on" + eventname, wrapperfn);
    } else {
        // write emulation
    }
};

window.Event.removeEventListener = function(node, eventname, obj, fn)
{
    if(node.removeEventListener) {
        node.removeEventListener(eventname, fn.wrapper, false);
    } else if(node.detachEvent) {
        node.detachEvent("on" + eventname, fn.wrapper);
    } else {
        // write emulation
    }
};
