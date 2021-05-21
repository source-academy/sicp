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
      <span class="title-text-ALSO">Color highlighting:</span><BR/>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:black">Unchanged █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:green">Original █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:blue">Javascript █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:grey">Explanation █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:red">Web-only █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
      <span style="color:orange">Print-only (may have LaTeX) █</span>
      </span>
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
    <a href="..">Back to web edition</a></span>
    </div>`;
  } else if (version == "scheme") {
    // scheme version of the web textbook has yet been developed
    console.log("generate sicp scheme web textook");
  }
};

// `\\\\`' is used to display double back-slash \\ in template literals
export const html_links_part1 = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <!-- Global site tag (gtag.js) - Google Analytics - START -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-156801664-1"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-156801664-1');
    </script>
    <!-- Global site tag (gtag.js) - Google Analytics - END -->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  `;
export const html_links_part2 = (writeTo, toIndexFolder, version) => {
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
	               var cx = ${
                   version == "js" || version == undefined
                     ? '"015760785273492757659:nc_tznrzlsg"'
                     : '"015760785273492757659:fazfpeg5s9m"'
                 };
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
	               searchBox.placeholder= ${
                   version == "js" || version == undefined
                     ? '"search web edition"'
                     : '"search comparison edition"'
                 };
	               searchBox.title= ${
                   version == "js" || version == undefined
                     ? '"search web edition"'
                     : '"search comparison edition"'
                 };
	           }
	         </script>
	         <gcse:search></gcse:search>
         </div>
       </form>
       <span class="navbar-brand-short">
         &nbsp;
         &nbsp;
         <a href="https://source-academy.github.io/source/" title="Go to the Source language(s) definition(s)" class="gray">S</a>
       </span>
       <span class="navbar-brand-long">
         &nbsp;
         &nbsp;
         <a href="https://source-academy.github.io/source/" title="Go to the Source language(s) definition(s)" class="gray">Source</a>
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
      <span class="title-text-AUTHOR">Harold Abelson and Gerald Jay Sussman<br/>with Julie Sussman</span>
      <span class="title-text-TITLE">original authors</span> 
    </div>

    <div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR">Martin Henz and Tobias Wrigstad<br/>with Chan Ger Hean, He Xinyue, Liu Hang, Feng Piaopiao, Jolyn Tan and Wang Qian</span><span class="title-text-TITLE">adapters to JavaScript</span>
    </div>

    <div class="title-text-LICENCE">
<a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow"><img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" style="max-width:100%;"></a>
<p/>
This work is licensed under a <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International License</a>.
     </div>

     <div class="title-text-LICENCE">
<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow"><img src="https://camo.githubusercontent.com/46d38fe6087a9b9bdf7e45458901b818765b8391/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f372f37392f4c6963656e73655f69636f6e2d67706c2e7376672f353070782d4c6963656e73655f69636f6e2d67706c2e7376672e706e67" alt="GPL 3" data-canonical-src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png" style="max-width:100%;"></a>
<p/>
All JavaScript programs in this work are licensed under the
<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow">GNU General Public License Version 3</a>.
     </div>

    <div class="title-text-LICENCE">
<a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow"><img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" style="max-width:100%;"></a>
<p/>
The final version of this work will be published by The MIT Press under a <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International License</a>.
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
