SICP Mathematics Rendering in MathJax
===

Introduction
---
The mathematical contents of the web textbook is rendered in [MathJax](http://www.mathjax.org/). 

XSLT will first convert all of the pages into HTML, and leaves the LaTeX present in `book.xml` as it is. MathJax then scans through the entire HTML page and converts these LaTeX into mathematics using either HTML/CSS or SVGs. 

The LaTeX snippets inside HTML are detected by TeX delimiters. These delimiters has to be first defined inside the main HTML page by the following JavaScript code:
```
MathJax.Hub.Config({
  extensions: ["tex2jax.js"],
  jax: ["input/TeX", "output/HTML-CSS"],
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"], ["\\begin{displaymath}", "\\end{displaymath}"] ],
    processEscapes: true,
    processEnvironments: true
  },
  "HTML-CSS": { availableFonts: ["TeX"] }
}); 
```

Since each page is loaded by JavaScript in `DisplayManager.js`, this line of code is added in `DisplayManager.prototype.show``` to ensure that MathJax is run after every chapter loads:
```
// MathJax typeset
MathJax.Hub.Typeset();
```

MathJax is included inside the repository, but it is recommended to use their CDN instead. More information can be found [here](http://docs.mathjax.org/en/latest/start.html#using-the-mathjax-content-delivery-network-cdn)

MathJax in web textbook
---

### HTML/CSS
Pros:

1. Quality HTML/CSS generated on the fly
2. Reduces build time for entire textbook
3. Resizable and highlightable mathematical notations
4. Supported by most browsers, more information can be found [here](http://docs.mathjax.org/en/latest/misc/browser-compatibility.html)

Cons:

1. Slight rendering time on load of webpage
2. Affected by CDN and requires Internet

### SVG
Pros:

1. Quality, resizable mathematical notations
2. Removes the rendering time on client side

Cons:

1. Substandard quality compared to HTML/CSS rendered mathematics
2. Whitespace issues that makes the mathematics look out of alignment
3. Not highlightable
4. Long build process due to PhantomJS

### PNG
Pros:

1. Very few compatability issues
2. Reliable

Cons:

1. Poor quality
2. Does not resize
3. Not highlightable
4. Long build process

Currently, the web textbook has its mathematics rendered in real-time by MathJax on the browser upon visit. 

MathJax in EPUB textbook
---

### HTML/CSS
Pros:

1. Quality HTML/CSS generated on the fly
2. Reduces build time for entire textbook
3. Resizable and highlightable mathematical notations
4. Supported by most browsers, more information can be found [here](http://docs.mathjax.org/en/latest/misc/browser-compatibility.html)

Cons:

1. Slight rendering time on load of webpage
2. Affected by CDN and requires Internet
3. Limited JavaScript support on devices

### SVG
Pros:

1. Quality, resizable mathematical notations
2. Removes the rendering time on client side

Cons:

1. Substandard quality compared to HTML/CSS rendered mathematics
2. Whitespace issues that makes the mathematics look out of alignment
3. Not highlightable
4. Long build process due to PhantomJS

### PNG
Pros:

1. Very few compatability issues
2. Reliable

Cons:

1. Poor quality
2. Does not resize
3. Not highlightable
4. Long build process

Currently, the EPUB textbook has its mathematics pre-rendered by `PhantomJS` and MathJax before compiling into a single EPUB.

**TODO**: Include a table
