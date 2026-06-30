"""A minimal `sicp` runtime for running SICPy example programs under CPython.

This is deliberately small: it provides just enough of the SICP primitives for
the generated Python programs to run, and is meant to grow as the test suite
(scripts/run_py.py, driven by `SICP_EDITION=py yarn test`) turns up names that
are not yet provided.

Representation note: a linked-list pair is a 2-element Python list
``[head, tail]`` and the empty list is ``None``. With this representation a
program's result prints/compares directly against the ``# expected: ...``
literal in the textbook, e.g.::

    pair("python_number", 9)        -> ['python_number', 9]
    llist(1, 2, 3)                  -> [1, [2, [3, None]]]
"""

import math as _math
import random as _random

# ---------------------------------------------------------------------------
# Pairs
# ---------------------------------------------------------------------------


def pair(a, b):
    return [a, b]


def is_pair(x):
    return isinstance(x, list) and len(x) == 2


def head(p):
    if not is_pair(p):
        error(p, "head: argument is not a pair")
    return p[0]


def tail(p):
    if not is_pair(p):
        error(p, "tail: argument is not a pair")
    return p[1]


def set_head(p, value):
    p[0] = value
    return None


def set_tail(p, value):
    p[1] = value
    return None


# ---------------------------------------------------------------------------
# Linked lists
# ---------------------------------------------------------------------------

def is_none(x):
    return x is None

def llist(*args):
    result = None
    for x in reversed(args):
        result = pair(x, result)
    return result


def print_llist(xs):
    print(xs)
    return xs


def equal(a, b):
    if is_pair(a) and is_pair(b):
        return equal(head(a), head(b)) and equal(tail(a), tail(b))
    return a == b


# Apply a function to the elements of a linked list of arguments.
def apply_in_underlying_python(fun, args_list):
    args = []
    while args_list is not None:
        args.append(head(args_list))
        args_list = tail(args_list)
    return fun(*args)


# Legacy alias: the JavaScript edition names this primitive after its host
# language; keep it available until any remaining JS-named callers are converted.
apply_in_underlying_javascript = apply_in_underlying_python


# ---------------------------------------------------------------------------
# Type predicates
# ---------------------------------------------------------------------------


def is_number(x):
    return isinstance(x, (int, float))


def is_integer(x):
    return isinstance(x, int)


def is_string(x):
    return isinstance(x, str)


def is_boolean(x):
    return isinstance(x, bool)


def is_function(x):
    return callable(x)


# ---------------------------------------------------------------------------
# Output / strings / errors
# ---------------------------------------------------------------------------


def error(value, *message):
    msg = " ".join(str(m) for m in message)
    raise Exception((msg + ": " if msg else "") + repr(value))


# ---------------------------------------------------------------------------
# Math primitives (aliases of the standard library)
# ---------------------------------------------------------------------------

math_pi = _math.pi
math_e = _math.e
math_inf = _math.inf
math_nan = _math.nan

# math_random() returns a float in [0, 1). Kept under this name (not `random`)
# because the textbook defines its own `random(n)` helper on top of it.
random_random = _random.random

abs = abs
max = max
min = min
round = round

math_sqrt = _math.sqrt
math_exp = _math.exp
math_log = _math.log
math_log2 = _math.log2
math_log10 = _math.log10
math_pow = _math.pow
math_floor = _math.floor
math_ceil = _math.ceil
math_trunc = _math.trunc
math_sin = _math.sin
math_cos = _math.cos
math_tan = _math.tan
math_asin = _math.asin
math_acos = _math.acos
math_atan = _math.atan
math_atan2 = _math.atan2
math_hypot = _math.hypot
