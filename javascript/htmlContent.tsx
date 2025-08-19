import { html } from "hono/html";
import type { WriteBuffer, WriteBufferElement } from "./types.js";
import { JsVersionEdition, JsVersionLegend } from "./versions/js.js";
import { SplitVersionEdition, SplitVersionLegend } from "./versions/split.js";
import Navigation from "./html/Navigation.js";

const shortTitleDefault: WriteBufferElement = `SICP &mdash; JS`;
const longTitleDefault: WriteBufferElement = `Structure and Interpretation of Computer Programs &mdash; Comparison Edition`;
let shortTitle: WriteBufferElement = shortTitleDefault;
let longTitle: WriteBufferElement = longTitleDefault;
let this_edition: WriteBufferElement = `
<div class="title-text-EDITION">
	    <span class="title-text-EDITION">Mobile-friendly Web Edition</span>
	  </div>`;
let legend: WriteBufferElement = `
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
    this_edition = <JsVersionEdition />;
    legend = <JsVersionLegend />;
  } else if (version == "split") {
    shortTitle = `SICP &mdash; Scheme/JS`;
    longTitle = `Structure and Interpretation of Computer Programs &mdash; Comparison Edition`;
    this_edition = <SplitVersionEdition />;
    legend = <SplitVersionLegend />;
  } else if (version == "scheme") {
    // scheme version of the web textbook has yet been developed
    console.log("generate sicp scheme web textook");
  }
};

// `\\\\`' is used to display double back-slash \\ in template literals
export const html_links_part1 = `<!DOCTYPE html><html lang="en">`;

export const html_links_part2 = (
  writeTo: WriteBuffer,
  toIndexFolder: string,
  version: string
) => {
  writeTo.push(`<body>`);
  writeTo.push(<Navigation />);
  writeTo.push(
    html`<span class="navbar-brand-short"
        ><a
          title="Go back to front page"
          href="${toIndexFolder}index.html"
          class="gray"
          >${shortTitle}</a
        ></span
      >
      <span class="navbar-brand-long"
        ><a
          title="Go back to front page"
          href="${toIndexFolder}index.html"
          class="gray"
          >${longTitle}</a
        ></span
      >`
  );
  writeTo.push(`<div class="container scroll">`);
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
