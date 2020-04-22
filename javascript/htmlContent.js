import { write } from "fs-extra";

const shortTitleDefault = `SICP &mdash; JS`;
const longTitleDefault = `Structure and Interpretation of Computer Programs &mdash; JavaScript Adaptation`;
let shortTitle = shortTitleDefault;
let longTitle = longTitleDefault;
let this_edition = `
<div class="title-text-EDITION">
	    <span class="title-text-EDITION">Mobile-friendly Web Edition</span>
	  </div>`;
let legend = `
<div class="title-text-ALSO">
  <span class="title-text-ALSO">also available</span><BR/>
</div>
<div class="title-text-OTHEREDITIONS">
  <span class="title-text-OTHEREDITIONS">
<a href="sicpjs.pdf">PDF edition</a></span>
</div>
<div class="title-text-OTHEREDITIONS">
  <span class="title-text-OTHEREDITIONS">
<a href="sicpjs.epub">E-book edition</a></span>
<div class="title-text-OTHEREDITIONS">
  <span class="title-text-OTHEREDITIONS">
<a href="split">Comparison edition</a></span>
</div>`;

export const switchTitle = version => {
  if (version == "js") {
    shortTitle = shortTitleDefault;
    longTitle = longTitleDefault;
    this_edition = `
    <div class="title-text-EDITION">
       <span class="title-text-EDITION">Mobile-friendly Web Edition</span>
    </div>`;
    legend = `
    <div class="title-text-ALSO">
      <span class="title-text-ALSO">also available</span><BR/>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="sicpjs.pdf">PDF edition</a></span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="sicpjs.epub">E-book edition</a></span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="split">Comparison edition</a></span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="sicpjs.zip">All programs zipped</a></span>
    </div>`;
  } else if (version == "split") {
    shortTitle = `SICP &mdash; Scheme/JS`;
    longTitle = `Structure and Interpretation of Computer Programs &mdash; Comparison Edition`;
    this_edition = `
    <div class="title-text-EDITION">
       <span class="title-text-EDITION">Scheme-JavaScript Comparison Edition</span>
    </div>`;
    legend = `
    <div class="title-text-ALSO">
      <span class="title-text-ALSO">Differences highlighted in</span><BR/>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:teal">Original █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:blue">Javascript █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="..">Back to web edition</a></span>
    </div>`;
  } else if (version == "scheme") {
    // scheme version of the web textbook has yet been developed
    console.log("generate sicp schceme web textook");
  }
};

// `\\\\`' is used to display double back-slash \\ in template literals
export const html_links_part1 = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  `;
export const html_links_part2 = (writeTo, toIndexFolder) => {
  writeTo.push(`
  <meta name="csrf-param" content="authenticity_token" />
  <meta name="csrf-token" content="EMTEijVc2kiiKUH4nYH0lQG3pLPfMowQ/Stg//t6DCo0e5pWMQwamnTvIdmVZqY/MqSx2IYYE+2bpNV6UNSMwQ==" />

    <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
    -->
    <link href="https://fonts.googleapis.com/css?family=Inconsolata&display?swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Droid+Sans|Droid+Serif" rel="stylesheet">
    <link rel="stylesheet" media="all" href="${toIndexFolder}assets/stylesheet.css" />

   <link rel="shortcut icon" type="image/x-icon" href="${toIndexFolder}assets/favicon.ico" />

