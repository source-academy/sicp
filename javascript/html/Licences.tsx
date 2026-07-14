import { html } from "hono/html";
import type { FC } from "hono/jsx";

const Licences: FC = () => {
  return html`<div class="title-text-LICENCE">
      <a href="http://creativecommons.org/licenses/by-sa/4.0/" rel="nofollow"
        ><img
          src="https://licensebuttons.net/l/by-sa/4.0/88x31.png"
          style="max-width:100%;"
      /></a>
      <p />
      The text of the original SICP 2nd edition is licensed by Harold Abelson
      and Gerald Jay Sussman under a
      <a href="http://creativecommons.org/licenses/by-sa/4.0/" rel="nofollow"
        >Creative Commons Attribution-ShareAlike 4.0 International License</a
      >
      (CC BY-SA). The text of the JavaScript adaptation is licensed by Harold
      Abelson, Gerald Jay Sussman, Martin Henz, and Tobias Wrigstad, also under
      CC BY-SA. The figures in the JavaScript adaptation are derived from
      figures created by Andres Raba in 2015 and are licensed by Martin Henz and
      Tobias Wrigstad, also under CC BY-SA.
    </div>

    <div class="title-text-LICENCE">
      <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow"
        ><img
          src="img_original/gpl-v3.svg"
          alt="GPL 3"
          style="max-width:100%; width:50px;"
      /></a>
      <p />
      All Scheme programs in this work are licensed by Harold Abelson and Gerald
      Jay Sussman under the
      <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow"
        >GNU General Public License Version 3</a
      >
      (GPLv3). All JavaScript programs in this work are licensed by Martin Henz
      and Tobias Wrigstad, also under GPLv3.
    </div>`;
};

export default Licences;
