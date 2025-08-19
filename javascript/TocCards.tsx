import { html } from "hono/html";
import type { FC } from "hono/jsx";

type HeaderCardProps = {
  index: number;
  chapterIndex: number;
  displayTitle: string;
  toIndexFolder: string;
};

export const IndexHeaderCard: FC<HeaderCardProps> = ({
  index,
  chapterIndex,
  displayTitle,
  toIndexFolder
}) => {
  return html`<div class="card-header" role="tab" id="index-${index + 1}">
    <h5 class="mb-0">
      <a
        class="index-show collapsed"
        data-toggle="collapse"
        href="#index-collapse-${index + 1}"
        aria-expanded="true"
        aria-controls="index-collapse-${index + 1}"
      >
        &#10148;
        <!-- ➤ (because this one is rendered blue on mobile: ▶  -->
      </a>
      <a
        class="index-hide collapsed"
        data-toggle="collapse"
        href="#index-collapse-${index + 1}"
        aria-expanded="true"
        aria-controls="index-collapse-${index + 1}"
      >
        &#x25BC;
        <!-- ▼ (because the corresponding one is not rendered) -->
      </a>
      <a href="${toIndexFolder}${chapterIndex}.html">${displayTitle}</a>
    </h5>
  </div>`;
};

export const SidebarHeaderCard: FC<HeaderCardProps> = ({
  index,
  chapterIndex,
  displayTitle,
  toIndexFolder
}) => {
  return html`<div class="card-header" role="tab" id="sidebar-${index + 1}">
    <h5 class="mb-0">
      <a
        class="sidebar-show collapsed"
        data-toggle="collapse"
        href="#sidebar-collapse-${index + 1}"
        aria-expanded="true"
        aria-controls="sidebar-collapse-${index + 1}"
      >
        &#10148;
        <!-- ➤ (because this one is rendered blue on mobile: ▶  -->
      </a>
      <a
        class="sidebar-hide collapsed"
        data-toggle="collapse"
        href="#sidebar-collapse-${index + 1}"
        aria-expanded="true"
        aria-controls="sidebar-collapse-${index + 1}"
      >
        &#x25BC;
        <!-- ▼ (because the corresponding one is not rendered) -->
      </a>
      <a href="${toIndexFolder}${chapterIndex}.html">${displayTitle}</a>
    </h5>
  </div>`;
};
