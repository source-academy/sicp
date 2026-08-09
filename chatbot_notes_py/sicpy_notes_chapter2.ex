defmodule Cadet.Chatbot.SicpyNotesWithIndex.Chapter2 do
  @moduledoc """
  Module to store SICPy (Python edition) notes for chapter 2, enriched
  with key terms drawn from the book's own back-of-book index.
  """
  @summary_2 """
  2. Building Abstractions with Data
  1. From Functions to Data:
  - Shifts focus from chapter 1's function-centric abstraction to data abstraction: building compound data objects and hiding how they're represented.
  - Argues that programs dealing with more than numbers need richer data, e.g. rational numbers as a pair of integers rather than as a single primitive value.
  2. Compound Data and Closure:
  - Introduces the idea that a language needs a way to glue data objects together (`pair`) so combinations can themselves be combined, forming hierarchical structures.
  3. Roadmap:
  - Previews the chapter's arc: rational numbers and abstraction barriers, hierarchical data and a picture language, symbolic data, and finally generic operations over multiple representations.

  Key terms: Weyl, Hermann, abstraction barriers, additivity, closure, compound data, need for, conventional interface, data (compound), data abstraction, expression (symbolic), generic operation, operation (generic), rational number arithmetic (need for compound data), symbolic expression
  """

  @summary_2_1 """
  2.1 Introduction to Data Abstraction
  1. Wishful Thinking:
  - Introduces data abstraction: define a data object by the operations used on it, deferring the question of how it is actually represented.
  - Illustrates this with rational numbers, assuming `make_rat`, `numer`, and `denom` exist before deciding how a rational number is built.
  2. Separating Use from Representation:
  - Distinguishes the "wishful thinking" style of defining operations from the later task of implementing the underlying representation with `pair`.

  Key terms: abstract data, concrete data representation, constructor, data (abstract), data (concrete representation of), data abstraction, selector
  """

  @summary_2_1_1 """
  2.1.1 Example: Arithmetic Operations for Rational Numbers
  1. Pairs as Glue:
  - Introduces `pair`, `head`, and `tail` as Python's primitive glue for building compound data, with `pair(x, y)` producing a new pair object.
  - Notes pairs are a genuinely new kind of data, not reducible to numbers.
  2. Building Rational Numbers:
  - Represents a rational number as a pair of numerator and denominator, with `make_rat`, `numer`, and `denom` as constructor/selectors.
  - Reduces fractions to lowest terms at construction time using `gcd`, so `numer`/`denom` never need to re-simplify.
  3. Arithmetic and Display:
  - Defines `add_rat`, `sub_rat`, `mul_rat`, `div_rat`, and `is_equal_rat` purely in terms of the selectors, independent of the underlying pair representation.
  - Adds a `print_rat` helper to display rationals in `n/d` form, illustrating that abstraction doesn't preclude convenient output.

  Key terms: + (as string concatenation operator), add_rat, arithmetic (on rational numbers), concatenating strings, data (list structured), denom, div_rat, equal_rat, greatest common divisor (used in rational number arithmetic), head, list structure, make_rat, make_rat (reducing to lowest terms), mul_rat, numer, overloaded operator +, pair, pair(s), print_rat, rational number arithmetic, rational number(s) (arithmetic operations on), rational number(s) (printing), rational number(s) (reducing to lowest terms), rational number(s) (represented as pairs), reducing to lowest terms
  """

  @summary_2_1_2 """
  2.1.2 Abstraction Barriers
  1. Layers of a System:
  - Frames the rational-number system as a stack of abstraction barriers: programs that use rationals, the rational-arithmetic operations, the rat constructor/selectors, and the underlying pair representation.
  - Argues each layer should only talk to the layer directly below it through its interface.
  2. Benefits of Barriers:
  - Isolates how a data object is represented from how it's used, making the system easier to design, maintain, and modify.
  - Shows that even the choice of whether to reduce fractions at construction time or at selection time is invisible above the `make_rat`/`numer`/`denom` barrier.

  Key terms: abstraction barriers, constructor (as abstraction barrier), denom (reducing to lowest terms), end_segment, line segment (represented as pair of points), make_point, make_rat, make_segment, midpoint_segment, numer (reducing to lowest terms), point, represented as a pair, print_point, rational number(s) (reducing to lowest terms), rectangle, representing, reducing to lowest terms, selector (as abstraction barrier), start_segment
  """

  @summary_2_1_3 """
  2.1.3 What Is Meant by Data?
  1. Data Defined by Behavior:
  - Argues "data" really means: a collection of selectors and constructors, plus the conditions they must satisfy to behave properly (here, that `numer(make_rat(n, d)) / denom(make_rat(n, d))` equals `n / d`).
  - Notes that any implementation satisfying those conditions is an acceptable representation of pairs.
  3. Pairs Implemented as Functions:
  - Shows `pair`, `head`, and `tail` can be implemented purely with functions and no "real" data structure at all, using a closure that dispatches on which selector is requested.
  - Uses this to make the point that the vocabulary of functions is already sufficient to represent data—functions and data are not fundamentally distinct.
  4. Church Numerals (exercises):
  - References an exercise track (Church numerals) representing even numbers themselves as functions, reinforcing that "data" is whatever satisfies the right behavioral contract.

  Key terms: Church numerals, Church, Alonzo, Goguen, Joseph, Guttag, John Vogel, Hoare, Charles Antony Richard, Liskov, Barbara Huberman, Thatcher, James W., Wagner, Eric G., Wright, Jesse B., Zilles, Stephen N., abstract models for data, algebraic specification for data, data (abstract models for), data (algebraic specification for), data (functional representation of), data (meaning of), denom (axiom for), error (optional second argument), functional representation of data, head (axiom for), head (functional implementation of), make_rat (axiom for), message passing, numer (axiom for), pair (axiom for)
  """

  @summary_2_1_4 """
  2.1.4 Extended Exercise: Interval Arithmetic
  1. Motivating Problem:
  - Introduces Alyssa P. Hacker's need for arithmetic on intervals (measurements with tolerances) rather than exact numbers, to propagate uncertainty through a computation.
  2. Interval Representation and Operations:
  - Builds `make_interval`, `lower_bound`, `upper_bound`, and arithmetic (`add_interval`, `mul_interval`, `div_interval`) purely in terms of the endpoints, following the same wishful-thinking discipline as rational numbers.
  - Introduces an alternate center/width view (`make_center_width`, `center`, `width`) as a different but related way to talk about the same interval data.
  3. Underdetermined Representation:
  - Uses the exercises to surface a deeper issue: multiple representations (endpoints vs. center/percent tolerance) can look "equivalent" under simple algebra yet diverge once real-number roundoff or resistor networks are involved, foreshadowing later sections on multiple representations.

  Key terms: add_interval, arithmetic (on intervals), center, div_interval, div_interval (division by zero), interval arithmetic, lower_bound, make_center_percent, make_center_width, make_interval, max, min, mul_interval, mul_interval (more efficient version), resistance (formula for parallel resistors), resistance (tolerance of resistors), sub_interval, upper_bound, width, width of an interval
  """

  @summary_2_2 """
  2.2 Hierarchical Data and the Closure Property
  1. Pairs of Pairs:
  - Observes that `pair` can combine not just numbers but other pairs, and calls this the *closure property*: combinations built with `pair` can themselves be combined with `pair`.
  - Distinguishes this everyday sense of "closure" from the unrelated language-implementation sense (free-name-capturing closures), which this book deliberately avoids using the word for.
  2. Why Closure Matters:
  - Explains that closure is what lets a means of combination build arbitrarily deep hierarchical structure, made of parts that are themselves made of parts.
  3. Section Roadmap:
  - Previews using pairs to represent sequences and trees, and building a picture language that itself exploits closure.

  Key terms: box and pointer notation, closure (closure property of pair), closure (in abstract algebra), data (hierarchical), hierarchical data structures, pair (closure property of), pair(s) (box and pointer notation for), pointer (in box and pointer notation)
  """

  @summary_2_2_1 """
  2.2.1 Representing Sequences
  1. Linked Lists via Nested Pairs:
  - Represents an ordered sequence as a chain of pairs ending in `None`, introduces `llist` as a convenience constructor, and shows the box-notation vs. linked-list-notation for printing (`print` vs. `print_llist`).
  2. Basic Traversal:
  - Defines `ref` (nth element) and `length` (via `is_none`) as the archetypal walk-down-the-list recursive functions, then gives an iterative `length` variant.
  - Defines `append` as another recursive walk that rebuilds a linked list by adjoining elements with `pair` while descending with `tail`.
  3. Mapping over Linked Lists:
  - Introduces `map` as a higher-order abstraction over `scale_linked_list`-style per-element transformations, establishing an abstraction barrier between "what transformation" and "how the list is walked."
  - Notes `map` doesn't change the underlying process, just how programmers *think about* it—as a sequence-to-sequence transform rather than an element-by-element recursion.
  4. Exercises' Themes:
  - The exercise track covers `last_pair`, `reverse`, restructuring the change-counting program around a linked list of coin values, currying (`plus_curried`, `brooks`), and `for_each` for side-effecting iteration.

  Key terms: Curry, Haskell Brooks, Haskell, None (as empty linked list), None (as end of linked list marker), None (recognizing with is_none), Ocaml, adjoining to a linked list with pair, append, box and pointer notation (end of linked list marker), box notation for pairs, constructing a linked list with pair, counting change, currying, empty linked list, empty linked list (recognizing with is_none), end of linked list marker, for_each, head (as linked list operation), is_none, keywords (None), last_pair, length, length (iterative version), length (recursive version), linked list
  """

  @summary_2_2_2 """
  2.2.2 Hierarchical Structures
  1. Sequences of Sequences as Trees:
  - Generalizes linked lists to trees: a sequence whose elements may themselves be sequences, visualized either as nested pairs or as a tree with subtrees as branches.
  2. Recursion over Trees:
  - Contrasts `length` (counts top-level elements) with `count_leaves` (recursively counts leaves through both `head` and `tail`), using `is_pair`/`is_none` to distinguish leaves from subtrees.
  3. Mapping over Trees:
  - Defines `scale_tree` two ways: direct recursion mirroring `count_leaves`, and via `map` treating the tree as a sequence of subtrees—prefiguring `tree_map` in the exercises.
  4. Exercise Themes:
  - Exercises cover `square_tree`, `tree_map`, and a `subsets` function that generates the power set of a set represented as a linked list.

  Key terms: balanced mobile, count_leaves, data (hierarchical), deep_reverse, fringe, hierarchical data structures, is_pair, mapping (over trees), mobile, pair(s) (used to represent tree), recursion (in working with trees), scale_tree, set (subsets of), subsets, tree (counting leaves of), tree (fringe of), tree (mapping over), tree (represented as pairs), tree (reversing at all levels), tree_map
  """

  @summary_2_2_3 """
  2.2.3 Sequences as Conventional Interfaces
  1. Signal-Flow Thinking:
  - Notices that superficially different programs (`sum_odd_squares`, `even_fibs`) share an abstract shape: enumerate, filter, map, accumulate—like stages in a signal-processing pipeline.
  - Diagnoses that ad hoc recursive definitions bury this shape, mixing enumeration, filtering, and accumulation together.
  2. A Library of Sequence Operations:
  - Builds `map`, `filter`, `accumulate`, `enumerate_interval`, and `enumerate_tree` as standard, reusable components, then reassembles `sum_odd_squares` and `even_fibs` as explicit pipelines of these operations.
  - Frames this as a modular-design strategy: standard components with a conventional (sequence) interface that can be mixed and matched, echoing the Fortran/Lisp historical note on how often real programs fit this pattern.
  3. Nested Mappings:
  - Introduces `flatmap` (map + accumulate-with-append) for problems needing nested iteration, illustrated with `prime_sum_pairs` (ordered pairs summing to a prime) and `permutations`.
  - Uses the eight-queens puzzle (exercises 2.42–2.43) to show how nested-mapping order affects both correctness and efficiency.

  Key terms: Borodin, Alan, Fortran, Horner's rule, KRC, Knuth, Donald E., Miranda, Munro, Ian, Ostrowski, A. M., Pan, V. Y., Turner, David, Waters, Richard C., accumulate, accumulate (same as fold_right), accumulate_n, accumulator, algorithm (optimal), append (as accumulation), chess, eight queens puzzle, comments in programs, conventional interface (sequence as), count_leaves (as accumulation), dot_product, eight queens puzzle, enumerate_interval, enumerate_tree
  """

  @summary_2_2_4 """
  2.2.4 Example: A Picture Language
  1. Painters as the Only Primitive:
  - Introduces a picture language whose sole kind of data is a *painter*: a function that, given a frame, draws an image shifted and scaled to fit it.
  - Gives `wave` and `rogers` as example primitive painters, and shows how `beside`, `below`, `flip_vert`, and `flip_horiz` combine and transform painters into more complex ones.
  2. Closure Again, at the Painter Level:
  - Notes that `beside`/`below` applied to painters yield painters, so painter combinations satisfy the closure property just as `pair` does for linked-list structure—enabling recursive designs like `right_split`, `corner_split`, and `square_limit`.
  3. Higher-Order Combinators:
  - Abstracts common combining patterns into operators on painter *operations* themselves, such as `square_of_four`, showing `flipped_pairs` and `square_limit` as instances of one general combinator.
  4. Frames and Painters Under the Hood:
  - Represents a frame by an origin and two edge vectors, with `frame_coord_map` mapping the unit square into a frame; represents painters as functions from frame to drawing action (e.g. `segments_to_painter`).
  - Implements all transformations (`flip_vert`, `shrink_to_upper_right`, `rotate90`, `squash_inwards`) via one core function, `transform_painter`, that remaps a painter's frame.
  5. Stratified Design:
  - Closes with the idea of *stratified design*: complex systems as a sequence of languages, where each level's compound parts become the next level's primitives—illustrated by primitive painters → geometric combiners → pattern-level combinators.
  - Argues this stratification is what makes the design *robust*: a change at one level (e.g. tweaking `wave`) doesn't require touching the levels above or below it.

  Key terms: Escher, Maurits Cornelis, Henderson, Peter, MIT (early history of), Rogers, William Barton, Runkle, John Daniel, Walker, Francis Amasa, add_vect, below, beside, closure (closure property of picture language operations), coal, bituminous, corner_split, design, stratified, draw_line, edge1_frame, edge2_frame, end_segment, flip_horiz, flip_vert, flipped_pairs, frame (picture language), frame (picture language) (coordinate map), frame_coord_map, lambda expression (restricted to a single expression in Python), line segment (represented as pair of vectors)
  """

  @summary_2_3 """
  2.3 Symbolic Data
  1. Beyond Numbers:
  - Extends compound data beyond structures built from numbers, introducing strings as a way to represent and manipulate symbols, not just quantities.

  Key terms: data (symbolic), string(s)
  """

  @summary_2_3_1 """
  2.3.1 Strings
  1. Strings as Data:
  - Distinguishes a string like `"z"` (data, a single-character string) from a name `z` (whose value is looked up), building linked lists that mix numbers and strings.
  2. Equality on Strings:
  - Extends `==`/`!=` to strings and uses them to write `member`, which searches a linked list of strings or numbers for a matching item.
  3. Structural Equality:
  - Explains Python's `==` as recursively defined structural equality on linked lists (equal if built from equal elements in the same arrangement), distinguishing it from later discussions of "sameness" and mutation in chapter 3.

  Key terms: != (as string comparison operator), ", ', == (as general comparison operator), == (as string comparison operator), Henz, Martin, children of, Wrigstad, Tobias, daughter of, equal, equality (of linked lists), equality (of numbers), equality (of strings), equality (structural), linked list (equality of), member, number(s) (equality of), quotation marks (double), quotation marks (single), string(s), string(s) (equality of), structural equality
  """

  @summary_2_3_2 """
  2.3.2 Example: Symbolic Differentiation
  1. Differentiation as Symbol Manipulation:
  - Frames symbolic differentiation as a historically significant Lisp-family application: differentiate an algebraic expression with respect to a variable using a small set of reduction rules (sum rule, product rule, base cases for constants/variables).
  2. Abstract Data First:
  - Writes `deriv` purely in terms of assumed predicates/selectors/constructors (`is_sum`, `addend`, `augend`, `make_sum`, etc.), deferring the representation decision, exactly as with rational numbers.
  3. Prefix-Notation Representation:
  - Represents expressions as linked lists in prefix form (e.g. `llist("+", "x", 3)`), implements the selectors/constructors accordingly, and shows `deriv` producing correct but unsimplified results.
  4. Simplifying at Construction Time:
  - Fixes the unsimplified-output problem by teaching `make_sum`/`make_product` to fold constants and identities (e.g. adding 0, multiplying by 1) without touching `deriv` at all—reinforcing the abstraction-barrier payoff.

  Key terms: addend, algebraic expression (differentiating), algebraic expression (representing), algebraic expression (simplifying), augend, deriv, differentiation (rules for), differentiation (symbolic), infix notation (prefix notation vs.), is_number, is_product, is_same_variable, is_string, is_sum, is_variable (for algebraic expressions), make_product, make_sum, multiplicand, multiplier (selector), number_equal, prefix notation, prefix notation (infix notation vs.), simplification of algebraic expressions, symbolic differentiation, wishful thinking
  """

  @summary_2_3_3 """
  2.3.3 Example: Representing Sets
  1. Sets by Their Operations:
  - Defines a set abstractly via `union_set`, `intersection_set`, `is_element_of_set`, and `adjoin_set`, leaving the representation choice open—unlike rationals, this choice isn't obvious.
  2. Unordered vs. Ordered Linked Lists:
  - Implements sets as unordered linked lists first (Θ(n) membership, Θ(n²) intersection), then as ordered linked lists, which speed up membership checks on average and let intersection stop early, giving Θ(n) intersection.
  3. Binary Trees for Θ(log n) Search:
  - Represents a set as a binary tree (entry, left/right subtrees) where all left-subtree elements are smaller and all right-subtree elements larger, giving Θ(log n) search and insertion when the tree stays balanced.
  - Notes balance isn't automatic under `adjoin_set` and flags the general problem of keeping trees balanced (B-trees, red-black trees) as beyond this book's scope.
  4. Sets for Information Retrieval:
  - Generalizes the pattern to a `lookup` function over keyed records, connecting set representations directly to the design of simple databases.

  Key terms: B tree, Cormen, Thomas H., Hilfinger, Paul, Leiserson, Charles E., Rivest, Ronald L., Stein, Clifford, adjoin_set, adjoin_set (binary tree representation), adjoin_set (ordered linked list representation), adjoin_set (unordered linked list representation), balanced binary tree, binary search, binary tree, binary tree (balanced), binary tree (converting a linked list to a), binary tree (converting to a linked list), binary tree (represented with linked lists), binary tree (set represented as), data base (as set of records), entry, intersection_set, intersection_set (binary tree representation), intersection_set (ordered linked list representation), intersection_set (unordered linked list representation), is_element_of_set
  """

  @summary_2_3_4 """
  2.3.4 Example: Huffman Encoding Trees
  1. Fixed-Length vs. Variable-Length Codes:
  - Motivates variable-length codes (shorter codes for frequent symbols) as a way to shrink encoded messages below what fixed-length codes like ASCII require, while noting the problem of finding symbol boundaries.
  2. Prefix Codes and Huffman Trees:
  - Solves the boundary problem with prefix codes, where no code is a prefix of another, and represents such a code as a binary tree whose leaves are symbols and whose non-leaf nodes carry aggregated weights.
  3. Building and Using the Tree:
  - Gives the greedy tree-building algorithm (repeatedly merge the two lowest-weight nodes) and the `decode` function that walks the tree bit by bit, restarting at the root after each symbol.
  4. Representation Details:
  - Represents leaves and general trees as tagged linked lists (`make_leaf`, `make_code_tree`), with `symbols` and `weight` as small examples of *generic functions* that behave differently depending on leaf vs. tree input—foreshadowing sections 2.4 and 2.5.
  - Maintains the merge candidates as a weight-ordered set (`adjoin_set`, `make_leaf_set`) so the Huffman-building algorithm can repeatedly pull out the two smallest-weight items.

  Key terms: ASCII code, Hamming, Richard Wesley, Huffman code, Huffman code (optimality of), Huffman code (order of growth of encoding), Huffman, David, Morse code, adjoin_set (for weighted sets), binary tree (for Huffman encoding), character, ASCII encoding, code (ASCII), code (Morse), code (fixed length), code (prefix), code (variable length), decode, encode, fixed length code, generate_huffman_tree, generic function, is_leaf, left_branch, make_code_tree, make_leaf, make_leaf_set
  """

  @summary_2_4 """
  2.4 Multiple Representations for Abstract Data
  1. When One Representation Isn't Enough:
  - Extends data abstraction beyond hiding *a* representation to handling *multiple* representations of the same kind of data coexisting in one system (e.g. rectangular vs. polar complex numbers).
  2. Two New Needs:
  - Motivates *generic functions* that work across representations, and *type tags* that let a generic function tell which representation it's holding.
  - Introduces *data-directed programming* as the implementation strategy developed across this section for assembling such systems additively.

  Key terms: abstraction barriers, abstraction barriers (in complex number system), additivity, arithmetic (on complex numbers), complex number arithmetic, data abstraction, data directed programming, generic function, type tag
  """

  @summary_2_4_1 """
  2.4.1 Representations for Complex Numbers
  1. Rectangular and Polar Forms:
  - Presents two natural representations for complex numbers—(real, imaginary) and (magnitude, angle)—each convenient for different operations (addition vs. multiplication).
  2. Ben and Alyssa's Independent Choices:
  - Has Ben implement rectangular-form selectors/constructors and Alyssa implement polar-form ones, each deriving the "other" pair of values via trigonometric relations.
  - Shows that `add_complex`/`sub_complex`/`mul_complex`/`div_complex`, written only against the shared selector/constructor interface, work correctly regardless of which representation is actually installed.

  Key terms: add_complex, angle (polar representation), angle (rectangular representation), arctangent, complex numbers (polar representation), complex numbers (rectangular representation), complex numbers (rectangular vs.polar form), data abstraction, div_complex, imag_part (polar representation), imag_part (rectangular representation), magnitude (polar representation), magnitude (rectangular representation), make_from_mag_ang (polar representation), make_from_mag_ang (rectangular representation), make_from_real_imag (polar representation), make_from_real_imag (rectangular representation), math_atan2, mul_complex, real_part (polar representation), real_part (rectangular representation), roundoff error, sub_complex, trigonometric relations
  """

  @summary_2_4_2 """
  2.4.2 Tagged data
  1. Least Commitment, Pushed Further:
  - Extends the "defer the representation choice" principle to allowing *both* Ben's and Alyssa's representations to coexist, distinguished by an explicit *type tag* (`"rectangular"` or `"polar"`).
  2. Attach/Strip Tag Machinery:
  - Implements `attach_tag`, `type_tag`, and `contents` using ordinary pairs, plus `is_rectangular`/`is_polar` predicates built on `type_tag`.
  3. Generic Selectors Dispatch on Tag:
  - Renames Ben's and Alyssa's functions with `_rectangular`/`_polar` suffixes to avoid name clashes, then writes generic `real_part`/`imag_part`/`magnitude`/`angle` that check the tag and call the right underlying function.
  - Notes the resulting three-part structure (generic arithmetic, polar package, rectangular package) as a template scaled up in section 2.5.

  Key terms: angle (with tagged data), angle_polar, angle_rectangular, attach_tag, complex number arithmetic (structure of system), complex numbers (represented as tagged data), contents, data (tagged), generic function (generic selector), imag_part (with tagged data), imag_part_polar, imag_part_rectangular, is_polar, is_rectangular, least commitment, principle of, magnitude (with tagged data), magnitude_polar, magnitude_rectangular, make_from_mag_ang, make_from_mag_ang_polar, make_from_mag_ang_rectangular, make_from_real_imag, make_from_real_imag_polar, make_from_real_imag_rectangular, principle of least commitment
  """

  @summary_2_4_3 """
  2.4.3 Data-Directed Programming and Additivity
  1. Weaknesses of Explicit Dispatch:
  - Diagnoses two problems with the tag-checking style of 2.4.2: generic functions must know about every representation, and every package must avoid name clashes with every other package.
  2. Operation-and-Type Table:
  - Reframes the problem as a two-dimensional table (operation × type), and introduces `put`/`get` for installing and looking up entries, with each representation installed via its own `install_..._package` function.
  3. `apply_generic`:
  - Implements generic selectors purely in terms of a single `apply_generic` function that looks up `(op, type_tags)` in the table and applies the result—so adding a new representation requires no change to existing generic functions.
  4. Message Passing (alternative style):
  - Presents message passing as decomposing the table by columns instead of rows: data objects become dispatch functions that respond to operation-name "messages," foreshadowing chapter 3's object-based programming.

  Key terms: None, additivity, angle (data directed), apply_generic, apply_generic (with message passing), apply_in_underlying_javascript, data base (Insatiable Enterprises personnel), data base (data directed programming and), data directed programming, deriv (data directed), differentiation (symbolic), dispatching (comparing different styles), dispatching (on type), get, imag_part (data directed), install_polar_package, install_rectangular_package, is_none, magnitude (data directed), make_from_mag_ang, make_from_mag_ang (message passing), make_from_real_imag, make_from_real_imag (message passing), message passing, modularity (through dispatching on type)
  """

  @summary_2_5 """
  2.5 Systems with Generic Operations
  1. Generic Across Representations *and* Kinds:
  - Extends the data-directed idea from "generic over representations of one kind of data" (complex numbers) to "generic over different kinds of numbers" (ordinary, rational, complex) unified under one `add`/`sub`/`mul`/`div` interface.
  2. Additive System Structure:
  - Previews a system where ordinary arithmetic, rational arithmetic, and complex arithmetic packages are each designed separately yet combine additively into one generic-arithmetic system.

  Key terms: abstraction barriers (in generic arithmetic system), arithmetic (generic), generic arithmetic operations (structure of system), message passing
  """

  @summary_2_5_1 """
  2.5.1 Generic Arithmetic Operations
  1. Generic `add`/`sub`/`mul`/`div`:
  - Defines the top-level generic arithmetic functions purely via `apply_generic`, mirroring the complex-number selectors of 2.4.3.
  2. Installing Ordinary, Rational, and Complex Packages:
  - Installs a `python_number` package (tagging primitive numbers), reuses the unmodified rational-number code from 2.1.1 inside `install_rational_package`, and reuses the unmodified complex-arithmetic code from 2.4.1 inside `install_complex_package`.
  3. Two-Level Tagging:
  - Shows a rectangular complex number now carries two tags—`"complex"` then `"rectangular"`—stripped off one level at a time as the number is dispatched downward through the system.

  Key terms: Python (internal type system), add, additivity, attach_tag (using Python data types), complex, complex number arithmetic (interfaced to generic arithmetic system), contents (using Python data types), data types (in Python), div, equality (in generic arithmetic system), generic arithmetic operations, install_complex_package, install_python_number_package, install_rational_package, is_equal, is_equal_to_zero, is_number (data types and), is_string (data types and), make_complex_from_mag_ang, make_complex_from_real_imag, make_python_number, make_rational, mul, number(s) (in generic arithmetic system), ordinary numbers (in generic arithmetic system)
  """

  @summary_2_5_2 """
  2.5.2 Combining Data of Different Types
  1. The Cross-Type Problem:
  - Notes that treating types as fully independent leaves no way to combine values across types (e.g. adding a complex number to an ordinary number), and that adding an explicit function per type-pair doesn't scale.
  2. Coercion:
  - Introduces coercion functions and a coercion table (`put_coercion`/`get_coercion`) that let `apply_generic` convert one argument's type to the other's before retrying the operation.
  3. Towers of Types:
  - Describes a *tower* (integer ⊂ rational ⊂ real ⊂ complex) where each type has one supertype/subtype, letting a single `promote` function per type replace many pairwise coercions, and enabling automatic operation inheritance up the tower.
  4. Where Hierarchies Break Down:
  - Uses a geometric-figure example to show that many real type relationships form a general graph, not a tower (multiple supertypes/subtypes), making "raise" and "lower" ambiguous and noting this remains a genuinely hard, unresolved design problem.

  Key terms: add_complex_to_python_num, apply_generic (with coercion by raising), apply_generic (with coercion of multiple arguments), apply_generic (with coercion to simplify), apply_generic (with coercion), apply_generic (with tower of types), coercion, coercion (function), coercion (table), complex_to_complex, cross type operations, hierarchy of types, hierarchy of types (inadequacy of), math_round, object oriented programming languages, operation (cross type), programming language (object oriented), python_number_to_complex, python_number_to_python_, subtype, subtype (multiple), supertype, supertype (multiple), table (for coercion), tower of types
  """

  @summary_2_5_3 """
  2.5.3 Example: Symbolic Algebra
  1. Polynomials as Symbolic Structure:
  - Treats a "polynomial" as a syntactic form (variable + term list) rather than a mathematical function, sidestepping questions like whether two syntactically different polynomials are "the same."
  2. Polynomial Addition and Multiplication:
  - Implements `add_poly`/`mul_poly` via `add_terms`/`mul_terms`, requiring both polynomials to share the same indeterminate, and installs them as the `add`/`mul` operations for a new `"polynomial"` tag—reusing the generic-arithmetic machinery from 2.5.1.
  3. Sparse Term-List Representation:
  - Chooses a sparse representation (linked list of (order, coefficient) terms, highest to lowest) since most polynomials of interest have many zero terms, with `adjoin_term` dropping zero-coefficient terms.
  - Notes that because `add_terms`/`mul_terms` combine coefficients via the *generic* `add`/`mul`, coefficients that are themselves polynomials (multivariate polynomials in disguise) are handled automatically through recursive dispatch.
  4. Where Towers Fail Again:
  - Observes polynomial types don't form a tower either (a polynomial in x with polynomial-in-y coefficients vs. the reverse), and traces the extended-exercise arc toward rational functions, GCDs of polynomials, and the numerical pitfalls (pseudodivision) that arise when reducing them to lowest terms.

  Key terms: Euclid's Algorithm (for polynomials), Euclidean ring, Lagrange interpolation formula, Zippel, Richard E., add (used for polynomial coefficients), add_poly, add_terms, adjoin_term, algebraic expression, algorithm (probabilistic), canonical form, for polynomials, coeff, coercion (in algebraic manipulation), coercion (in polynomial arithmetic), conditional statement (conditional instead of alternative block), data directed recursion, dense polynomial, div_poly, div_terms, first_term, function (mathematical) (rational), gcd_terms, greatest common divisor (generic), greatest common divisor (of polynomials), hierarchy of types (in symbolic algebra)
  """
end
