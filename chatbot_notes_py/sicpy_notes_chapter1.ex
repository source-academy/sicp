defmodule Cadet.Chatbot.SicpyNotesWithIndex.Chapter1 do
  @moduledoc """
  Module to store SICPy (Python edition) notes for chapter 1, enriched
  with key terms drawn from the book's own back-of-book index.
  """
  @summary_1 """
  1. Building Abstractions with Functions
  1. Framing the Subject:
  - Opens with Locke's account of abstraction (combining, comparing, and separating ideas) as a lens for what programming is really about.
  - Frames computational processes as abstract, rule-following entities that manipulate data, directed by programs.
  2. Why Python:
  - Chooses Python as the language for expressing procedural ideas in this edition.
  - Sketches Python's history: created by Guido van Rossum at CWI in the early 1990s as a scripting/glue language, later becoming general-purpose.
  3. Python's Character and Implementation:
  - Notes Python's debt to ABC (indentation-based blocks, rich built-in types) and to Lisp-family ideas like first-class functions and lexical scoping, despite not being a Lisp descendant itself.
  - Describes CPython as the reference implementation, bytecode plus interpretation, and mentions performance strategies (C extensions like NumPy, experimental JIT work).
  4. Fit for This Book:
  - Argues Python's dynamic typing and functional features (def, lambda) keep the adaptation close to the original Scheme text.
  - Sets up function definitions (def) and lambda as playing the roles that define and lambda play in Scheme.

  Key terms: ABC, Amoeba operating system, CPython, CWI (Centrum Wiskunde en Informatica), Just In Time (JIT) compilation, Locke, John, Modula 3, NumPy, PLR (Python Language Reference), PyPy, Python, Python (CPython as reference implementation), Python (efficiency of), Python (history of), Python (versions 2 and 3), Python Enhancement Proposal (PEP), Python Language Reference (PLR), Python Software Foundation, Scheme, Scheme (dialect of Lisp), bug, bytecode, computational process, data, debug
  """

  @summary_1_1 """
  1.1: The Elements of Programming
  1. What a Language Needs:
  - Identifies three mechanisms every powerful language needs: primitive expressions, means of combination, and means of abstraction.
  - Frames a language as more than an instruction tool—also a way of organizing ideas about processes.
  2. Functions and Data:
  - Programming deals with two kinds of elements: data (the "stuff" manipulated) and functions (rules for manipulating it).
  - Notes that this distinction later gets blurred once data and functions are both first-class.
  3. Scope for This Chapter:
  - Restricts attention to simple numerical data so the focus can stay on building functions.
  - Flags (via a footnote) that numbers are a deceptively tricky foundation—integer/real distinctions, precision, roundoff—deferred to later.

  Key terms: combination, means of, data, data (numerical), integer(s), means of abstraction, means of combination, number(s), number(s) (integer vs. real number), numerical analysis, numerical data, primitive expression, programming, programming (elements of), real number, roundoff error, truncation error
  """

  @summary_1_1_1 """
  1.1.1 Expressions
  1. Interacting with the Interpreter:
  - Introduces programming as typing statements for a Python interpreter to evaluate.
  - Explains that this edition's interactive examples let a reader click a statement to run it.
  2. Primitive and Compound Expressions:
  - Numbers are primitive expressions; combining them with operators (+, -, *, /) makes compound expressions (\"combinations\").
  - Explicit printing is required to see a value—evaluating an expression alone displays nothing.
  3. Notation and Precedence:
  - Introduces infix notation, nesting of combinations, and Python's usual precedence/associativity rules (* and / bind tighter than + and -, left-to-right).
  4. Read-Evaluate-Print Loop:
  - Describes the interpreter's basic cycle: read a statement, evaluate it, print results of any print calls.

  Key terms: (as numeric subtraction operator), + (as numeric addition operator), arithmetic, arithmetic (operators for), associativity, combination, compound expression, expression, infix notation, infix operator, interpreter, interpreter (read evaluate print loop), left associative, nested operator combinations, notation in this book, notation in this book (slanted characters for interpreter response), number(s), operands of a combination, operator combination, operator of a combination, parentheses, precedence, primitive expression, primitive expression (number), read evaluate print loop
  """

  @summary_1_1_2 """
  1.1.2 Naming and the Environment
  1. Declaration Assignments:
  - Introduces name = value declaration assignments (e.g. size = 2) as the way Python associates names with values.
  - Shows names being reused in later expressions once declared.
  2. Naming as Abstraction:
  - Frames declaration assignment as the simplest form of abstraction: naming the result of a computation (like a circumference) so it can be reused without repeating details.
  3. Incremental Development:
  - Notes that building name-object associations incrementally, interaction by interaction, is central to how Python programs are developed and tested.
  4. The Environment:
  - Introduces the environment as the interpreter's memory of name-object pairs, flagged as important groundwork for chapters 3 and 4.

  Key terms: declaration, declaration assignment, environment, incremental development of programs, means of abstraction, means of abstraction (declaration assignment as), naming, naming (of computational objects), primitive expression, primitive expression (name of variable), program, program (incremental development of), program (structure of), program environment, syntactic forms, syntactic forms (declaration assignment), variable, variable (value of)
  """

  @summary_1_1_3 """
  1.1.3 Evaluating Operator Combinations
  1. A Recursive Evaluation Rule:
  - States the rule for evaluating an operator combination: evaluate the operands, then apply the operator's function to their values.
  - Points out this rule is recursive—it invokes itself on each operand.
  2. Recursion and Trees:
  - Uses a nested-combination example and a tree diagram to show values \"percolating upward\"—an instance of a general pattern called tree accumulation.
  3. Base Cases:
  - Grounds the recursion in primitive cases: numerals evaluate to the numbers they name, and names evaluate to whatever the environment associates with them.
  4. Declarations Are Different:
  - Clarifies that declaration assignments (x = 3) are not combinations and don't follow the operator-evaluation rule; they have their own syntactic form and evaluation rule.

  Key terms: branch of a tree, declaration assignment, declaration assignment (why a syntactic form), environment, evaluation, evaluation (of operator combination), evaluation (of primitive expression), node of a tree, operator combination, operator combination (evaluation of), primitive expression, primitive expression (evaluation of), recursion, recursion (expressing complicated process), syntactic form, syntax, terminal node of a tree, tree, tree (combination viewed as), tree accumulation
  """

  @summary_1_1_4 """
  1.1.4 Compound Functions
  1. Function Definitions as Abstraction:
  - Introduces def as a far more powerful abstraction than naming alone: it lets a compound operation be given a name and reused as a unit.
  - Walks through def square(x): return x * x as a first example, breaking down name, parameters, and body.
  2. Applying Functions:
  - Describes function application (e.g. square(21)) as a second kind of combination, alongside operator combinations, with its own evaluation rule (evaluate subexpressions, then apply).
  3. Building Up Functions:
  - Shows sum_of_squares defined in terms of square, and further functions built on top of that, illustrating how compound functions become building blocks.
  4. Primitive vs. Compound Functions:
  - Notes that primitive functions (like math_log) are used exactly like compound ones—callers can't tell the difference from how a function is used.

  Key terms: Python environment used in this book, argument(s), body of, body of a function, compound, compound function, compound function (used like primitive function), declaration, def, def (function definition), definition, evaluation, evaluation (of function application), function, function (creating with def), function (naming (with def )), function application, function application (evaluation of), function definition, function expression, keywords, keywords (def), keywords (return), math_log, name
  """

  @summary_1_1_5 """
  1.1.5 The Substitution Model for Function Application
  1. Substitution as a Mental Model:
  - Introduces the substitution model: to apply a compound function, replace its parameters with the argument values in its return expression, then evaluate.
  - Walks through evaluating f(5) step by step down to a final numeric answer.
  2. A Model, Not a Mechanism:
  - Stresses that substitution is a way to *think about* function application, not a description of how real interpreters actually work internally.
  - Previews that later chapters will replace this simplified model with more accurate ones, especially once mutation enters the picture in chapter 3.
  3. Applicative vs. Normal Order:
  - Contrasts applicative-order evaluation (evaluate arguments first, used by Python) with normal-order evaluation (substitute unevaluated expressions, then reduce).
  - Notes both give the same answer for the functions considered so far, but normal order redoes work and gets more complicated once mutation is involved.

  Key terms: Python, Python (applicative order evaluation in), Stoy, Joseph E., applicative order evaluation, modeling, modeling (in science and engineering), normal order evaluation, substitution model of function application
  """

  @summary_1_1_6 """
  1.1.6 Conditional Expressions and Predicates
  1. Conditional Expressions:
  - Introduces the consequent if predicate else alternative form for case analysis, using an absolute-value function as the running example.
  - Explains how the interpreter evaluates the predicate first, then only one branch.
  2. Chained Cases and Predicates:
  - Shows nested conditional expressions for multi-way case analysis, and introduces the vocabulary of predicates, clauses, and comparison operators (>=, ==, etc.).
  3. Logical Composition:
  - Covers and, or, and not as ways to build compound predicates, noting and/or are syntactic forms (short-circuiting) rather than ordinary operators.
  4. Exercises:
  - Practice exercises on evaluating expressions, translating a formula into Python, and reasoning about applicative- vs. normal-order behavior with a non-terminating argument.

  Key terms: "!=, (as numeric negation operator), <=, ==, >=, False, Landin, Peter, True, \#f, \#t, abs, absolute value, alternative, and (logical conjunction), and (logical conjunction) (evaluation of), and (logical conjunction) (why a syntactic form), applicative order evaluation, applicative order evaluation (normal order vs.), associativity, binary operator, boolean values (True, False), case analysis, case analysis (general), clause of a case analysis, compound expression
  """

  @summary_1_1_7 """
  1.1.7 Example: Square Roots by Newton's Method
  1. Declarative vs. Imperative Knowledge:
  - Contrasts the mathematical (declarative) definition of square root with the need for an imperative, step-by-step procedure a computer can execute.
  2. Newton's Method by Successive Approximation:
  - Describes improving a guess by averaging it with the radicand divided by the guess, tracing several iterations toward √2.
  3. Building the Program:
  - Assembles sqrt from small pieces: sqrt_iter, improve, average, and is_good_enough, each handling one part of the idea.
  4. A Complete, if Naive, Program:
  - Observes that this simple functional style is already enough to write any purely numerical program, with iteration achieved purely through function calls rather than special looping constructs.

  Key terms: Heron of Alexandria, Newton's method, average, computer science, computer science (mathematics vs.), conditional expression, conditional expression (why a syntactic form), correctness of a program, cube root, declarative vs. imperative knowledge, function (mathematical), function (mathematical) (Python function vs.), imperative vs. declarative knowledge, iterative process, iterative process (implemented by function call), looping constructs, mathematical function vs., mathematics, mathematics (computer science vs.), naming conventions, predicate, predicate (naming convention for), programming language, programming language (very high level), proving programs correct
  """

  @summary_1_1_8 """
  1.1.8 Functions as Black-Box Abstractions
  1. Decomposition into Subproblems:
  - Uses the sqrt example to show how a problem naturally splits into subproblems (guess-checking, improving, iterating), each handled by its own function.
  2. Functional Abstraction:
  - Introduces the idea of treating a function like square as a \"black box\"—callers care only what it computes, not how.
  - Shows two different implementations of square that are behaviorally indistinguishable from the outside.
  3. Local Names and Scope:
  - Explains that parameter names must be local (bound) to a function's body, and introduces the vocabulary of bound vs. free names and scope.
  - Warns that renaming a bound variable to clash with a free one (variable capture) introduces bugs.
  4. Internal Definitions and Block Structure:
  - Shows nesting helper functions (is_good_enough, improve, sqrt_iter) inside sqrt to hide them from the outside world.
  - Introduces lexical scoping: nested definitions can refer to the enclosing function's parameters directly, avoiding repeated argument passing.

  Key terms: Algol, Algol (block structure), abstraction, abstraction (functional), bind, black box, block, block structure, bound name, bug, bug (capturing a free name), capturing a free name, decomposition of program into parts, environment, environment (lexical scoping and), free name, free name (capturing), functional abstraction, internal definition, internal definition (free name in), internal definition (position of), lexical scoping, local name, name, name (bound)
  """

  @summary_1_2 """
  1.2 Functions and the Processes They Generate
  1. From Syntax to Behavior:
  - Shifts focus from how to write functions to how to predict the *processes* they generate when run.
  - Compares this to a chess novice who knows the rules but not yet the strategy.
  2. Local vs. Global Behavior:
  - Distinguishes a function's local evolution rule from the global shape of the process it produces over time.
  3. What This Section Covers:
  - Previews an examination of common process \"shapes\" (recursive, iterative, tree-recursive) and their consumption of time and space.

  Key terms: local evolution of a process, process, process (local evolution of)
  """

  @summary_1_2_1 """
  1.2.1 Linear Recursion and Iteration
  1. Two Ways to Compute Factorial:
  - Contrasts a recursive definition of factorial (n! = n · (n-1)!) with an iterative version built around a running product and counter.
  2. Recursive vs. Iterative Processes:
  - Distinguishes a *recursive process* (builds up a chain of deferred operations, then contracts) from an *iterative process* (state fully captured by a fixed set of variables).
  - Notes this is about the shape of the *process*, not whether the *function definition* is syntactically recursive.
  3. Space and Tail Recursion:
  - Observes that the recursive version needs growing memory to track deferred operations, while the iterative version runs in constant space.
  - Introduces tail recursion as the property that lets an iterative process run in constant space even when written as a recursive function call.
  4. Exercises:
  - Exercises comparing recursive/iterative formulations of addition and exploring Ackermann's function's rapid growth.

  Key terms: Ackermann's function, C (recursive functions in), Hewitt, Carl Eddie, Java, recursive functions in, Python, Python (tail recursion in), Python, recursive functions in, Scheme, Scheme (tail recursion in), Steele, Guy Lewis Jr., Sussman, Gerald Jay, deferred operations, factorial, factorial (linear iterative version), factorial (linear recursive version), function (mathematical), function (mathematical) (Ackermann's), iterative process, iterative process (implemented by function call), iterative process (linear), iterative process (recursive process vs.), linear growth, linear iterative process, linear recursive process, looping constructs
  """

  @summary_1_2_2 """
  1.2.2 Tree Recursion
  1. Fibonacci as Tree Recursion:
  - Introduces the naive recursive Fibonacci function and shows the tree-shaped, highly redundant process it generates.
  - Notes the number of steps grows exponentially, tied to the golden ratio.
  2. An Iterative Alternative:
  - Presents an iterative Fibonacci function using a pair of running values, showing it needs only linear steps.
  - Highlights the dramatic efficiency gap between the two formulations of the same function.
  3. Counting Change:
  - Works through a recursive solution to counting ways to make change, again tree-recursive and redundant, but easy to derive from a simple recurrence.
  4. Value of Tree Recursion:
  - Argues tree recursion, despite inefficiency here, is a natural fit for problems over hierarchical data structures explored later in the book.

  Key terms: Al Karaji, Bhaskara, Edwards, Anthony William Fairbank, Fibonacci numbers, Pascal's triangle, Yang Hui, binomial coefficients, count_change, counting change, efficiency, exponential growth, fib, fib (linear iterative version), fib (tree recursive version), golden ratio, memoization, process, process (tree recursive), recursive process, recursive process (tree), tabulation, tree recursive process
  """

  @summary_1_2_3 """
  1.2.3 Orders of Growth
  1. A Formal Notion of Growth:
  - Introduces Θ(f(n)) notation to describe how the resources (time, space) a process uses scale with problem size n.
  2. Applying It to Earlier Examples:
  - Classifies the recursive and iterative factorial, and tree-recursive Fibonacci, by their step and space growth (linear steps/linear space, linear steps/constant space, exponential steps/linear space respectively).
  3. What Order of Growth Does and Doesn't Tell You:
  - Notes that Θ notation hides constant factors, but still gives a useful sense of how resource use scales as problems get bigger.

  Key terms: cube, exponential growth, iterative process, iterative process (linear), linear growth, linear iterative process, linear iterative process (order of growth), linear recursive process, linear recursive process (order of growth), logarithmic growth, order notation, order of growth, order of growth (linear iterative process), order of growth (linear recursive process), order of growth (tree recursive process), process, process (order of growth of), process (resources required by), recursive process, recursive process (linear), recursive process (tree), sine, sine (approximation for small angle), tree recursive process, tree recursive process (order of growth)
  """

  @summary_1_2_4 """
  1.2.4 Exponentiation
  1. Linear Exponentiation:
  - Shows recursive and iterative versions of exponentiation, both requiring a number of steps proportional to the exponent.
  2. Fast (Logarithmic) Exponentiation:
  - Introduces successive squaring to compute powers in about log₂(n) steps, using evenness of the exponent to halve the work at each step.
  - Contrasts the dramatic difference between linear and logarithmic growth for large exponents.
  3. Exercises:
  - Exercises on writing an iterative logarithmic exponentiation, applying the same squaring idea to multiplication (repeated doubling/halving), and a logarithmic Fibonacci algorithm via matrix-like state transformations.

  Key terms: //, Chandah sutra, Kaldewaij, Anne, Knuth, Donald E., Pingala, ch rya, Rhind Papyrus, Russian peasant method of multiplication, Stoy, Joseph E., exponentiation, expt, expt (linear iterative version), expt (linear recursive version), fast_expt, fib, fib (logarithmic version), integer division, invariant quantity of an iterative process, is_even, iterative process, iterative process (design of algorithm), logarithmic growth, multiplication by Russian peasant method, order of growth, order of growth (logarithmic), remainder
  """

  @summary_1_2_5 """
  1.2.5 Greatest Common Divisors
  1. Euclid's Algorithm:
  - Defines GCD via the reduction GCD(a, b) = GCD(b, r), where r is the remainder of a divided by b, and expresses it as a short recursive function.
  - Notes this generates an iterative process with logarithmic growth in the number of steps.
  2. Lamé's Theorem:
  - Connects Euclid's algorithm's step count to the Fibonacci sequence, giving a rigorous logarithmic growth bound.

  Key terms: Euclid's Algorithm, Euclid's Algorithm (order of growth), Fibonacci numbers, Fibonacci numbers (Euclid's GCD algorithm and), Knuth, Donald E., applicative order evaluation, applicative order evaluation (normal order vs.), gcd, greatest common divisor, normal order evaluation, normal order evaluation (applicative order vs.)
  """

  @summary_1_2_6 """
  1.2.6 Example: Testing for Primality
  1. Trial Division:
  - Presents a √n-time primality test by searching for the smallest divisor greater than 1, stopping once a candidate divisor's square exceeds n.
  2. The Fermat Test:
  - Introduces Fermat's Little Theorem and uses it to build a probabilistic, logarithmic-time primality test based on modular exponentiation.
  - Explains that failing the test proves compositeness, while repeatedly passing it only makes primality increasingly likely.
  3. Probabilistic Algorithms and Limitations:
  - Notes the existence of Carmichael numbers that fool the Fermat test, and mentions sturdier variants (like Miller–Rabin) that can't be fooled the same way.
  - Connects fast primality testing to practical cryptography (e.g. RSA).

  Key terms: Adleman, Leonard, Carmichael numbers, Diophantus's Arithmetic , Fermat's copy of, Euler, Leonhard, Euler, Leonhard (proof of Fermat's Little Theorem), Fermat test for primality, Fermat test for primality (variant of), Leibniz, Baron Gottfried Wilhelm von, Leibniz, Baron Gottfried Wilhelm von (proof of Fermat's Little Theorem), Miller – Rabin test for primality, Miller, Gary L., RSA algorithm, Rabin, Michael O., Rivest, Ronald L., Shamir, Adi, UNIX, UNIX (epoch), Wiles, Andrew, algorithm, algorithm (probabilistic), alternate form, congruent modulo $n$, cosmic radiation, cryptography, divides
  """

  @summary_1_3 """
  1.3 Formulating Abstractions with Higher-Order Functions
  1. Beyond Numeric Abstraction:
  - Points out that naming numeric operations (like cube) is a limited form of abstraction if functions themselves can't be passed around.
  2. Higher-Order Functions:
  - Introduces higher-order functions—functions that take or return other functions—as a much more expressive abstraction mechanism, previewed for the rest of the section.

  Key terms: cube, higher order proceduresfunctions
  """

  @summary_1_3_1 """
  1.3.1 Functions as Arguments
  1. Spotting a Common Pattern:
  - Compares three summation-style functions (sum of integers, sum of cubes, a series approximating π/8) that differ only in which term function and next-value function they use.
  2. Abstracting the Pattern:
  - Factors out the shared shape into a general sum function taking term and next as function arguments, mirroring mathematical sigma notation.
  - Reconstructs the three original examples, plus a numerical integral function, as simple calls to sum.
  3. Exercises:
  - Exercises generalizing sum to product and a still more general accumulate (and a filtered variant), and rewriting sum iteratively.

  Key terms: Leibniz's series for, Leibniz, Baron Gottfried Wilhelm von, Leibniz, Baron Gottfried Wilhelm von (series for $\pi$), Simpson's Rule for numerical integration, Wallis's formula for, Wallis, John, abstraction, abstraction (common pattern and), accumulate, definite integral, factorial, factorial (with higher order functions), filter, filtered_accumulate, higher order proceduresfunctions, higher order proceduresfunctions (procedurefunction as argument), identity, inc, integral, pi_sum, product, relatively prime, series, summation of, sum, sum (iterative version)
  """

  @summary_1_3_2 """
  1.3.2 Constructing Functions using Lambda Expressions
  1. Anonymous Functions:
  - Introduces lambda parameters: expression as a way to create functions without naming them, avoiding clutter from throwaway helper functions.
  - Shows def name(x): return expr and name = lambda x: expr as equivalent.
  2. Local Variables via Declaration Assignment:
  - Compares three ways to introduce local variables in a function body (a helper function, an immediately-applied lambda, and plain declaration assignments), favoring the last for readability.
  - Notes declared names are scoped to the enclosing function and can't be used before their own declaration executes.
  3. Conditional Statements:
  - Introduces if/elif/else conditional *statements* (as opposed to conditional *expressions*), motivated by needing a local declaration only on some branches without breaking termination.

  Key terms: Church, Alonzo, Scheme, Scheme (use of lambda in), alternative, anonymous, conditional statement, conditional statement (alternative statements of), conditional statement (consequent statements of), conditional statement (need for), conditional statement (predicate, consequent, and alternative of), consequent, creating with lambdalambda expression, declaration, declaration (use of name before), else, function definition, function definition (lambda expression vs.), function expression, function expression (lambda expression as), if, integral, keywords, keywords (else), keywords (if), lambda expression
  """

  @summary_1_3_3 """
  1.3.3 Functions as General Methods
  1. Functions Expressing General Methods:
  - Frames this section around two general-purpose numerical methods—root-finding and fixed-point search—expressed directly as higher-order functions.
  2. The Half-Interval Method:
  - Presents a root-finding function that repeatedly bisects an interval where a function changes sign, converging on a zero.
  3. Fixed Points:
  - Defines a fixed point of a function and a fixed_point search function that iterates f until successive values stop changing much.
  - Reformulates square root as a fixed-point search, showing plain iteration oscillates while averaging successive guesses (\"average damping\") fixes convergence.

  Key terms: Euler, Leonhard, Lambert, J.H., approximation with half interval method, as continued fraction, average damping, calculator, fixed points with, continued fraction, continued fraction (golden ratio as), continued fraction (tangent as), cosine, cosine (fixed point of), error, fixed point, fixed point (computing with calculator), fixed point (golden ratio as), fixed point (square root as), fixed_point, function (mathematical), function (mathematical) ($\mapsto$ notation for), function (mathematical) (fixed point of), golden ratio, half interval method, half interval method (half_interval_method), higher order proceduresfunctions, higher order proceduresfunctions (procedurefunction as general method)
  """

  @summary_1_3_4 """
  1.3.4 Functions as Returned Values
  1. Functions Returning Functions:
  - Generalizes average damping into its own function that takes f and returns a new, damped version of f.
  2. Newton's Method as Fixed-Point Search:
  - Expresses Newton's method (using a numerical derivative approximation) as another instance of fixed-point search, giving yet another way to compute square roots.
  3. A General Abstraction:
  - Introduces fixed_point_of_transform, unifying the average-damping and Newton's-method approaches to square roots as two instances of one general pattern.
  4. First-Class Functions as the Payoff:
  - Closes chapter 1 by reflecting on how treating functions as first-class values (passed as arguments, returned as results) lets the same underlying idea be expressed, compared, and reused across many different problems.

  Key terms: LispPython, LispPython (first class proceduresfunctions in), Newton's method, Newton's method (half interval method vs.), Strachey, Christopher, average_damp, composition of functions, cube, cube root, cube_root, deriv, derivative of a function, differentiation, differentiation (numerical), first class, first class elements in language, fixed point, fixed point (cube root as), fixed point (fourth root as), fixed point (square root as), fixed_point, fixed_point_of_transform, fourth root, as fixed point, function (mathematical), function (mathematical) (composition of)
  """
end
