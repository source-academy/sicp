defmodule Cadet.Chatbot.SicpyNotesWithIndex.Chapter3 do
  @moduledoc """
  Module to store SICPy (Python edition) notes for chapter 3, enriched
  with key terms drawn from the book's own back-of-book index.
  """
  @summary_3 """
  3. Modularity, Objects, and State
  1. Beyond Functions and Data:
  - Argues that functions and compound data alone aren't enough to organize large programs; we also need strategies for structuring a system into modular, separately maintainable parts.
  - Proposes basing program structure on the structure of the system being modeled: one computational object per real-world object.
  2. Two World Views:
  - Contrasts an *object-based* view (a system as distinct objects with changing state over time) with a *stream-processing* view (a system as signals flowing through it), previewing both as organizing strategies for the chapter.
  3. What Each View Costs:
  - Notes that objects with changing state force abandoning the substitution model in favor of an environment model of evaluation, while the stream view exploits delayed evaluation to decouple simulated time from evaluation order.

  Key terms: Heraclitus, Karr, Alphonse, delayed evaluation, environment model of evaluation, modeling (as a design strategy), modularity, object(s), stream(s)
  """

  @summary_3_1 """
  3.1 Assignment and Local State
  1. Objects Have State:
  - Defines an object as "having state" when its behavior depends on its history, characterized by one or more state variables (e.g. a bank account's balance).
  - Notes objects in a system are rarely fully independent; their state variables couple to each other, and good modeling groups tightly-coupled variables into objects.
  2. Assignment as the Enabling Mechanism:
  - Argues that modeling time-varying state with ordinary names requires an *assignment operation* that can change the value bound to a name.

  Key terms: assignment, assignment (assignment operation), local state, state variable
  """

  @summary_3_1_1 """
  3.1.1 Local State Variables
  1. A Withdraw Function with Memory:
  - Introduces `withdraw`, whose repeated calls with the same argument return different results—new behavior no function in chapters 1–2 exhibited—by mutating a `balance` variable via reassignment.
  2. `global` and `nonlocal`:
  - Uses `global balance` to let `withdraw` reassign a module-level `balance`, then shows how to make `balance` genuinely local and inaccessible from outside by nesting `withdraw` inside `make_withdraw_balance_100` and using `nonlocal balance` so the inner reassignment targets the enclosing frame's variable rather than declaring a new one.
  3. Independent Objects via `make_withdraw`:
  - Generalizes to `make_withdraw(balance)`, showing that each call creates a fully independent withdrawal object (`W1`, `W2`) with its own state.
  4. Bank Accounts via Message Passing:
  - Builds `make_account`, combining local state (`balance`) with a `dispatch` function that hands out `withdraw` or `deposit` by message—reusing the message-passing style from section 2.4.3, now combined with mutation.
  - Flags that the substitution model can no longer explain such functions, motivating the environment model developed in 3.2.

  Key terms: accumulator, assignment (equality test vs.), bank account, bank account (password protected), deposit, encapsulated name, hiding principle, local state variable, make_account, make_accumulator, make_monitored, make_withdraw, math_random (reassignment needed for), message passing (in bank account), modularity (hiding principle), monitored function, name (encapsulated), new_withdraw, object(s) (with time varying state), operation and type table (assignment needed for), password protected bank account, random number generator, reassignment, reassignment (reassignment statement), sequence of statements
  """

  @summary_3_1_2 """
  3.1.2 The Benefits of Introducing Reassignment
  1. Encapsulating a Random-Number Generator:
  - Uses `make_rand`/`rand`, wrapping `rand_update` with a hidden state variable `x`, so callers never have to thread the current random value through their own code.
  2. Monte Carlo Simulation as the Payoff:
  - Implements `estimate_pi`/`monte_carlo`/`dirichlet_test` using `rand`, then contrasts this with a version using `rand_update` directly, where the random state has to leak into `random_gcd_test` and `estimate_pi` as explicit parameters.
  - Concludes that reassignment's encapsulation of hidden state is what preserves modularity: callers of `monte_carlo` don't need to know an experiment happens to need random numbers threaded through it.

  Key terms: Chaitin, Gregory, Dirichlet, Peter Gustav Lejeune, Knuth, Donald E., Kolmogorov, A. N., Monte Carlo integration, Monte Carlo simulation, Solomonoff, Ray, definite integral (estimated with Monte Carlo simulation), dirichlet_test, estimate_integral, estimate_pi, greatest common divisor (used to estimate $\pi$), modularity (through modeling with objects), monte_carlo, object(s) (benefits of modeling with), pseudo random sequence, rand, rand (with reset), random number generator, random number generator (in Monte Carlo simulation), random number generator (with reset), random_in_range, reassignment (benefits of)
  """

  @summary_3_1_3 """
  3.1.3 The Costs of Introducing Assignment
  1. Substitution Model Breaks:
  - Shows that `make_decrementer` (no assignment) is still explainable via substitution, but `make_simplified_withdraw` is not—naive substitution would set `balance` after already having returned its old value, which is nonsensical once assignment is present.
  - Names *functional programming* (chapters 1–2's style) versus needing a new evaluation model once assignment enters the picture.
  2. Sameness and Change:
  - Uses `D1`/`D2` (interchangeable) versus `W1`/`W2` (not interchangeable, despite being "equally" constructed) to introduce *referential transparency* and its loss under assignment.
  - Discusses *aliasing* (`peter_acc`/`paul_acc` naming the same object) as a concrete source of confusion once objects can change.
  3. Pitfalls of Imperative Style:
  - Shows a `factorial` rewritten with explicit `nonlocal product, counter` assignments, where swapping the order of the two assignment statements silently breaks correctness—a class of bug impossible in purely functional code.

  Key terms: Lampson, Butler, Morris, J. H., Schmidt, Eric, Steele, Guy Lewis Jr., Wadler, Philip, aliasing, assignment, assignment (bugs associated with), assignment (costs of), bank account (joint), bug (order of assignments), bug (side effect with aliasing), change and sameness (meaning of), equality (referential transparency and), factorial (with assignment), functional programming, imperative programming, local state, make_decrementer, make_joint, make_simplified_withdraw, order of evaluation (assignment and), order of evaluation (in Python), programming (imperative), referential transparency
  """

  @summary_3_2 """
  3.2 The Environment Model of Evaluation
  1. Why a New Model:
  - Explains that once assignment can change what a name refers to, a name must denote a "place" where a value is stored rather than simply standing for a value—motivating environments as the new model of evaluation.
  2. Frames and Bindings:
  - Defines an environment as a sequence of frames, each a table of name-to-value bindings with a pointer to an enclosing environment, and defines shadowing and the global/program environment.

  Key terms: binding, enclosing environment, environment, environment (enclosing), environment model of evaluation, environment model of evaluation (environment structure), frame (environment model), frame (environment model) (global), global environment, global frame, name (unbound), name (value of), program environment, shadow a binding, substitution model of function application, unbound name
  """

  @summary_3_2_1 """
  3.2.1 The Rules for Evaluation
  1. Functions as Code Plus Environment:
  - Redefines a function object as a pair of code (from a lambda expression) and a pointer to the environment in which that lambda was evaluated—replacing the substitution model's purely textual view of functions.
  2. The Two Evaluation Rules:
  - States the two core rules: applying a function creates a new frame (binding parameters to argument values) whose enclosing environment is the function's own environment; a lambda expression, when evaluated, creates such a function object.
  3. Reassignment Rule:
  - Defines evaluating `name = value` as finding the first frame that binds `name` and updating that binding, signaling an "variable undeclared" error if no such frame exists.

  Key terms: assignment (evaluation of), declaration (environment model of), environment model of evaluation (function application), environment model of evaluation (rules for evaluation), function application (environment model of), lambda expression (value of), order of evaluation (in Python), square (in environment model)
  """

  @summary_3_2_2 """
  3.2.2 Applying Simple Functions
  1. Worked Example:
  - Walks through evaluating `f(5)` using `square`, `sum_of_squares`, and `f`, tracing the successive environments (E1–E4) created for each function call.
  2. Multiple Frames for the Same Parameter:
  - Highlights that two calls to `square` (once for `x`, once for `y`) create two distinct frames both named `x`, each pointing back to the program environment—explaining why simultaneous calls to the same function don't interfere with each other.

  Key terms: environment model of evaluation (function application example), environment model of evaluation (tail recursion and), factorial (environment structure in evaluating), function application (environment model of), iterative process (recursive process vs.), recursive process (iterative process vs.), sum_of_squares (in environment model), tail recursion (environment model of evaluation and)
  """

  @summary_3_2_3 """
  3.2.3 Frames as the Repository of Local State
  1. `make_withdraw` Traced Through Environments:
  - Walks through `W1 = make_withdraw(100)` and `W1(50)`, showing that the environment E1 created by the call to `make_withdraw` is where `balance` actually lives, and that `W1`'s function object points back to E1 as its enclosing environment.
  2. Why W1 and W2 Are Independent:
  - Shows a second call `W2 = make_withdraw(100)` creates a fresh environment E2 with its own `balance`, explaining precisely (in terms of frames) why the two withdrawal objects don't interfere—even though they share the same code.

  Key terms: environment model of evaluation (local state), frame (environment model) (as repository of local state), immediately invoked lambda expression, lambda expression (immediately invoked), local state (maintained in frames), make_withdraw (in environment model), make_withdraw (using immediately invoked lambda expression)
  """

  @summary_3_2_4 """
  3.2.4 Internal Declarations
  1. Blocks Open New Frames:
  - Explains that evaluating a block (a function body, or a branch of a conditional) extends the current environment with a new frame holding every name declared directly in that block.
  2. Why Internal `def`s Work:
  - Traces `sqrt`'s internal functions (`is_good_enough`, `improve`, `sqrt_iter`) through the environment model, showing each is bound in the same frame E2, which is why they can call each other freely and don't leak into or clash with names outside `sqrt`.
  3. Mutual Recursion and the Temporal Dead Zone:
  - Uses mutually recursive `is_even`/`is_odd` to show why forward references within a block work (both names exist in the same frame before either body runs), then explains the *temporal dead zone*: a name exists in its frame before its declaration is evaluated, and accessing it too early is an error.

  Key terms: TDZ (temporal dead zone), bank account, block structure (in environment model), declaration (use of name before), environment model of evaluation, environment model of evaluation (internal declarations), environment model of evaluation (message passing), internal declaration (in environment model), make_account (in environment model), message passing (environment model and), mutual recursion, program environment, recursion (mutual), sqrt (in environment model), temporal dead zone (TDZ)
  """

  @summary_3_2_5 """
  3.2.5 CSE Machine
  1. What the Environment Model Leaves Unspecified:
  - Notes the environment model explains what names refer to but not the bookkeeping of *how* the interpreter tracks the current environment across an evaluation, e.g. what happens to the environment after a subexpression like `f(x) + y` finishes evaluating `f(x)`.
  2. Left-to-Right Evaluation, Concretely:
  - Illustrates decomposing an arithmetic expression like `1 + (2 * 3)` into operands plus an instruction, foreshadowing the more detailed control-and-environment-stack machine developed for the interpreter in chapter 5.

  Key terms: CSE machine
  """

  @summary_3_3 """
  3.3 Modeling with Mutable Data
  1. Mutators Join Constructors and Selectors:
  - Extends the chapter-2 data-abstraction discipline (constructors, selectors) with *mutators*—operations that change a data object in place, needed for objects with changing state like bank accounts.
  2. Chapter Roadmap:
  - Previews mutable pairs as the base case, then queues, tables, and two larger simulations (digital circuits, constraint propagation) built from mutable list structure.

  Key terms: mutable data objects, mutator
  """

  @summary_3_3_1 """
  3.3.1 Mutable List Structure
  1. `set_head`/`set_tail`:
  - Introduces the primitive mutators for pairs, contrasting `set_head(x, y)` (which mutates a pair in place) with `z = pair(y, tail(x))` (which builds new structure, leaving `x` untouched).
  - Shows `pair` itself could be implemented in terms of `set_head`/`set_tail` plus a `get_new_pair` allocator.
  2. Sharing and Identity:
  - Distinguishes `z1 = pair(x, x)` (head and tail share one pair) from `z2 = pair(llist("a","b"), llist("a","b"))` (head and tail are distinct-but-equal pairs), showing `set_to_wow` affects them differently even though `print` shows "the same" list.
  - Introduces `is` (pointer/identity equality) as the way to detect sharing, tying back to the "sameness and change" discussion of 3.1.3.
  3. Mutation Is Just Assignment:
  - Reimplements `pair`/`head`/`tail`/`set_head`/`set_tail` purely with closures and `nonlocal`, showing mutable data needs nothing beyond assignment and local state—mutation and assignment are, at bottom, the same idea.

  Key terms: append, append (append_mutator vs.), append_mutator, change and sameness (shared data and), count_pairs, cycle in list, cycle in list (detecting), data (shared), functional representation of data (mutable data), garbage collection (mutation and), head (functional implementation of), is (as equality of pointers), last_pair, list structure (mutable), make_cycle, mutable data objects, mutable data objects (functional representation of), mutable data objects (implemented with assignment), mutable data objects (list structure), mutable data objects (pairs), mutable data objects (shared data), mystery, pair (functional implementation of), pair (implemented with mutators), pair(s) (functional representation of)
  """

  @summary_3_3_2 """
  3.3.2 Representing Queues
  1. Why Not Just a List:
  - Notes a plain linked list makes `insert` an Θ(n) operation (must scan to the end), motivating a representation with a direct pointer to the rear.
  2. Front/Rear Pointer Representation:
  - Represents a queue as a pair `(front_ptr, rear_ptr)` into an ordinary list, giving `make_queue`, `is_empty_queue`, `front_queue`, `insert_queue`, and `delete_queue` all Θ(1) behavior by mutating the rear pointer with `set_tail` rather than rescanning.

  Key terms: FIFO buffer, data abstraction (for queue), delete_queue, deque, front_ptr, front_queue, insert_queue, is_empty_queue, make_queue, print_queue, queue, queue (double ended), queue (front of), queue (functional implementation of), queue (operations on), queue (rear of), rear_ptr, set_front_ptr, set_rear_ptr
  """

  @summary_3_3_3 """
  3.3.3 Representing Tables
  1. One-Dimensional Tables:
  - Represents a table as a *headed list* (a dummy `"*table*"` record up front so there's always a fixed pair to mutate), with `lookup`/`assoc` for retrieval and `insert` that either mutates an existing record's value or splices in a new one right after the header.
  2. Two-Dimensional Tables:
  - Generalizes to two keys by nesting: the outer table's records are themselves subtables, so `lookup`/`insert` first locate (or create) the right subtable, then operate on it as a one-dimensional table.
  3. Tables as Objects:
  - Reimplements `make_table` in message-passing/local-state style, so `get`/`put` (as used for data-directed programming in 2.4.3) can be built directly from one `make_table` call, and different tables stay independent without needing an explicit table argument everywhere.

  Key terms: assoc, binary tree (table structured as), fib (with memoization), get, headed list, insert (in one dimensional table), insert (in two dimensional table), key of a record (in a table), key of a record (testing equality of), list(s) (headed), lookup (in one dimensional table), lookup (in two dimensional table), make_table (message passing implementation), make_table (one dimensional table), memo_fib, memoization, memoize, operation and type table (implementing), put, table, table ($n$ dimensional), table (backbone of), table (local), table (one dimensional), table (represented as binary tree vs.unordered list)
  """

  @summary_3_3_4 """
  3.3.4 A Simulator for Digital Circuits
  1. Wires, Gates, and Delays:
  - Models a digital-circuit language whose primitives are function boxes (`inverter`, `and_gate`, `or_gate`) connected by wires, each function box introducing a characteristic propagation delay; builds `half_adder` and `full_adder` as compound, reusable circuit-building functions.
  2. Wires as Objects:
  - Implements `make_wire` as a message-passing object with local state (`signal_value`, `action_functions`), where `set_signal` re-runs all registered action functions only if the value actually changed.
  3. The Agenda Drives Simulated Time:
  - Introduces `the_agenda` as a time-ordered schedule of pending actions, with `after_delay` inserting new work and `propagate` repeatedly running the earliest scheduled action—an *event-driven simulation* where actions trigger further, later actions.
  - Demonstrates the whole system with `probe`, printing signal changes together with simulated time as a half-adder circuit is exercised.

  Key terms: add_action, add_to_agenda, adder (full), adder (half), adder (ripple carry), after_delay, and gate, and gate (and_gate), call_each, current time, for simulation agenda, current_time, digital circuit simulation, digital circuit simulation (agenda implementation), digital circuit simulation (agenda), digital circuit simulation (primitive function boxes), digital circuit simulation (representing wires), digital circuit simulation (sample simulation), digital signal, event driven simulation, first_agenda_item, first_segment, full adder, full adder (full_adder), function box, in digital circuit, get_signal
  """

  @summary_3_3_5 """
  3.3.5 Propagation of Constraints
  1. Relations, Not One-Directional Computations:
  - Motivates a constraint-based language from equations like `d·A·E = F·L` that relate several quantities without privileging one as "the output"—unlike an ordinary function, which must commit to computing one specific quantity from the others.
  2. Constraints, Connectors, and Propagation:
  - Builds primitive constraints (`adder`, `multiplier`, `constant`) joined by `connector` objects; setting a connector's value awakens its constraints, which in turn may determine and set other connectors, propagating information through the network in whichever direction the available data permits.
  3. Worked Example — Celsius/Fahrenheit:
  - Demonstrates `celsius_fahrenheit_converter` computing `F` from `C` or `C` from `F` using the *same* network, with `probe` reporting value changes and a contradiction error when an inconsistent value is forced onto an already-determined connector.
  4. Implementation as Message-Passing Objects:
  - Implements each constraint (`adder`, `multiplier`) and each `connector` as a local-state, message-passing object—structurally similar to the digital-circuit simulator of 3.3.4, but without needing an agenda since there's no timing/delay model here.

  Key terms: Borning, Alan, Jayaraman, Sundaresan, Konopasek, Milos, SKETCHPAD, Smalltalk, Stallman, Richard M., Steele, Guy Lewis Jr., Sussman, Gerald Jay, Sutherland, Ivan, TK!Solver, Xerox Palo Alto Research Center, adder, averager, celsius_fahrenheit_converter, celsius_fahrenheit_converter (expression oriented), connect, connector(s), in constraint system, connector(s), in constraint system (operations on), connector(s), in constraint system (representing), constant, constraint network, constraint(s) (primitive), constraint(s) (propagation of), expression oriented vs.imperative programming style, for_each_except
  """

  @summary_3_4 """
  3.4 Concurrency: Time Is of the Essence
  1. Time Becomes Unavoidable:
  - Argues that introducing assignment forces time into our models (the same expression can now yield different results depending on when it's evaluated), and that modeling systems as concurrently-acting objects (threads) makes this sharper still.
  2. Modularity and Speed as Motivations:
  - Notes concurrent decomposition both matches how we perceive independently-acting real-world objects and can offer real speedups when tasks are genuinely independent, at the cost of new correctness hazards from assignment interacting with concurrency.

  Key terms: concurrency, pipelining, thread, time (assignment and)
  """

  @summary_3_4_1 """
  3.4.1 The Nature of Time in Concurrent Systems
  1. Interleaving Breaks Assumptions:
  - Uses Peter and Paul withdrawing from a shared account to show that concurrent threads accessing a shared `balance` can interleave their read-modify-write steps in ways that lose money from the system entirely—not just get "some" wrong answer, but violate a basic invariant.
  2. What "Correct" Should Mean:
  - Proposes progressively weaker correctness criteria: no concurrent shared-state changes at all (too strict); same result as *some* sequential ordering of the threads (usually the right target); or, for some algorithms (like diffusion averaging), correctness independent of ordering altogether.

  Key terms: Peter, Paul and Mary, bank account (joint, with concurrent access), cache coherence protocols, concurrency (correctness of concurrent programs), diffusion, simulation of, nondeterminism, in behavior of concurrent programs, order of events (indeterminacy in concurrent systems), shared state, state (shared), time (in concurrent systems), time (purpose of), timing diagram, withdraw (problems in concurrent system)
  """

  @summary_3_4_2 """
  3.4.2 Mechanisms for Controlling Concurrency
  1. The Combinatorics of Interleaving:
  - Shows that even two threads with three events each admit 20 legal interleavings, arguing that reasoning about every possible interleaving directly doesn't scale.
  2. Serializers:
  - Introduces `make_serializer`, which wraps functions so that only one execution from a given serialized set can run at a time, and shows serializing `withdraw`/`deposit` inside `make_account` eliminates the lost-update bug from 3.4.1 while still letting different accounts run concurrently.
  3. Multiple Shared Resources Are Harder:
  - Uses `exchange` (swapping two account balances) to show that serializing each account individually is not enough—concurrent `exchange` calls on overlapping accounts can still interleave incorrectly—motivating `make_account_and_serializer`, which exposes an account's serializer so a caller can serialize an entire multi-account operation.
  - Briefly notes deadlock as a hazard once a function needs to acquire more than one serializer at once, and closes by observing that shared-state concurrency ultimately reduces to questions of communication and synchronization between threads.

  Key terms: Aristotle's De caelo (Buridan's commentary on), Buridan, Jean, Dijkstra, Edsger Wybe, EIEIO, Gray, Jim, Havender, J., Lamport, Leslie, PowerPC, Reuter, Andreas, SYNC, THE Multiprogramming System, Technological University of Eindhoven, acquire a mutex, arbiter, argument(s) (arbitrary number of), atomic operations supported in hardware, atomic requirement for test_and_set, bank account (exchanging balances), bank account (serialized), bank account (transferring money), barrier synchronization, blocked process, busy waiting, cell, in serializer implementation, concurrency
  """

  @summary_3_5 """
  3.5 Streams
  1. An Alternative to Assignment:
  - Poses the question of whether the complexity of section 3.1–3.4 (assignment, sameness, concurrency) is avoidable, and proposes modeling change via *streams*—sequences representing a quantity's entire time history—instead of via mutable local state.
  2. Streams as Delayed Sequences:
  - Previews that streams look like ordinary sequences but use delayed evaluation under the hood, letting us treat even infinite sequences as if they existed all at once, without literally constructing them.

  Key terms: delayed evaluation, stream(s), world line of a particle
  """

  @summary_3_5_1 """
  3.5.1 Streams Are Delayed Lists
  1. The Problem with Lists as Sequences:
  - Shows that computing the second prime in [10000, 1000000] via `filter`/`enumerate_interval` on ordinary lists wastefully constructs and discards a huge intermediate list, unlike a hand-written incremental loop.
  2. Streams as Pairs with a Delayed Tail:
  - Represents a stream as `pair(h, lambda: t)`—the tail wrapped in a zero-argument function so its evaluation is deferred—with `stream_tail` forcing that promise; defines `stream_ref`, `stream_map`, `stream_for_each` as stream analogs of the chapter-2 list operations.
  3. Streams Reproduce List Elegance with List-Free Efficiency:
  - Redoes the "second prime" computation with `stream_filter`/`stream_enumerate_interval`, tracing how each `stream_tail` forces just enough further computation to answer the next question, giving "demand-driven" evaluation.
  4. Memoizing the Delay:
  - Introduces `memo`, which caches a delayed computation's result after its first forcing, and an optimized `stream_map_optimized` built on it, needed once a stream's tail might be forced more than once.

  Key terms: Algol (call by name argument passing), Algol (thunks), Friedman, Daniel P., Landin, Peter, Wise, David S., call by name argument passing, call by need argument passing, delayed evaluation (assignment and), delayed evaluation (printing and), delayed expression, delayed expression (memoized), display_stream, empty stream, forcing (tail of stream), memo, memoization (in stream tail), order of events (decoupling apparent from actual), programming (demand driven), programming (odious style), promise to evaluate, stream(s) (empty), stream(s) (implemented as delayed lists), stream_enumerate_interval, stream_filter, stream_for_each
  """

  @summary_3_5_2 """
  3.5.2 Infinite Streams
  1. Streams with No End:
  - Defines `integers_starting_from` and `fibgen` as self-referential-looking generator functions producing genuinely infinite streams, since only a finite prefix is ever actually forced.
  2. Sieve of Eratosthenes, Stream-Style:
  - Builds the infinite stream of primes via `sieve`, filtering multiples of each prime found so far out of the rest of the stream.
  3. Implicit (Self-Referential) Stream Definitions:
  - Shows streams like `ones`, `integers`, and `fibs` defined implicitly via streams referring to themselves (e.g. `integers = pair(1, lambda: add_streams(ones, integers))`), working because enough of each stream exists by the time it's needed to compute the next element.
  - Gives an alternate `primes` definition that tests candidates by trial division against the (growing) `primes` stream itself, up to √n.

  Key terms: Bertrand's Hypothesis, Chebyshev, Pafnutii L'vovich, Eratosthenes, Euclid's proof of infinite number of primes, Hamming, Richard Wesley, Hardy, Godfrey Harold, Henderson, Peter, Henderson, Peter (Henderson diagram), Wright, E. M., add_streams, arithmetic (on power series), cosine (power series for), div_series, factorial (infinite stream), fibs, fibs (implicit definition), infinite stream(s), infinite stream(s) (merging), infinite stream(s) (of factorials), infinite stream(s) (representing power series), integers, integers (implicit definition), integers_starting_from, integral (of a power series), integrate_series
  """

  @summary_3_5_3 """
  3.5.3 Exploiting the Stream Paradigm
  1. Iterations as Streams of States:
  - Reformulates iterative processes (square-root approximation via `sqrt_stream`, the Leibniz π series via `pi_summands`/`partial_sums`) as infinite streams of successive values instead of updated state variables.
  2. Sequence Acceleration:
  - Introduces Euler's `euler_transform` (accelerating convergence of an alternating series' partial sums) and `make_tableau`/`accelerated_sequence` (repeatedly re-accelerating, taking the first term of each row), showing dramatically faster convergence to π using memoized streams.
  3. Infinite Streams of Pairs:
  - Generalizes chapter 2's nested-mapping techniques (e.g. `prime_sum_pairs`) to infinite streams of pairs, requiring a careful `interleave`-based enumeration strategy so that every pair is eventually reached despite both dimensions being infinite.
  4. Streams as Signals:
  - Implements `integral`, an accumulator over a stream, directly modeling a signal-processing block diagram—foreshadowing the delayed-argument issue explored in 3.5.4.

  Key terms: Euler, Leonhard (series accelerator), Hardy, Godfrey Harold, KRC, Leibniz, Baron Gottfried Wilhelm von (series for $\pi$), Leiserson, Charles E., Pythagorean triples (with streams), RC circuit, Ramanujan numbers, Ramanujan, Srinivasa, Turner, David, accelerated_sequence, circuit (modeled with streams), electrical circuits, modeled with streams, euler_transform, infinite stream(s) (merging), infinite stream(s) (of pairs), infinite stream(s) (to model signals), infinite stream(s) (to sum a series), integral, integrator, for signals, interleave, iterative process (as a stream process), logarithm, approximating $\ln 2$, make_tableau, mapping (nested)
  """

  @summary_3_5_4 """
  3.5.4 Streams and Delayed Evaluation
  1. Loops Need an Extra Layer of Delay:
  - Shows `solve` (modeling dy/dt = f(y) via a feedback loop between `integral` and `stream_map`) fails as written, because `integral`'s call needs `dy` to already be defined—more delay is needed than the ordinary "delayed stream tail" already provides.
  2. Explicitly Delayed Arguments:
  - Fixes `solve` by making `integral` accept its integrand as an explicitly delayed argument (`lambda: dy`), forced only when more than the first output element is needed; demonstrates approximating e via `solve`.
  3. Normal-Order Evaluation as the "Clean" Alternative:
  - Observes that making *every* argument delayed by default (normal-order evaluation) would avoid the two-classes-of-functions problem, but notes this interacts very badly with assignment/mutation/I/O, foreshadowing chapter 4's lazy evaluator.

  Key terms: Gordon, Michael, Haskell, ML, Milner, Robin, Pascal, lack of higher order functions in, RLC circuit, Wadsworth, Christopher, analog computer, argument(s) (delayed), circuit (modeled with streams), data types (in statically typed languages), delayed argument, delayed evaluation (normal order evaluation and), delayed evaluation (streams and), delayed expression (explicit), differential equation, differential equation (second order), electrical circuits, modeled with streams, feedback loop, modeled with streams, higher order functions (static typing and), integral, integral (need for delayed evaluation), integral (with delayed argument), normal order evaluation (delayed evaluation and), polymorphic types
  """

  @summary_3_5_5 """
  3.5.5 Modularity of Functional Programs and Modularity of Objects
  1. Streams Without Assignment, Still Modular:
  - Reimplements the Monte Carlo π estimation (3.1.2) entirely with streams (`random_numbers`, `map_successive_pairs`, `monte_carlo`)—no assignment or local state anywhere—showing streams can hide "how many trials so far" just as effectively as a stateful object.
  2. A Stateless System That Feels Stateful:
  - Uses `stream_withdraw` (a pure function from balance + stream of withdrawal amounts to a stream of resulting balances) to argue that "state" is partly a property of how a human observer experiences a system over time, not necessarily an intrinsic property of the underlying computation.
  3. Two Views, Neither Complete:
  - Closes the chapter noting the object view (matches our lived experience of separate, interacting things) and the functional/stream view (avoids the correctness hazards of shared mutable state) each have real advantages and real limits—illustrated by the unresolved difficulty of *merging* independent streams of events (e.g. Peter's and Paul's joint-account transactions)—with no single unifying resolution offered.

  Key terms: Backus, John, Darlington, John, Fortran (inventor of), Henderson, Peter, Monte Carlo integration (stream formulation), Monte Carlo simulation (stream formulation), Turner, David, bank account (joint, modeled with streams), bank account (stream model), concurrency (functional programming and), definite integral (estimated with Monte Carlo simulation), dirichlet_stream, functional programming, functional programming (concurrency and), functional programming (functional programming languages), functional programming (time and), infinite stream(s) (merging as a relation), infinite stream(s) (merging), infinite stream(s) (of random numbers), make_simplified_withdraw, map_successive_pairs, modularity (along object boundaries), modularity (functional programs vs.objects), modularity (through infinite streams), monte_carlo (infinite stream)
  """
end
