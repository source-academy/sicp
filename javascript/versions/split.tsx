import { html } from "hono/html";
import type { FC } from "hono/jsx";

export const SplitVersionEdition: FC = () => {
  return html`<div class="title-text-EDITION">
    <span class="title-text-EDITION">Comparison Edition</span>
  </div>`;
};

export const SplitVersionLegend: FC = () => {
  return html`<div class="title-text-ALSO">
      <span class="title-text-ALSO">Color highlighting:</span><br />
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
        <a href="https://sourceacademy.org/sicpjs">Interactive SICP JS</a></span
      >
    </div>`;
};
