const shortTitleDefault = `SICP &mdash; JS`;
const longTitleDefault = `Structure and Interpretation of Computer Programs &mdash; Comparison Edition`;
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
       <span class="title-text-EDITION">Comparison Edition</span>
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
      <span style="color:green">Scheme █</span>
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
    <a href="https://sourceacademy.org/sicpjs">Interactive SICP JS</a></span>
    </div>`;
  } else if (version == "scheme") {
    // scheme version of the web textbook has yet been developed
    console.log("generate sicp scheme web textook");
  }
};

// `\\\\`' is used to display double back-slash \\ in template literals
export const html_links_part1 = `<!DOCTYPE html><html lang="en">`;

export const html_links_part2 = (writeTo, toIndexFolder, version) => {
  writeTo.push(`
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
       <span class="toolt">Legend<span class="toolttext">
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
      <span style="color:green">Scheme █</span>
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
    </div>
</span></span>
       <span class="navbar-brand-short"><a title="Go back to front page" href="${toIndexFolder}index.html" class="gray">${shortTitle}</a></span>
       <span class="navbar-brand-long" ><a title="Go back to front page" href="${toIndexFolder}index.html" class="gray">${longTitle}</a></span>

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
      <span class="title-text-AUTHOR">Martin Henz and Tobias Wrigstad<br/>with Julie Sussman</span><span class="title-text-TITLE">adapters to JavaScript</span>
    </div>

    <div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR">Chan Ger Hean, He Xinyue, Liu Hang, Feng Piaopiao, Jolyn Tan and Wang Qian</span><span class="title-text-TITLE">developers of Comparison Edition</span>
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

export const html_licences = `<div class="title-text-LICENCE">
<a href="http://creativecommons.org/licenses/by-sa/4.0/" rel="nofollow"><img src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" style="max-width:100%;"></a>
<p/>
The text of the original SICP 2nd edition is licensed by Harold Abelson and Gerald Jay Sussman under a <a href="http://creativecommons.org/licenses/by-sa/4.0/" rel="nofollow">Creative Commons Attribution-ShareAlike 4.0
International License</a> (CC BY-SA). The text of the JavaScript adaptation is licensed by Harold Abelson, Gerald Jay Sussman, Martin Henz, and Tobias Wrigstad, also under CC BY-SA. The figures in the JavaScript adaptation are derived from figures created by Andres Raba in 2015 and are licensed by Martin Henz and Tobias Wrigstad, also under CC BY-SA.
     </div>

     <div class="title-text-LICENCE">
<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow"><img src="https://camo.githubusercontent.com/46d38fe6087a9b9bdf7e45458901b818765b8391/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f372f37392f4c6963656e73655f69636f6e2d67706c2e7376672f353070782d4c6963656e73655f69636f6e2d67706c2e7376672e706e67" alt="GPL 3" data-canonical-src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png" style="max-width:100%;"></a>
<p/>
All Scheme programs in this work are licensed by Harold Abelson and Gerald Jay Sussman under the
<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow">GNU General Public License Version 3</a> (GPLv3). All JavaScript programs in this work are licensed by Martin Henz and Tobias Wrigstad, also under GPLv3.
     </div>
`;
