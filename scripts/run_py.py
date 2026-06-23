#!/usr/bin/env python3
"""Run one generated SICPy program and check it against its expected output.

Invoked by scripts/test.js when SICP_EDITION=py. It runs the program and takes
its result to be either the value of the final top-level expression, or - when
that final expression is a ``print(...)`` call (so its value is None) - the
last line the program printed. That result is compared against the
"# expected: ..." value.

The SICP primitives (pair, head, tail, llist, error, math_*, ...) come from the
`sicp` module; a minimal local one lives next to this script (scripts/sicp.py)
and is extended as the test suite turns up missing names.

Exit status 0 means PASS; any non-zero status means FAIL (mismatch or error),
with detail written to stdout for test.js to surface.
"""
import ast
import contextlib
import io
import math
import os
import re
import sys
import threading

# Make the local scripts/ directory importable so `from sicp import *` finds
# scripts/sicp.py.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# SICP expresses many iterative processes as deep recursion, which exceeds
# CPython's default limit. Raise the limit and run the program on a worker
# thread with a large stack so the deeper recursion does not overflow the C
# stack.
sys.setrecursionlimit(200000)
_STACK_SIZE = 512 * 1024 * 1024


def run_with_big_stack(target):
    threading.stack_size(_STACK_SIZE)
    thread = threading.Thread(target=target)
    thread.start()
    thread.join()


def split_last_expression(source, filename):
    """Compile the program, separating off its final top-level expression.

    Returns (exec_code, eval_code); eval_code is None when the program does not
    end in a bare expression."""
    module = ast.parse(source, filename)
    if module.body and isinstance(module.body[-1], ast.Expr):
        last = module.body.pop()
        exec_code = compile(module, filename, "exec")
        eval_code = compile(ast.Expression(last.value), filename, "eval")
        return exec_code, eval_code
    return compile(module, filename, "exec"), None


def normalize(value):
    """Canonical form for comparison: turn tuples into lists so different
    sequence representations of the same linked list compare equal."""
    if isinstance(value, (list, tuple)):
        return [normalize(v) for v in value]
    return value


def struct_eq(a, b):
    """Structural equality with a small numeric tolerance, so floating-point
    roundoff (e.g. -2.9999999999999996 vs -3.0) does not fail a comparison."""
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(struct_eq(x, y) for x, y in zip(a, b))
    if (
        isinstance(a, (int, float))
        and isinstance(b, (int, float))
        and not isinstance(a, bool)
        and not isinstance(b, bool)
    ):
        return a == b or math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12)
    return a == b


# Many "# expected: ..." values are still written in JavaScript notation
# (the JS edition's literals); accept those too, so a Python result True /
# False / None matches an expected true / false / null / undefined.
_JS_TOKENS = {"true": "True", "false": "False", "null": "None", "undefined": "None"}


def _js_to_py(text):
    return re.sub(
        r"\b(true|false|null|undefined)\b",
        lambda m: _JS_TOKENS[m.group(1)],
        text,
    )


def to_struct(text):
    """Parse a textual result/expected as a Python literal when possible (so
    5, 'done', None, [ 'x', 9 ] compare structurally); otherwise keep the
    raw string. Falls back to interpreting JavaScript literals."""
    for candidate in (text, _js_to_py(text)):
        try:
            return normalize(ast.literal_eval(candidate))
        except (ValueError, SyntaxError):
            continue
    return text


def expected_from_file(source):
    """Fallback: read the trailing '# expected: ...' line from the source."""
    for line in reversed(source.splitlines()):
        stripped = line.strip()
        if stripped.startswith("#"):
            body = stripped[1:].strip()
            if body.startswith("expected:"):
                return body[len("expected:"):].strip()
    return None


def main():
    program_path = sys.argv[1]
    with open(program_path, encoding="utf-8") as f:
        source = f.read()

    expected_str = sys.argv[2] if len(sys.argv) > 2 else expected_from_file(source)

    glb = {}
    # Provide the SICP primitives (pair, head, tail, llist, error, math_*, ...).
    exec("from sicp import *", glb)

    try:
        exec_code, eval_code = split_last_expression(source, program_path)
    except SyntaxError as error:
        print(f"{type(error).__name__}: {error}")
        sys.exit(1)

    buf = io.StringIO()
    outcome = {}

    def worker():
        try:
            with contextlib.redirect_stdout(buf):
                exec(exec_code, glb)
                outcome["value"] = (
                    eval(eval_code, glb) if eval_code is not None else None
                )
        except BaseException as error:  # capture RecursionError etc.
            outcome["error"] = error

    run_with_big_stack(worker)

    printed = buf.getvalue()
    if "error" in outcome:  # report any runtime error as a failure
        if printed.strip():
            sys.stdout.write(printed if printed.endswith("\n") else printed + "\n")
        error = outcome["error"]
        print(f"{type(error).__name__}: {error}")
        sys.exit(1)
    value = outcome.get("value")

    # The result is the value of the final expression, or - when that
    # expression is a print(...) call (value None) - the last printed line.
    if value is not None:
        result_struct = normalize(value)
        result_text = repr(value)
    elif printed.strip():
        result_text = printed.strip().splitlines()[-1].strip()
        result_struct = to_struct(result_text)
    else:
        result_struct = None
        result_text = "None"

    if expected_str is None:
        sys.exit(0)

    expected_struct = to_struct(expected_str)
    ok = (
        struct_eq(result_struct, expected_struct)
        or result_text.strip() == expected_str.strip()
        or f"'{result_text}'" == expected_str.strip()
    )
    if ok:
        sys.exit(0)

    print(f"got:      {result_text}")
    print(f"expected: {expected_str}")
    sys.exit(1)


if __name__ == "__main__":
    main()
