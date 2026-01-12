import { html } from "hono/html";
import type { FC } from "hono/jsx";

const Attribution: FC = () => {
  return html`<div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR"
        >Harold Abelson and Gerald Jay Sussman<br />with Julie Sussman</span
      >
      <span class="title-text-TITLE">original authors</span>
    </div>

    <div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR"
        >Martin Henz and Tobias Wrigstad<br />with Julie Sussman</span
      ><span class="title-text-TITLE">adapters to JavaScript</span>
    </div>

    <div class="title-text-ATTRIBUTION">
      <span class="title-text-AUTHOR"
        >Chan Ger Hean, He Xinyue, Liu Hang, Feng Piaopiao, Jolyn Tan and Wang
        Qian</span
      ><span class="title-text-TITLE">developers of Comparison Edition</span>
    </div>`;
};

export default Attribution;
