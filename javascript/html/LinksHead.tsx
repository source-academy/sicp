import { html, raw } from "hono/html";
import type { FC } from "hono/jsx";

const HtmlHeadPart1: FC = () => {
  return html`<meta charset="utf-8">
    <!-- Global site tag (gtag.js) - Google Analytics - START -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=UA-156801664-1"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'UA-156801664-1');
    </script>
    <!-- Global site tag (gtag.js) - Google Analytics - END -->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
};

type HtmlHeadPart2Props = {
  toIndexFolder: string;
};

const HtmlHeadPart2: FC<HtmlHeadPart2Props> = ({ toIndexFolder }) => {
  return html`<meta name="csrf-param" content="authenticity_token" />
    <meta
      name="csrf-token"
      content="EMTEijVc2kiiKUH4nYH0lQG3pLPfMowQ/Stg//t6DCo0e5pWMQwamnTvIdmVZqY/MqSx2IYYE+2bpNV6UNSMwQ=="
    />
    <!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
    -->
    <link
      href="https://fonts.googleapis.com/css?family=Inconsolata&display?swap"
      rel="stylesheet">
    <link
      href="https://fonts.googleapis.com/css?family=Droid+Sans|Droid+Serif"
      rel="stylesheet">
    <link
      rel="stylesheet"
      media="all"
      href="${toIndexFolder}assets/stylesheet.css"
    />

    <link
      rel="shortcut icon"
      type="image/x-icon"
      href="${toIndexFolder}assets/sourcepower.ico"
    />

    <!--    <link rel="shortcut icon" type="image/png" href="${toIndexFolder}images/lambda.png" /> -->

    <!-- for support of progressive web app, see github README, DISABLED!
    <link rel="manifest" href="${toIndexFolder}static/manifest.json">
    -->

    <script
      src="https://code.jquery.com/jquery-3.2.1.min.js"
      integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
      crossorigin="anonymous"
    >
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js"></script>
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"
      integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"
      integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k"
      crossorigin="anonymous"
    ></script>

    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script> -->
    <script
      type="text/javascript"
      src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-AMS-MML_HTMLorMML-full"
    >
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
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.2/html5shiv.min.js"
        type="text/javascript"></script>
    <![endif]--> `;
};

type LinksHeadProps = {
  children?: any;
  toIndexFolder: string;
  version: string;
};

const LinksHead: FC<LinksHeadProps> = ({
  children,
  toIndexFolder,
  version
}) => {
  return html`
    <head>
      ${(<HtmlHeadPart1 />)} ${raw(children)}
      ${(<HtmlHeadPart2 toIndexFolder={toIndexFolder} />)}
    </head>
  `;
};

export default LinksHead;
