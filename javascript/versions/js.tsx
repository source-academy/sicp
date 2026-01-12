import { html } from "hono/html";
import type { FC } from "hono/jsx";

export const JsVersionEdition: FC = () => {
  return html`<div class="title-text-EDITION">
    <span class="title-text-EDITION">Mobile-friendly Web Edition</span>
  </div>`;
};

export const JsVersionLegend: FC = () => {
  return html`<div class="title-text-ALSO">
      <span class="title-text-ALSO">also available</span><br />
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
        <a href="split">Comparison edition</a></span
      >
    </div>
    <div class="title-text-OTHEREDITIONS">
      <span class="title-text-OTHEREDITIONS">
        <a href="sicpjs.zip">All programs zipped</a></span
      >
    </div>`;
};
