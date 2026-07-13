# SICP: JavaScript, Python, and Scheme Editions

This repository contains processing scripts and sources for *Structure and Interpretation of Computer Programs* (SICP), adapted from the original Scheme edition (SICP) into JavaScript (SICP JS) and Python (SICPy), and also publishing the original Scheme edition on its own. See the [SICP JS preface](https://sourceacademy.org/sicpjs/prefaces03) for background on the JavaScript adaptation.

## Editions

### SICP JS

* [Print version](https://mitpress.mit.edu/books/structure-and-interpretation-computer-programs-1) and [ebook version](https://www.amazon.com/Structure-Interpretation-Computer-Programs-Engineering-ebook-dp-B094X8316F/dp/B094X8316F/ref=mt_other?_encoding=UTF8&me=&qid=), published by The MIT Press
* [Interactive SICP JS](https://sourceacademy.org/sicpjs)
* [Comparison edition](http://sicp.sourceacademy.org), Scheme vs. JavaScript

### SICPy

* [Comparison edition](http://sicp.sourceacademy.org/split_py), Scheme vs. Python
* [PDF edition](http://sicp.sourceacademy.org/sicpy.pdf)
* [Interactive SICPy](https://sourceacademy.org/sicpy)

### Scheme (the original)

* [PDF edition](http://sicp.sourceacademy.org/sicp.pdf)
* JSON edition, for the Source Academy frontend ([json_scm](http://sicp.sourceacademy.org/json_scm/toc.json))

Details on how to generate these versions are in the [repo wiki](https://github.com/source-academy/sicp/wiki).

**Platform requirement:** Generating the JSON edition and extracting the programs (`yarn json`, `yarn programs`) works on any platform with Node.js. Generating the PDF edition and running the full build require Unix/macOS; Windows users can use [WSL](https://learn.microsoft.com/en-us/windows/wsl/) to run the shell scripts involved.

Check out our [Resources for Learners, Educators and Researchers](https://about.sourceacademy.org/), and read more [About the SICP JS Project](https://sourceacademy.org/sicpjs/making-of) in Interactive SICP JS.

## Testing the SICPy (Python) edition

The SICPy example programs can be tested automatically against their expected outputs. First, generate the programs from the XML sources:

```bash
SICP_EDITION=py npx tsx ./javascript/index.js programs_py
```

Then run the tests:

```bash
yarn test:py

# Or scope to one chapter/section by passing a folder, same as `yarn test`:
yarn test:py -- programs_py/chapter1
yarn test:py -- programs_py/chapter1/section1/subsection4
```

By default the programs are run through **py-slang**, the Source Academy Python interpreter, which is installed as the [`@sourceacademy/py-slang`](https://www.npmjs.com/package/@sourceacademy/py-slang) dependency (run `yarn install` first). To test against a local py-slang build instead, set the `PY_SLANG` environment variable to its `dist/index.cjs` (e.g. `PY_SLANG=../py-slang/dist/index.cjs`).

To run against **CPython** instead (useful for comparison or as a ground truth — this is what `scripts/run_py.py` does, and what `test.js` shells out to when `PY_SLANG=0`):

```bash
yarn test:py:cpython
# scoped to a folder, same as above:
yarn test:py:cpython -- programs_py/chapter1
```

The CPython path needs the `sicp` runtime (published as [`sourceacademy-sicp`](https://pypi.org/project/sourceacademy-sicp/), maintained in the [py-slang](https://github.com/source-academy/py-slang) repo under `python/`) importable from wherever `python3` runs. `scripts/run_py.py` looks for it in this order:

1. An installed copy — `pip install sourceacademy-sicp`.
2. A sibling `py-slang` checkout — if this repo and `py-slang` sit next to each other on disk (e.g. both under the same parent directory), `pip install -e ../py-slang/python` (or nothing at all — `run_py.py` also falls back to importing straight out of that checkout without an install).

If neither is available, `run_py.py` exits with an error naming both options rather than failing with a raw `ModuleNotFoundError`.

Chapters 1–3 currently pass in full against CPython. Chapter 4 (the meta-circular evaluator) has a number of known, pre-existing failures unrelated to the `sicp` runtime itself — mostly program fragments that reference names like `parse` that only exist in the Source/JS edition, or that are intentionally incomplete snippets extracted from the book.

The JavaScript edition tests are unchanged and continue to run through js-slang:

```bash
yarn test
```

## Licenses

[![CC BY-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

The [print version of SICP JS](https://mitpress.mit.edu/books/structure-and-interpretation-computer-programs-1) and the [ebook version](https://www.amazon.com/Structure-Interpretation-Computer-Programs-Engineering-ebook-dp-B094X8316F/dp/B094X8316F/ref=mt_other?_encoding=UTF8&me=&qid=) will be published in 2022 by The MIT Press under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](cc-by-nc-sa) (CC BY-NC-SA).

[![CC BY-SA 4.0][cc-by-sa-image]][cc-by-sa]

The text of SICP JS and SICPy is derived from the book *Structure and Interpretation of Computer Programs*, Second Edition, 1996, (SICP) by Harold Abelson and Gerald Jay Sussman, and is licensed by these original authors under a [Creative Commons Attribution-ShareAlike 4.0 International License](cc-by-sa) (CC BY-SA). SICP JS is licensed by adapters Martin Henz and Tobias Wrigstad under CC BY-SA; SICPy is licensed by adapter Martin Henz under CC BY-SA. The Scheme edition republishes the original SICP text and programs unmodified under the same CC BY-SA license, with no additional adaptation layer. A [comparison edition](http://sicp.sourceacademy.org) indicates the changes that were made to SICP for the JavaScript edition; a [Scheme/Python comparison edition](http://sicp.sourceacademy.org/split_py) does the same for the Python edition. [Interactive SICP JS](https://sourceacademy.org/sicpjs) is licensed by Martin Henz, Tobias Wrigstad, and Samuel Fang under CC BY-SA; [Interactive SICPy](https://sourceacademy.org/sicpy) is licensed by Martin Henz and Samuel Fang under CC BY-SA. The figures in all versions are derived from figures created by Andres Raba in 2015, and are licensed by Martin Henz and Tobias Wrigstad under CC BY-SA.

[![GPL 3][gpl3-image]][gpl3]

The JavaScript programs in SICP JS and the Python programs in SICPy are derived from the Scheme programs in SICP and are licensed by their respective adapters (Martin Henz and Tobias Wrigstad for JavaScript; Martin Henz for Python) under the [GNU General Public License v3.0](gpl3).

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
All JavaScript and TypeScript programs that generate the SICP JS, SICPy, and Scheme versions are licensed by the contributors under the [Apache License Version 2][apache2].

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png
[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[gpl3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[gpl3-image]: https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png
[apache2]: https://www.apache.org/licenses/LICENSE-2.0.txt