<!--    <link rel="shortcut icon" type="image/png" href="${toIndexFolder}images/lambda.png" /> -->

    <!-- for support of progressive web app, see github README, DISABLED!
    <link rel="manifest" href="${toIndexFolder}static/manifest.json">
    -->

    <script src="https://code.jquery.com/jquery-3.2.1.min.js" 
		     	  integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
	          crossorigin="anonymous">
    </script> 

    <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js"></script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
    
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script> -->
    <script type="text/javascript" 
      src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-AMS-MML_HTMLorMML-full">
    </script>
   <!--  <script type="text/javascript" 
      src="${toIndexFolder}MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML-full">
    </script> -->
  
    <script src="${toIndexFolder}assets/application.js"></script>
  
    <!-- Rendering inline LaTeX -->
    <script type="text/x-mathjax-config">
      MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [ ['$','$'], ["\\\\(","\\\\)"] ],
          processEscapes: true,
          jax: ["input/TeX","output/HTML-CSS"]
        }
      });
    </script>
    <!--<script src="/mathjax/MathJax.js?config=TeX-AMS_HTML-full.js" type="text/javascript"></script>-->
    <!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.min.js" type="text/javascript"></script>
    <![endif]-->
  </head>
  <body>

    
    <!-- support for progressive web app, see README, DISABLED
    <script>
      if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
          navigator.serviceWorker.register("../sw.js").then(function(reg) {
              console.log("Service worker has been registered for scope: " + reg.scope);
          });
      }
    </script>
    -->

     <nav class="navbar navbar-expand-sm navbar-dark bg-dark fixed-top justify-content-between">
       <button id="btn" class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#nav-sidebar" aria-controls="nav-sidebar" aria-expanded="false" aria-label="Toggle navigation" title="navigation">
         <span class="navbar-toggler-icon"></span>
       </button>
       <span class="navbar-brand-short"><a title="Go back to front page" href="${toIndexFolder}index.html" class="gray">${shortTitle}</a></span>
       <span class="navbar-brand-long" ><a title="Go back to front page" href="${toIndexFolder}index.html" class="gray">${longTitle}</a></span>

       <!-- edit the search engine by visiting: 
	    https://cse.google.com/cse/setup/basic?cx=015760785273492757659:nc_tznrzlsg 
	       -->
       <form class="form-inline ml-auto" id="xxx">
         <div id="search-box">
	         <script>
	           (function() {
	               var cx = "015760785273492757659:nc_tznrzlsg";
	               var gcse = document.createElement("script");
	               gcse.type = "text/javascript";
	               gcse.async = true;
	               gcse.src = "https://cse.google.com/cse.js?cx=" + cx;
	               var s = document.getElementsByTagName("script")[0];
	               s.parentNode.insertBefore(gcse, s);
	           })();
	           window.onload = function()
	           { 
	               var searchBox =  document.getElementById("gsc-i-id1");
	               searchBox.placeholder="search web edition";
	               searchBox.title="search web edition"; 
	           }
	         </script>
	         <gcse:search></gcse:search>
         </div>
       </form>
       <span class="navbar-brand-short">
         &nbsp;
         &nbsp;
         <a href="https://sicp.comp.nus.edu.sg/source/" title="Go to the Source language(s) definition(s)" class="gray">S</a>
       </span>
       <span class="navbar-brand-long">
         &nbsp;
         &nbsp;
         <a href="https://sicp.comp.nus.edu.sg/source/" title="Go to the Source language(s) definition(s)" class="gray">Source</a>
       </span>
     </nav>
     
     <div class="container scroll">

     `);
};

export const indexPage = writeTo => {
  writeTo.push(`
  <TABLE class="tight">
	<TD  class="tight" width="70%" valign="top" align="right">
          <img class="tight" src="./sicp.png"
	       height="auto" width="100%">
	</TD>
	<TD  class="tight" width="30%" valign="top" align="left">
	  ${this_edition}
	  <span style="vertical-align:-77%"/>
	  <BR/>
	  ${legend}
	</TD>
      </TR>
    </TABLE>
    
    <div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR">Martin Henz and Tobias Wrigstad<br/>with Chan Ger Hean, He Xinyue, Liu Hang, Feng Piaopiao, Jolyn Tan and Wang Qian</span> <span class="title-text-TITLE">adapters to JavaScript</span>
    </div>

    <div class="title-text-ATTRIBUTION">
      <span class="title-text-TITLE">original textbook by</span> <span class="title-text-AUTHOR">Harold Abelson and Gerald Jay Sussman<br/>with Julie Sussman</span>
    </div>

    `);
};

export const beforeContentWrapper = `<div id='permalink-msg'>
<div class='screen'>
  <div class='alert alert-success'>
    <strong>Permalink copied!</strong>
  </div>
</div>
</div>
<div class='chapter-content'>
`;
