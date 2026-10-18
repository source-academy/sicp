defmodule Cadet.Chatbot.SicpyNotesWithIndex.Chapter4 do
  @moduledoc """
  Module to store SICPy (Python edition) notes for chapter 4, enriched
  with key terms drawn from the book's own back-of-book index.
  """
  @summary_4 """
  4. Metalinguistic Abstraction
  1. Establishing New Languages:
  - Frames *metalinguistic abstraction*—inventing new languages—as a powerful general strategy for controlling complexity, and argues the deepest version of this in programming is that an evaluator/interpreter is itself just another program.
  - Reframes prior chapters' systems (the polynomial package, the digital-logic simulator, the constraint propagator) as already being little special-purpose languages with their own primitives, means of combination, and means of abstraction.
  2. Chapter Roadmap:
  - Previews building a *metacircular* evaluator for a subset of Python (in Python), then modifying it three ways: normal-order/lazy evaluation (4.2), nondeterministic search via `amb` (4.3), and logic programming via a query language (4.4).

  Key terms: Barth, John, Friedman, Daniel P., Haynes, Christopher T., Scheme (evaluators written in), Wand, Mitchell, abstraction (metalinguistic), computer science, evaluator, high level language, machine language vs., machine language (high level language vs.), metalinguistic abstraction
  """

  @summary_4_1 """
  4.1 The Metacircular Evaluator
  1. Metacircular Means Self-Describing:
  - Defines an evaluator as metacircular when it's written in the same language it evaluates, and argues this isn't truly circular since evaluation is itself a process, and Python is our tool for describing processes.
  2. The Evaluate–Apply Cycle:
  - States the evaluator's core cycle: components reduce to functions applied to arguments, which reduce to further components in new environments, until reaching names (looked up) and primitives (applied directly).
  3. Data Abstraction for Syntax:
  - Previews that the evaluator will use abstract syntax predicates/selectors (e.g. `is_assignment`, `assignment_symbol`) so its logic never depends on the concrete representation of program text.

  Key terms: environment model of evaluation (metacircular evaluator and), evaluator (metacircular), metacircular evaluator, metacircular evaluator for Python, metacircular evaluator for Python (data abstraction in), metacircular evaluator for Python (environment model of evaluation in), metacircular evaluator for Python (evaluate–apply cycle), metacircular evaluator for Python (job of)
  """

  @summary_4_1_1 """
  4.1.1 The Core of the Evaluator
  1. `evaluate`'s Case Analysis:
  - Walks through `evaluate`'s dispatch over literal expressions, names, applications, operator combinations, conditionals, lambda expressions, sequences, return statements, function definitions, and assignments/declarations—each delegated to a small helper.
  2. `apply` and Return Values:
  - Defines `apply` to dispatch on primitive vs. compound functions, extending the function's captured environment with a frame binding parameters (and scanned-out local names) to arguments; introduces *return values* as a wrapper so `apply` can tell whether a function body's evaluation produced a genuine return or fell off the end (yielding `None`).
  3. Supporting Pieces:
  - Defines `llist_of_values` (evaluate each argument expression), `eval_conditional` (via `is_truthy`, since the implemented language's notion of true/false need not match the host language's), `eval_sequence`, `eval_return_statement`, and `eval_assignment`/`eval_declaration`.

  Key terms: abstract syntax (in metacircular evaluator), apply, apply (tail recursion and), apply_primitive_function, case analysis (data directed programming vs.), consciousness, expansion of, data directed programming (case analysis vs.), eval_assignment, eval_conditional, eval_declaration, eval_return_statement, eval_sequence, evaluate, expression (literal), higher order functions (in metacircular evaluator), is_truthy, literal expression, llist_of_values, llist_of_values (without higher order functions), metacircular evaluator for Python (component representation), metacircular evaluator for Python (data abstraction in), metacircular evaluator for Python (evaluate and apply), metacircular evaluator for Python (evaluate–apply cycle), metacircular evaluator for Python (higher order functions in), metacircular evaluator for Python (implemented language vs.implementation language)
  """

  @summary_4_1_2 """
  4.1.2 Representing Components
  1. From Program Text to Tagged Lists:
  - Introduces `parse`, which turns a program string into a tagged-list representation (e.g. `list("literal", 5)`, `list("name", "x")`)—deliberately echoing the tagged data of section 2.4.2—so that syntax predicates/selectors never have to re-derive structure from raw text.
  2. Cataloguing Component Types:
  - Works through the tagged-list shape and accessors for literals, names, applications, conditionals, lambda expressions, sequences, blocks, return statements, and assignments/declarations, each behind its own syntax predicate.
  3. Derived Components:
  - Shows function definitions and operator combinations (`+`, `&&`, `||`, etc.) are implemented as *derived components*: transformed into constant declarations or function applications rather than handled as new primitive cases, keeping `evaluate`'s core case analysis small.

  Key terms: && (as derived component), && (implementing in metacircular evaluator), && (parsing of), Scheme (let* in), abstraction barriers (in representing Python syntax), arg_expressions, assignment (parsing of), assignment_symbol, assignment_value_expression, block (parsing of), block_body, break, conditional expression (parsing of), conditional statement (parsing of), conditional_alternative, conditional_consequent, conditional_predicate, data abstraction, data directed programming (in metacircular evaluator), derived component, derived components in evaluator, derived components in evaluator (function definition), derived components in evaluator (operator combination), duplicate parameters, evaluate (data directed)
  """

  @summary_4_1_3 """
  4.1.3 Evaluator Data Structures
  1. Truthiness:
  - Defines `is_truthy`/`is_falsy` for the language being implemented, noting the implemented language's truthiness needn't coincide with the host Python's own—a subtlety worth pausing on since here the two languages happen to be the same.
  2. Functions and Return Values as Tagged Lists:
  - Represents compound functions as `llist("compound_function", parameters, body, env)` and return values as `llist("return_value", content)`, both accessed through small constructor/selector sets.
  3. Environments as Frame Chains:
  - Implements environments as lists of frames, each frame a pair of a symbol list and a value list; gives `lookup_symbol_value`, `extend_environment`, and `assign_symbol_value`, each scanning frame-by-frame outward until the empty environment signals an unbound-name error.

  Key terms: Crockford, Douglas, NaN, not a typo, Python (good parts), apply_primitive_function, assign_symbol_value, binding (deep), constant (in Python) (detecting assignment to), deep binding, enclosing_environment, extend_environment, falsiness, first_frame, frame_symbols, frame_values, function_body, function_environment, function_parameters, good parts of Python, is_boolean, is_compound_function, is_falsy, is_falsy (full Python version), is_primitive_function, is_return_value, is_truthy
  """

  @summary_4_1_4 """
  4.1.4 Running the Evaluator as a Program
  1. Bootstrapping the Global Environment:
  - Builds `setup_environment`, binding primitive function names/operators and constants (like `None`) into a fresh global frame, so `apply` has real objects to dispatch to when it reaches primitives.
  2. A Working Read-Evaluate-Print Loop:
  - Assembles a `driver_loop` around `evaluate` and the global environment, letting the metacircular evaluator actually run programs typed at it.

  Key terms: apply, apply_in_underlying_javascript, apply_primitive_function, driver loop (in metacircular evaluator), driver_loop (for metacircular evaluator), global environment (in metacircular evaluator), is_primitive_function, metacircular evaluator for Python (None), metacircular evaluator for Python (driver loop), metacircular evaluator for Python (global environment), metacircular evaluator for Python (primitive functions), metacircular evaluator for Python (running), primitive_function_objects, primitive_function_symbols, primitive_implementation, prompt, prompts, prompts (metacircular evaluator), setup_environment, symbol(s) (in global environment), the_global_environment, user_print, user_read, vector (data structure) (for arguments of apply)
  """

  @summary_4_1_5 """
  4.1.5 Data as Programs
  1. Programs as Machine Descriptions:
  - Reframes a program (e.g. `factorial`) as the description of an abstract machine, and the evaluator as a special "universal machine" that configures itself to emulate whatever machine a given program describes.
  2. The Universal Machine Idea:
  - Connects this to Turing's universal machine and the Church–Turing thesis: what's computable doesn't depend on the language or evaluator, only on an underlying notion of computability.
  3. Programs as the Evaluator's Data:
  - Observes that from the evaluator's perspective, a user's program is just a string (then a tagged list) to manipulate, illustrated via Python's own `eval` primitive, which parses and evaluates a string in the calling environment.

  Key terms: Church–Turing thesis, Halting Theorem, Hodges, Andrew, Hofstadter, Douglas R., Python (eval in), Turing machine, Turing, Alan M., computability, computer science, data (as program), eval, evaluator (as abstract machine), evaluator (as universal machine), factorial (as an abstract machine), halting problem, metacircular evaluator for Python, noncomputable, program (as abstract machine), program (as data), program (structured with subroutines), recursion theory, universal machine
  """

  @summary_4_1_6 """
  4.1.6 Internal Declarations
  1. Why Mutual Recursion Needs Simultaneous Scope:
  - Revisits mutually recursive `is_even`/`is_odd` (from 3.2.4) to argue the only sensible interpretation is that both names enter the block's frame simultaneously, before either declaration's value is computed.
  2. Scanning Out Names, Concretely:
  - Explains that the evaluator achieves this by scanning a block for all declared names and pre-populating a frame with `"*unassigned*"` placeholders before evaluating any declaration—so every name is visible (with the correct binding) to every other declaration in the same block from the start.

  Key terms: Gabriel, Richard P., Scheme ($Y$ operator written in), Stoy, Joseph E., block structure, factorial (without declaration or assignment), function definition (hoisting of), hoisting of function definitions, internal declaration (restrictions on), internal declaration (scanning out), internal declaration (scope of name), recursive function (specifying without declaration), scanning out declarations (in metacircular evaluator), scanning out declarations (sequential declaration processing vs.), scope of a name (internal declaration), sequential declaration processing vs.scanning out
  """

  @summary_4_1_7 """
  4.1.7 Separating Syntactic Analysis from Execution
  1. The Cost of Interleaving Analysis and Execution:
  - Diagnoses that the original evaluator wastefully re-parses a component's syntactic shape (e.g. "is this a conditional?") every single time it's evaluated, even inside a function called millions of times.
  2. `analyze` Returns an Execution Function:
  - Splits `evaluate` into `analyze` (does the syntactic case-analysis once, producing an *execution function* closed over the already-extracted pieces) and the execution function itself (takes only an environment and does the runtime work), so `evaluate(component, env)` becomes simply `analyze(component)(env)`.
  3. Reworking Every Case:
  - Rewrites literal, name, application, conditional, lambda, sequence, block, return, assignment, and declaration handling in this analyze/execute style, noting sequences and lambda bodies benefit particularly since their internal structure is now analyzed only once no matter how many times they run.

  Key terms: Adams, Norman I., IV, Feeley, Marc, Lapalme, Guy, Rees, Jonathan A., analyze (metacircular), analyze_... (metacircular), analyzing evaluator, efficiency (of evaluation), evaluate (analyzing version), execute_application (metacircular), execution function (in analyzing evaluator), metacircular evaluator for Python (analyzing version), metacircular evaluator for Python (efficiency of), syntactic analysis, separated from execution (in metacircular evaluator), while loop (implementing in analyzing evaluator)
  """

  @summary_4_2 """
  4.2 Lazy Evaluation
  1. The Evaluator as an Experimental Platform:
  - Notes that once the evaluator is itself a Python program, we can explore language-design alternatives just by modifying it—illustrated by borrowing ("snarfing") Python's own primitives and control structure to build variant languages cheaply.
  2. Roadmap:
  - Previews turning the metacircular evaluator into a normal-order evaluator with lazy, non-strict compound functions (4.2.1–4.2.3).

  Key terms: Raymond, Eric, Steele, Guy Lewis Jr., delayed evaluation (in lazy evaluator), embedded language, language design using, lazy evaluator, programming language (design of), snarf
  """

  @summary_4_2_1 """
  4.2.1 Normal Order and Applicative Order
  1. Applicative vs. Normal Order, Revisited:
  - Recalls that Python is applicative-order (arguments evaluated eagerly at call time) versus normal-order (argument evaluation delayed until actually needed), and names *lazy evaluation* as delaying evaluation until the last possible moment.
  2. A Function That Exposes the Difference:
  - Uses `try_me(a, b)` (returning 1 without ever touching `b` when `a == 0`) to show a call like `try_me(0, head(None))` only succeeds under normal-order/lazy semantics, since applicative order would eagerly evaluate `head(None)` and error first.

  Key terms: Hassle, applicative order evaluation (normal order vs.), lazy evaluation, non strict, normal order evaluation (applicative order vs.), strict, syntactic form (function vs.)
  """

  @summary_4_2_2 """
  4.2.2 An Interpreter with Lazy Evaluation
  1. Thunks Replace Eager Arguments:
  - Makes compound functions (but not primitives) non-strict: unevaluated argument expressions are packaged into *thunks* (expression + environment), only *forced* (actually evaluated) when their value is genuinely needed.
  2. Reworking `evaluate`/`apply`:
  - Introduces `actual_value` (evaluate, then force if the result is a thunk) used wherever a real value is required (primitive arguments, conditional predicates, the function position of an application); has `apply` evaluate primitive arguments eagerly via `list_of_arg_values` but delay compound-function arguments via `list_of_delayed_args`.
  3. Memoized Thunks:
  - Implements `force_it`/`delay_it` so a thunk, once forced, mutates itself into an "evaluated thunk" caching its value—avoiding repeated recomputation—while noting the same `delay_it` works whether or not memoization is used.

  Key terms: Algol (call by name argument passing), Algol (thunks), Clinger, William, Ingerman, Peter, actual_value, apply, call by name argument passing, call by need argument passing, delay_it, driver loop (in lazy evaluator), driver_loop (for lazy evaluator), eval_conditional, evaluate, for_each, force_it, force_it (memoized version), forcing (of thunk), garbage collection (memoization and), lazy evaluator, list_of_arg_values, list_of_delayed_args, memoization (garbage collection and), memoization (of thunks), prompts (lazy evaluator), thunk
  """

  @summary_4_2_3 """
  4.2.3 Streams as Lazy Lists
  1. Lazy Evaluation Subsumes Streams:
  - Observes that with a lazy interpreter, ordinary lists and streams collapse into the same thing, since `pair`'s second argument is now automatically non-strict—eliminating the need for a whole parallel family of `stream_*` operations from chapter 3.
  2. Redefining `pair` as a Function:
  - Achieves this without needing new interpreter machinery for non-strict primitives, by using the functional representation of `pair`/`head`/`tail` (section 2.1.3) and simply defining them at the driver loop—since compound functions are already non-strict.

  Key terms: Hughes, R. J. M., add_lists, delayed evaluation (explicit vs.automatic), delayed evaluation (in lazy evaluator), delayed expression (explicit vs.automatic), delayed expression (lazy evaluation and), head (functional implementation of), integers (lazy list version), integral (lazy list version), lambda expression (lazy evaluation and), lazy list, lazy pair, lazy tree, list(s) (lazy), list_ref, map, ones (lazy list version), pair (functional implementation of), pair(s) (functional representation of), pair(s) (lazy), promise to evaluate (lazy evaluation and), scale_list, solve (lazy list version), stream(s) (implemented as lazy lists), tail (functional implementation of)
  """

  @summary_4_3 """
  4.3 Nondeterministic Computing
  1. A Different Image of "Generate and Test":
  - Introduces nondeterministic computing as a much more profound evaluator change than laziness: instead of generating and filtering whole sequences of candidates (chapters 2 and 3), a nondeterministic program simply "chooses" a value and requires a condition on it, e.g. `prime_sum_pair` using `an_element_of` and `require`.
  2. Branching Time:
  - Contrasts stream processing's image (all possible answers laid out timelessly) with nondeterministic evaluation's image (time branches at each choice; failed branches are abandoned and a previous choice is revisited).
  3. The `amb` Evaluator:
  - Names the resulting evaluator the `amb` evaluator, after its key new syntactic form, previewing sections 4.3.1 (the `amb` mechanism), 4.3.2 (worked examples), and 4.3.3 (the implementation).

  Key terms: automatic search, declarative vs.imperative knowledge (nondeterministic computing and), imperative vs.declarative knowledge (nondeterministic computing and), nondeterministic computing, nondeterministic programming vs.Python programming, nondeterministic programs (pairs with prime sums), prime_sum_pair, time (in nondeterministic computing)
  """

  @summary_4_3_1 """
  4.3.1 Search and `amb`
  1. `amb` and `require`:
  - Introduces `amb(e1, ..., en)`, which ambiguously returns the value of one of its arguments, with zero-argument `amb()` representing outright failure; builds `require(p)` (fails via `amb()` if `p` is false) and `an_element_of`/`an_integer_starting_from` on top of it.
  2. Systematic Search, Not Random Choice:
  - Explains the evaluator's strategy: always try the first alternative at each choice point; on failure, *backtrack* to the most recent choice point and try the next alternative—depth-first search / chronological backtracking—rather than random retrying.
  3. The Driver Loop's `retry`:
  - Shows the `amb` evaluator's driver loop prints the first successful value for a query, and typing `retry` backtracks to find the next successful value, until alternatives are exhausted.

  Key terms: Chapman, David, Charniak, Eugene, Conniver, Doyle, Jon, Floyd, Robert, Forbus, Kenneth D., Hewitt, Carl Eddie, McAllester, David Allen, McCarthy, John, McDermott, Drew, MicroPlanner, Planner, Prolog, Pythagorean triples (with nondeterministic programs), Raymond, Eric, Scheme (nondeterministic extension of), Stallman, Richard M., Steele, Guy Lewis Jr., Sussman, Gerald Jay, Winograd, Terry, Winston, Patrick Henry, Zabih, Ramin, amb, an_element_of, an_integer_starting_from
  """

  @summary_4_3_2 """
  4.3.2 Examples of Nondeterministic Programs
  1. Logic Puzzles as Constraint Satisfaction:
  - Solves the Gargle office-move puzzle by assigning each person an `amb`-chosen office number and stacking `require`s for each stated constraint (distinctness, ordering, adjacency)—illustrating how nondeterministic style lets a puzzle's stated constraints double directly as the program.
  2. Parsing Natural Language:
  - Builds a tiny natural-language parser (`parse_sentence`, `parse_noun_phrase`, `parse_word`) over word lists (`nouns`, `verbs`, `articles`) and a mutable `not_yet_parsed` input, where `amb`-driven choice among grammar rules and backtracking (which must undo the assignment to `not_yet_parsed`) does the work of trying alternative parses.

  Key terms: Dinesman, Howard P., Gargle, Phillips, Hubert, Winston, Patrick Henry, abstraction (of search in nondeterministic programming), articles, chess, eight queens puzzle, distinct, eight queens puzzle, generating sentences, grammar, logic puzzles, nondeterministic computing, nondeterministic evaluator (order of argument evaluation), nondeterministic programming vs.Python programming, nondeterministic programs (logic puzzles), nondeterministic programs (parsing natural language), nouns, office_move, parse_..., parsing natural language, parsing natural language (real language understanding vs.toy parser), prepositions, puzzles (eight queens puzzle), puzzles (logic puzzles)
  """

  @summary_4_3_3 """
  4.3.3 Implementing the `amb` Evaluator
  1. Success and Failure Continuations:
  - Builds the `amb` evaluator on top of the analyzing evaluator (4.1.7), giving every execution function two extra arguments—a *success continuation* (value, next-failure-continuation) and a *failure continuation* (no arguments)—as the mechanism for backtracking.
  2. Reworking Every Construct:
  - Threads continuations through literals, names, conditionals, sequences, declarations, return statements, blocks, and applications (via a `get_args` helper), each construct's execution function now built to call `succeed`/`fail` rather than simply returning a value.
  3. Assignments Must Undo Themselves:
  - Has a successful assignment's continuation save the variable's old value and construct a *new* failure continuation that restores it before propagating failure further back—so backtracking past an assignment always leaves the environment as it was.
  4. `amb` as the Choice Point:
  - Implements `analyze_amb` as a loop (`try_next`) over each choice's execution function, where each choice's failure continuation is "try the next choice," and running out of choices calls the `amb` expression's own failure continuation.
  5. The Retry-Aware Driver Loop:
  - Builds a driver loop whose `internal_loop` either starts a fresh `ambeval` call or, on `retry`, invokes the failure continuation saved from the previous success—reusing the success continuation's second argument as "the way to find the next answer."

  Key terms: ambeval, analyze (nondeterministic), analyze_... (nondeterministic), analyze_amb, analyzing evaluator (as basis for nondeterministic evaluator), continuation (in nondeterministic evaluator), driver loop (in nondeterministic evaluator), driver_loop (for nondeterministic evaluator), execute_application (nondeterministic), execution function (in nondeterministic evaluator), failure continuation (nondeterministic evaluator), failure continuation (nondeterministic evaluator) (constructed by amb), failure continuation (nondeterministic evaluator) (constructed by assignment), failure continuation (nondeterministic evaluator) (constructed by driver loop), failure, in nondeterministic computation (bug vs.), internal declaration (in nondeterministic evaluator), is_amb, nondeterministic evaluator, prompts (nondeterministic evaluator), require (as a syntactic form), success continuation (nondeterministic evaluator)
  """

  @summary_4_4 """
  4.4 Logic Programming
  1. Relations Instead of Unidirectional Functions:
  - Contrasts ordinary (and even nondeterministic) programming's bias toward unidirectional, well-defined-input/output computations with *logic programming*, which combines a relational view of computation with symbolic pattern matching called *unification*.
  2. Chapter Roadmap:
  - Previews building a query language for deductive information retrieval (4.4.1), explaining how the evaluator works via pattern matching, unification, and streams of frames (4.4.2), examining where it diverges from real mathematical logic (4.4.3), and a full implementation (4.4.4).

  Key terms: Colmerauer, Alain, Feigenbaum, Edward, Green, Cordell, Hewitt, Carl Eddie, Kowalski, Robert, MIT, Prolog, Raphael, Bertram, Robinson, J. A., Shrobe, Howard E., University of Edinburgh, University of Marseille, append (what is (rules) vs.how to (function)), computer science (mathematics vs.), declarative vs.imperative knowledge, declarative vs.imperative knowledge (logic programming and), imperative vs.declarative knowledge, imperative vs.declarative knowledge (logic programming and), logic programming, logic programming (computers for), logic programming (history of), logic programming (in Japan), logic programming (logic programming languages), mathematics (computer science vs.), programming language (logic)
  """

  @summary_4_4_1 """
  4.4.1 Deductive Information Retrieval
  1. Assertions as a Personnel Database:
  - Builds a sample data base of `address`/`job`/`salary`/`supervisor`/`can_do_job` assertions for a fictional company (Gargle), where assertions look like ordinary function applications but represent stored facts rather than computations.
  2. Simple Queries and Pattern Variables:
  - Introduces `$`-prefixed pattern variables (e.g. `job($x, list("computer", "programmer"))`), showing a query is satisfied by every variable assignment that makes the instantiated pattern match some data-base entry, including patterns using `pair` to match "anything starting with...".
  3. Compound Queries — `and`/`or`/`not`/`javascript_predicate`:
  - Extends simple queries with logical combinators mirroring mathematical logic's connectives, plus an escape hatch, `javascript_predicate`, for embedding an arbitrary Python-level predicate over instantiated pattern variables.
  4. Rules as Abstraction for Queries:
  - Introduces `rule(conclusion, body)` (e.g. `lives_near`, `wheel`) as the query language's means of abstraction, and shows via `append_to_form` that the same two rules can be run "forward" or "backward"—finding an append result, decomposing a result into parts, or enumerating all decompositions—something an ordinary unidirectional function cannot do.

  Key terms: Ada, Gargle, Genesis, administrative assistant, importance of, and, append_to_form, assertion, assertion (implicit), compound query, data base (Gargle personnel), data base (logic programming and), instantiate a pattern, javascript_predicate, last_pair (rules), lives_near, naming conventions ($\$$ for pattern variables), next_to_in, not, or, outranked_by, pattern, pattern variable, query language, query language (abstraction in), query language (data base)
  """

  @summary_4_4_2 """
  4.4.2 How the Query System Works
  1. Pattern Matching:
  - Defines a pattern matcher as taking a pattern, a datum, and a frame of existing variable bindings, returning either an extended frame or failure—the sole mechanism needed for evaluating simple queries against the data base.
  2. Streams of Frames as the Organizing Idea:
  - Explains that a query processes an *input stream of frames*, producing an output stream of all extensions—so `and` becomes a series composition of queries (each filtering/extending the previous stream), `or` a parallel composition with merged output streams, and `not`/`javascript_predicate` become filters that drop frames satisfying (or failing) an inner query.
  3. Unification Generalizes Matching:
  - Introduces unification (both sides of a match may contain variables) as necessary for applying rules: unify the query pattern against a rule's conclusion to extend the frame, then evaluate the rule's body query relative to that extended frame—directly paralleling how `apply` binds parameters and evaluates a function body in the extended environment.
  4. `evaluate_query` and the Driver Loop:
  - Names `evaluate_query` as the analog of `evaluate`, dispatching on query type, and describes the driver loop's `assert` command for adding new assertions/rules to the data base at runtime.

  Key terms: and (evaluation of), assert, compound query (processing), data base (indexing), driver loop (in query interpreter), efficiency (of data base access), efficiency (of query processing), evaluate_query, frame (query interpreter), indexing a data base, javascript_predicate (evaluation of), not (evaluation of), or (evaluation of), pattern matching, pattern matching (unification vs.), query interpreter (Python interpreter vs.), query interpreter (adding rule or assertion), query interpreter (driver loop), query interpreter (frame), query interpreter (overview), query interpreter (pattern matching), query interpreter (query evaluator), query interpreter (streams of frames), query interpreter (unification), rule (query language) (applying)
  """

  @summary_4_4_3 """
  4.4.3 Is Logic Programming Mathematical Logic?
  1. Procedural Interpretation Has Consequences:
  - Argues the query language only resembles mathematical logic on the surface, since it imposes a *control structure* (order of clause evaluation) on logical statements—meaning logically equivalent reorderings of an `and` query can have wildly different efficiency.
  2. Infinite Loops from Procedural Rule Application:
  - Shows that naively-ordered recursive rules (e.g. a `married` rule stated before its recursive/base cases are reachable) can send the evaluator into an infinite loop, since "what to compute" and "how to compute it" aren't fully separated after all.
  3. `not` Isn't Quite Logical Negation:
  - Demonstrates that reordering `and(supervisor(...), not(job(...)))` versus `and(not(job(...)), supervisor(...))` changes the result, because `not` acts as a frame filter that misbehaves on unbound variables; contrasts the query language's `not` (closed-world "not deducible from the data base") with logical negation's "not true."

  Key terms: Clark, Keith L., Mouse, Minnie and Mickey, bureaucracy, closed world assumption, control structure, de Kleer, Johan, declarative vs.imperative knowledge (logic programming and), imperative vs.declarative knowledge (logic programming and), inference, method of, javascript_predicate, logic programming (mathematical logic vs.), negation as failure, not, outranked_by, query interpreter (improvements to), query interpreter (infinite loops), query interpreter (problems with not and javascript_predicate), query language (extensions to), query language (mathematical logic vs.), reverse (rules), wheel
  """

  @summary_4_4_4 """
  4.4.4 Implementing the Query System
  1. Driver Loop and Top-Level Dispatch:
  - Implements `query_driver_loop` (parse, convert to query syntax, either add a rule/assertion or run `evaluate_query` against a singleton empty-frame stream and print instantiated results) and `evaluate_query` itself, data-directed-dispatching via `get`/`put` just as in chapter 2's generic operations.
  2. Compound Queries and Filters:
  - Implements `conjoin` (series composition for `and`), `disjoin` (parallel composition, merged via `interleave_delayed`, for `or`), `negate` (drops frames where the negated query succeeds), and `javascript_predicate` (drops frames where the instantiated Python predicate is false)—each installed into the dispatch table.
  3. Pattern Matching and Unification, in Full:
  - Gives the recursive `pattern_match`/`extend_if_consistent` pair for one-sided matching against assertions, and `unify_match`/`extend_if_possible`/`depends_on` for the symmetric case needed by rules—including the subtlety of rejecting a variable binding that would create a self-referential (occurs-check) cycle.
  4. Renaming Variables and Indexing the Data Base:
  - Explains `rename_variables_in` (giving every rule application fresh variable names, e.g. `$x_7`, so unrelated uses of `$x` across rule applications never collide) and a simple data-base index keyed by an assertion/rule-conclusion's first element, so matching skips obviously-irrelevant entries.
  5. Streams and Query-Language Syntax:
  - Introduces `stream_append_delayed`/`interleave_delayed`/`stream_flatmap` (delayed variants needed so infinite rule recursion doesn't loop before producing any output) and the `parse`/`unparse`/`convert_to_query_syntax` pipeline that bridges Python's own syntax representation to the query language's own tagged-list forms.

  Key terms: Jaffar, Joxan, Stuckey, Peter J., abstract syntax (in query interpreter), abstraction barriers (in query language), add_rule_or_assertion, always_true, and (evaluation of), apply_a_rule, apply_rules, assertion_body, binding_in_frame, binding_value, binding_variable, block structure (in query language), check_an_assertion, compound query (processing), conclusion, conjoin, contents, convert, convert_to_query_syntax, data base (indexing), data directed programming (in query interpreter), depends_on, disjoin
  """
end
