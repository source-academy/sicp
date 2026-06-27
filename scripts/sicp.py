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
# Distinguished values
# ---------------------------------------------------------------------------


class _Undefined:
    """The SICP ``undefined`` value (distinct from the empty list ``None``)."""

    def __repr__(self):
        return "undefined"


undefined = _Undefined()


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
    return undefined


def set_tail(p, value):
    p[1] = value
    return undefined


# ---------------------------------------------------------------------------
# Linked lists
# ---------------------------------------------------------------------------


def is_null(x):
    return x is None


# The Python edition uses `is_none` for the empty-list test.
is_none = is_null


def llist(*args):
    result = None
    for x in reversed(args):
        result = pair(x, result)
    return result


def is_list(x):
    while is_pair(x):
        x = tail(x)
    return x is None


def length(xs):
    n = 0
    while xs is not None:
        n += 1
        xs = tail(xs)
    return n


def list_ref(xs, n):
    while n > 0:
        xs = tail(xs)
        n -= 1
    return head(xs)


def map(f, *lists):
    if len(lists) == 1:
        xs = lists[0]
        return None if xs is None else pair(f(head(xs)), map(f, tail(xs)))
    if any(xs is None for xs in lists):
        return None
    return pair(
        f(*[head(xs) for xs in lists]),
        map(f, *[tail(xs) for xs in lists]),
    )


def for_each(f, xs):
    while xs is not None:
        f(head(xs))
        xs = tail(xs)
    return undefined


def append(a, b):
    return b if a is None else pair(head(a), append(tail(a), b))


def reverse(xs):
    result = None
    while xs is not None:
        result = pair(head(xs), result)
        xs = tail(xs)
    return result


def accumulate(f, initial, xs):
    if xs is None:
        return initial
    return f(head(xs), accumulate(f, initial, tail(xs)))


def filter(pred, xs):
    if xs is None:
        return None
    if pred(head(xs)):
        return pair(head(xs), filter(pred, tail(xs)))
    return filter(pred, tail(xs))


def build_list(n, f):
    result = None
    for i in range(n - 1, -1, -1):
        result = pair(f(i), result)
    return result


def enum_list(low, high):
    result = None
    i = high
    while i >= low:
        result = pair(i, result)
        i -= 1
    return result


def member(x, xs):
    while xs is not None:
        if equal(x, head(xs)):
            return xs
        xs = tail(xs)
    return None


# `ref` is the Python edition's spelling of list_ref (defined above).
ref = list_ref


def remove(item, xs):
    return filter(lambda x: not equal(x, item), xs)


def scale_llist(items, factor):
    return map(lambda x: x * factor, items)


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
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def is_integer(x):
    return isinstance(x, int) and not isinstance(x, bool)


def is_string(x):
    return isinstance(x, str)


def is_boolean(x):
    return isinstance(x, bool)


def is_function(x):
    return callable(x)


def is_undefined(x):
    return x is undefined


# ---------------------------------------------------------------------------
# Output / strings / errors
# ---------------------------------------------------------------------------


def display(value, *rest):
    print(stringify(value) if rest else value)
    return value


def stringify(value):
    return repr(value)


def error(value, *message):
    msg = " ".join(str(m) for m in message)
    raise Exception((msg + ": " if msg else "") + repr(value))


# ---------------------------------------------------------------------------
# Math primitives (aliases of the standard library)
# ---------------------------------------------------------------------------

math_PI = _math.pi
math_E = _math.e
# The Python edition spells these in lower case.
math_pi = _math.pi
math_e = _math.e

# math_random() returns a float in [0, 1).
math_random = _random.random

math_abs = abs
math_max = max
math_min = min
math_round = round

math_sqrt = _math.sqrt
math_cbrt = lambda x: _math.copysign(abs(x) ** (1 / 3), x)
math_exp = _math.exp
math_log = _math.log
math_log2 = _math.log2
math_log10 = _math.log10
math_pow = _math.pow
math_floor = _math.floor
math_ceil = _math.ceil
math_trunc = _math.trunc
math_sign = lambda x: (x > 0) - (x < 0)

math_sin = _math.sin
math_cos = _math.cos
math_tan = _math.tan
math_asin = _math.asin
math_acos = _math.acos
math_atan = _math.atan
math_atan2 = _math.atan2
math_hypot = _math.hypot
