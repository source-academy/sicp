defmodule Cadet.Chatbot.SicpyNotesWithIndex.Chapter5 do
  @moduledoc """
  Module to store SICPy (Python edition) notes for chapter 5, enriched
  with key terms drawn from the book's own back-of-book index.
  """
  @summary_5 """
  5. Computing with Register Machines
  1. Two Loose Ends from Earlier Models:
  - Notes that even the metacircular evaluator (chapter 4) left two questions unanswered: how a subexpression's value actually gets back to its caller, and why some recursive functions run in constant space (iterative processes) while others don't.
  2. Register Machines as the New, More Precise Model:
  - Introduces the *register machine*—a device that sequentially executes instructions manipulating a fixed set of registers—as the model precise enough to answer both questions.
  3. Chapter Roadmap:
  - Previews designing simple register machines and a language to describe them (5.1), building a simulator for that language (5.2), implementing list-structured memory and garbage collection in terms of vectors (5.3), building a register machine that runs the metacircular evaluator's algorithm explicitly (5.4), and compiling Python programs directly into register-machine instructions (5.5).

  Key terms: Kepler, Johannes, register machine, register(s)
  """

  @summary_5_1 """
  5.1 Designing Register Machines
  1. Data Paths and Controller:
  - Introduces the two halves of a register-machine design: *data paths* (registers and the operations/buttons connecting them) and the *controller* (the sequencing of button-pushes and tests that drives the data paths).
  2. Worked Example — GCD:
  - Designs a machine for Euclid's Algorithm using registers `a`, `b`, and a temporary `t`, illustrating data-path diagrams (registers as boxes, buttons as labeled arrows, operations as trapezoids, tests as circles) and a controller diagram (a "marble rolling through a maze" of button-pushes and decision diamonds).

  Key terms: Euclid's Algorithm, controller for register machine, controller for register machine (controller diagram), data paths for register machine, data paths for register machine (data path diagram), factorial (register machine for (iterative)), gcd (register machine for), operation (in register machine), register machine (controller diagram), register machine (controller), register machine (data path diagram), register machine (data paths), register machine (design of), register machine (test operation), test operation in register machine
  """

  @summary_5_1_1 """
  5.1.1 A Language for Describing Register Machines
  1. From Diagrams to Text:
  - Introduces a textual register-machine language mirroring the diagrams, with `assign`, `test`, `branch`, and `go_to` as the core instruction forms, and labels marking controller entry points.
  2. Collapsing Data Paths into the Controller:
  - Shows a more compact notation that inlines each button's/operation's definition directly into the controller instruction that uses it (e.g. `assign("t", list(op("rem"), reg("a"), reg("b")))`), trading a separate data-path listing for a single, if more verbose, self-contained sequence.
  3. Actions:
  - Introduces *actions* (like `display`) as operations with an effect but no register output, represented via a new `perform` instruction, illustrated by a GCD machine extended to read input and print results in a loop.

  Key terms: actions, in register machine, assign, branch, constant, display, factorial (register machine for (iterative)), go_to, label, op, perform, prompt, reg, register machine (actions), register machine (language for describing), register machine language (assign), register machine language (branch), register machine language (constant), register machine language (entry point), register machine language (go_to), register machine language (instructions), register machine language (label), register machine language (op), register machine language (perform), register machine language (reg), register machine language (test)
  """

  @summary_5_1_2 """
  5.1.2 Abstraction in Machine Design
  1. Primitives as a Design Convenience:
  - Notes that treating an operation like `rem` as a machine "primitive" is a deliberate simplification, not a claim that it's actually hardware-simple—it can always be expanded into simpler operations later.
  2. Expanding a Primitive:
  - Demonstrates this by replacing the GCD machine's primitive remainder operation with an explicit subtraction loop, showing the controller sequence grows a nested loop where the single `rem` instruction used to be.

  Key terms: abstraction (in register machine design), sqrt (register machine for)
  """

  @summary_5_1_3 """
  5.1.3 Subroutines
  1. Sharing Components via a Continue Register:
  - Motivates subroutines by noting that duplicating a machine's data-path components (e.g. two separate GCD computations) is wasteful; shows how a `continue` register holding a distinguishing value lets a single shared `gcd` instruction sequence branch back to whichever call site invoked it.
  2. Labels as Register Values:
  - Generalizes this by letting `continue` hold an actual controller *label* (via an extended `assign`/`go_to` that can target a label stored in a register) rather than a small fixed set of distinguishing codes—this is the mechanism that scales to arbitrarily many call sites and nested subroutine calls.

  Key terms: assign (storing label in register), continue, go_to (destination in register), register machine (subroutine), subroutine in register machine
  """

  @summary_5_1_4 """
  5.1.4 Using a Stack to Implement Recursion
  1. Why Iteration Isn't Enough:
  - Contrasts GCD (where the answer to the recursive subproblem *is* the final answer, so the same machine can just loop) with factorial (where the subproblem's answer must still be multiplied by `n`), showing the latter needs an unbounded nest of "suspended" computations rather than a simple loop.
  2. The Stack as Save/Restore Memory:
  - Introduces `save`/`restore` instructions and a last-in-first-out stack to hold register values (like `n` and `continue`) across a recursive call, so one physical set of data-path components can be reused at every level of recursion.
  3. Worked Examples — Factorial and Fibonacci:
  - Walks through complete controller sequences for recursive `factorial` (single recursive call per invocation) and `fib` (two recursive calls per invocation, needing careful save/restore around each), showing how `continue` is itself saved/restored around nested subroutine calls.

  Key terms: continue (recursion and), expt (register machine for), factorial (register machine for (recursive)), fib (register machine for (tree recursive)), iterative process (recursive process vs.), iterative process (register machine for), recursive process (iterative process vs.), recursive process (register machine for), register machine (stack), register machine language (restore), register machine language (save), restore, save, stack (for recursion in register machine)
  """

  @summary_5_1_5 """
  5.1.5 Instruction Summary
  1. The Complete Instruction Set:
  - Catalogues every controller instruction form introduced across 5.1.1–5.1.4 in one place—`assign`, `test`, `branch`, `go_to` (to a label or to a register-held label), `save`, `restore`, and `perform`—as a reference for the register-machine language used for the rest of the chapter.

  Key terms: constant (syntax of), register machine (design of), register machine language, register machine language (assign), register machine language (branch), register machine language (constant), register machine language (go_to), register machine language (instructions), register machine language (label), register machine language (op), register machine language (perform), register machine language (reg), register machine language (restore), register machine language (save), register machine language (test)
  """

  @summary_5_2 """
  5.2 A Register-Machine Simulator
  1. Testing Designs Without Real Hardware:
  - Motivates building a Python simulator for the register-machine language rather than hand-simulating designs on paper, since hand simulation (exercise 5.5-style) doesn't scale beyond the simplest machines.
  2. The Simulator's Interface:
  - Introduces the four functions that make up the simulator's interface: `make_machine` (build a model from registers, operations, and a controller), `set_register_contents`/`get_register_contents`, and `start`—illustrated by constructing and running `gcd_machine`.

  Key terms: gcd (register machine for), gcd_machine, get_register_contents, make_machine, register machine (simulator), register machine simulator, set_register_contents, simulation (of register machine), start
  """

  @summary_5_2_1 """
  5.2.1 The Machine Model
  1. Registers and Stack as Message-Passing Objects:
  - Implements `make_register` (get/set local state) and `make_stack` (push/pop/initialize local state) as chapter-3-style message-passing objects with local state.
  2. `make_new_machine` — the Common Machinery:
  - Builds the shared machine skeleton: a `pc` (program counter) and `flag` register, a stack, an operations table (seeded with `initialize_stack`), and a register table, plus internal `allocate_register`/`lookup_register` and an `execute` loop that repeatedly runs the instruction at `pc` until the instruction sequence is exhausted.
  3. `make_machine` Assembles the Specifics:
  - Shows `make_machine` extending the basic model with the caller's register names and operations, then handing the controller list to the assembler (5.2.2) to produce the machine's actual instruction sequence.

  Key terms: assembler, execute, execution function (in register machine simulator), flag, get_contents, get_register, get_register_contents, initialize_stack, instruction execution function, make_machine, make_new_machine, make_register, make_stack, pc, pop, program counter, push, register table, in simulator, register(s) (representing), set_contents, set_register_contents, stack (representing), start
  """

  @summary_5_2_2 """
  5.2.2 The Assembler
  1. Two Passes — Labels First, Then Execution Functions:
  - Explains `assemble`'s two-step process: `extract_labels` scans the controller list once to separate instructions from labels and build a label-to-position table, then `update_insts` walks the resulting instruction list attaching an *instruction execution function* to each one.
  2. Instructions as Analyzed Code, Reprise:
  - Notes this mirrors the analyze/execute split of section 4.1.7: register/label references are resolved once, at assembly time, into direct pointers, rather than being re-parsed every time an instruction runs.

  Key terms: assemble, assembler, continuation (in register machine simulator), extract_labels, inst_controller_instruction, inst_execution_fun, lookup_label, make_inst, make_label_entry, receive, returning multiple values, set_inst_execution_fun, syntactic analysis, separated from execution (in register machine simulator), update_insts
  """

  @summary_5_2_3 """
  5.2.3 Instructions and Their Execution Functions
  1. One Execution-Function Generator per Instruction Type:
  - Shows `make_execution_function` dispatching on instruction type (`assign`, `test`, `branch`, `go_to`, `save`, `restore`, `perform`) to build the specific no-argument function that, when called, actually carries out that instruction and advances (or redirects) `pc`.
  2. Operation Expressions Shared Across Instruction Types:
  - Notes `assign`, `test`, and `perform` all need to evaluate an "operation expression" (an operation applied to register/constant inputs), so a shared helper resolves register references and looks up the named primitive operation in the machine's operation table once, at assembly time.

  Key terms: advance_pc, assign (instruction constructor), assign (simulating), assign_reg_name, assign_value_exp, branch (instruction constructor), branch (simulating), branch_dest, constant, constant (simulating), constant_exp_value, execution function (in register machine simulator), go_to (instruction constructor), go_to (simulating), go_to_dest, is_constant_exp, is_label_exp, is_operation_exp, is_register_exp, label, label (simulating), label_exp_label, lookup_prim, make_assign_ef, make_branch_ef
  """

  @summary_5_2_4 """
  5.2.4 Monitoring Machine Performance
  1. Instrumenting the Stack:
  - Extends `make_stack` to track the total number of pushes and the maximum stack depth reached, with a `print_statistics` message exposed as a new machine operation—turning the simulator into a performance-measurement tool, not just a correctness-testing one.
  2. Why This Matters Going Forward:
  - Sets up the stack-usage measurements used repeatedly in 5.4 and 5.5 to compare the interpreter's and compiler's efficiency on the same computation.

  Key terms: breakpoint, factorial (stack usage, register machine), initialize_stack, instruction counting, instruction tracing, make_stack (with monitored stack), print_stack_statistics, register machine (monitoring performance), register machine (simulator), register machine simulator, register(s) (tracing), simulation (for monitoring performance of register machine), simulation (of register machine), tracing (instruction execution), tracing (register assignment)
  """

  @summary_5_3 """
  5.3 Storage Allocation and Garbage Collection
  1. From Abstract Lists to Real Memory:
  - Motivates dropping the earlier assumption that `pair`/`head`/`tail` are register-machine primitives, in order to show how list-structured memory is actually built from, and reclaimed within, conventional finite computer memory.
  2. Two Sub-Problems:
  - Splits the topic into representation (how to lay out box-and-pointer pairs in raw memory, 5.3.1) and management (how to keep allocating new pairs forever without truly infinite memory, via garbage collection, 5.3.2).

  Key terms: automatic storage allocation, list structured memory, memory (list structured)
  """

  @summary_5_3_1 """
  5.3.1 Memory as Vectors
  1. Vectors Model Real Memory:
  - Introduces `vector_ref`/`vector_set` (constant-time indexed access, unlike lists) as the model of raw computer memory, and represents list structure using two parallel vectors, `the_heads` and `the_tails`, indexed by pair pointers.
  2. Typed Pointers:
  - Explains that distinguishing pairs from numbers/strings/etc. requires *typed pointers* (a type tag plus an index or literal value), with `===` reducing to pointer equality, and *string interning* used so that equal strings share one pointer.
  3. Primitive List Operations in Terms of Vector Operations:
  - Shows `head`/`tail`/`set_head`/`set_tail`/`pair` each compiled down to one or more `vector_ref`/`vector_set` instructions, with a `free` register tracking the next unused index; also shows the machine's stack itself can just be an ordinary list pointed to by a register.

  Key terms: === (as equality of pointers), === (as numeric equality operator), === (as string comparison operator), address, address arithmetic, append (as register machine), append_mutator (as register machine), arithmetic (address arithmetic), bignum, count_leaves (as register machine), data (tagged), equality (of numbers), equality (of strings), free, free list, head (implemented with vectors), interning strings, is_null (implemented with typed pointers), is_number (implemented with typed pointers), is_pair (implemented with typed pointers), is_string (implemented with typed pointers), list structure (represented using vectors), location, number(s) (bignum), number(s) (equality of)
  """

  @summary_5_3_2 """
  5.3.2 Maintaining the Illusion of Infinite Memory
  1. Garbage as Unreachable Pairs:
  - Defines garbage collection's foundational fact: only pairs reachable via `head`/`tail` chains from the current register contents (and stack) can still affect the computation—everything else is safely reclaimable garbage.
  2. Stop-and-Copy:
  - Describes the stop-and-copy algorithm: split memory into working and free halves; when working memory fills up, trace and copy every reachable pair into free memory, then swap the roles of the two halves.
  3. The Relocation Algorithm in Detail:
  - Walks through the `relocate_old_result_in_new` subroutine and the `scan`/`free` pointer pair that drives the copying loop, including *broken hearts* (a tag marking an already-moved object) and *forwarding addresses* left behind at a moved object's old location so later references find the new copy.

  Key terms: Allen, John, Baker, Henry G., Jr., Cressey, David, Fenichel, Robert, Hewitt, Carl Eddie, Lieberman, Henry, Lisp (MDL dialect of), Lisp (on DEC PDP 1), MDL, MIT (Research Laboratory of Electronics), Minsky, Marvin Lee, Moon, David A., Multics time sharing system, Yochelson, Jerome C., broken heart, compacting garbage collector, forwarding address, free, garbage collection, garbage collector (compacting), garbage collector (mark sweep), garbage collector (stop and copy), list structured memory, mark sweep garbage collector, memory (list structured)
  """

  @summary_5_4 """
  5.4 The Explicit-Control Evaluator
  1. Making Control Flow Explicit:
  - Sets out to reimplement the metacircular evaluator's `evaluate`/`apply` (4.1) as an actual register machine, finally making explicit the function-calling and argument-passing mechanisms that the metacircular evaluator left implicit in the host Python system.
  2. The Evaluator's Registers:
  - Introduces the seven registers used throughout: `comp` (component being evaluated), `env`, `val` (result), `continue` (return address, implementing recursion), and `fun`/`argl`/`unev` (used while evaluating function applications).

  Key terms: Batali, John Dean, Scheme (integrated circuit implementation of), Scheme chip, argl, chip implementation of Scheme, comp, continue (in explicit control evaluator), env, explicit control evaluator for Python, explicit control evaluator for Python (data paths), explicit control evaluator for Python (operations), explicit control evaluator for Python (registers), fun, integrated circuit implementation of Scheme, unev, val
  """

  @summary_5_4_1 """
  5.4.1 The Dispatcher and Basic Evaluation
  1. `eval_dispatch` as `evaluate`, Made Explicit:
  - Implements the same case analysis as the metacircular `evaluate`, but as a sequence of `test`/`branch` instructions jumping to per-type entry points (`ev_literal`, `ev_name`, `ev_application`, etc.), always returning by jumping to whatever's in `continue` with the result in `val`.
  2. Conditionals via Save/Restore Around a Recursive Dispatch:
  - Shows `ev_conditional` saving `comp`/`env`/`continue` before recursively dispatching on the predicate, then restoring them at `ev_conditional_decide` to select and dispatch on the consequent or alternative.
  3. Sequences as an Explicit Loop:
  - Shows `ev_sequence` looping through statements via `unev`, saving/restoring `env`/`unev` around each non-final statement's evaluation but treating the last statement specially (no save needed, since nothing follows it)—and notes a return statement can jump directly out of this loop entirely, bypassing the sequence machinery altogether.

  Key terms: ev_conditional, ev_lambda, ev_literal, ev_name, ev_sequence, eval_dispatch, explicit control evaluator for Python (conditionals), explicit control evaluator for Python (controller), explicit control evaluator for Python (expressions with no subexpressions to evaluate), explicit control evaluator for Python (sequences of statements), is_falsy (why used in explicit control evaluator)
  """

  @summary_5_4_2 """
  5.4.2 Evaluating Function Applications
  1. Evaluating the Function and Argument Expressions:
  - Walks through `ev_application`/`ev_appl_did_function_expression`/the argument-evaluation loop, each recursive call to `eval_dispatch` bracketed by careful `save`/`restore` of exactly the registers needed afterward—mirroring, now explicitly, what the metacircular `list_of_values` did implicitly via host-language recursion.
  2. `apply_dispatch` and the Return-Statement Problem:
  - Implements `apply_dispatch`/`primitive_apply`/`compound_apply`, introducing `push_marker_to_stack`/`revert_stack_to_marker` to solve the problem that a `return` statement can be arbitrarily deeply nested in a function body yet must still unwind the stack back to the state at the call.
  3. Tail Recursion, Made Concrete:
  - Shows `ev_return` reverting the stack *before* jumping back to evaluate the return expression (rather than after), which is precisely why this evaluator is tail-recursive: evaluating a tail call leaves the stack exactly as it was before the enclosing call, so no stack builds up across a chain of tail calls.

  Key terms: Wand, Mitchell, adjoin_arg, apply_dispatch, compound_apply, empty_arglist, ev_application, ev_operator_combination, ev_return, evlis tail recursion, explicit control evaluator for Python (argument evaluation), explicit control evaluator for Python (combinations), explicit control evaluator for Python (compound functions), explicit control evaluator for Python (function application), explicit control evaluator for Python (primitive functions), explicit control evaluator for Python (return statements), explicit control evaluator for Python (stack usage), explicit control evaluator for Python (tail recursion), framed stack discipline, is_last_argument_expression, iterative process (implemented by function call), metacircular evaluator for Python (tail recursion and), order of evaluation (in explicit control evaluator), order of evaluation (in metacircular evaluator), primitive_apply, push_marker_to_stack
  """

  @summary_5_4_3 """
  5.4.3 Blocks, Assignments, and Declarations
  1. Blocks Extend the Environment, Explicitly:
  - Implements `ev_block` to scan out a block's locally declared names, build an extended environment binding them to `"*unassigned*"`, and install it as the new `env` before evaluating the block body—the register-machine analog of the metacircular evaluator's `eval_block`.
  2. Assignments and Declarations:
  - Implements `ev_assignment`/`ev_declaration` by evaluating the value expression (recursively dispatching through `eval_dispatch`, with the current component and environment saved around the call) and then updating the environment via `assign_symbol_value`, mirroring `eval_assignment`/`eval_declaration` from chapter 4.

  Key terms: derived component (adding to explicit control evaluator), ev_assignment, ev_block, ev_declaration, ev_function_definition, explicit control evaluator for Python (assignments), explicit control evaluator for Python (blocks), explicit control evaluator for Python (declarations), explicit control evaluator for Python (derived components), explicit control evaluator for Python (normal order evaluation), explicit control evaluator for Python (syntactic forms (additional)), normal order evaluation (in explicit control evaluator), scanning out declarations (in explicit control evaluator)
  """

  @summary_5_4_4 """
  5.4.4 Running the Evaluator
  1. A Full Driver Loop for the Register Machine:
  - Assembles a `read_evaluate_print_loop` entry point that reads and parses a program, extends the (persisted, cross-interaction) current environment with the program's scanned-out top-level names, then dispatches to `eval_dispatch` and prints the result—reinitializing the stack each time around.
  2. Errors and Assembling the Whole Machine:
  - Adds minimal error entry points (`unknown_component_type`, `unknown_function_type`) that print a message and loop back to the driver, then shows the complete `eceval` machine assembled from all the controller fragments in 5.4.1–5.4.4 and run via the simulator of 5.2.
  3. Measuring Real Performance:
  - Uses the instrumented stack (5.2.4) to compare recursive vs. iterative `factorial` and tree-recursive `fib`, empirically confirming the evaluator's tail-recursion property: iterative Python functions really do run in constant stack space under this evaluator.

  Key terms: driver loop (in explicit control evaluator), eceval, error handling (in explicit control evaluator), evaluation (models of), explicit control evaluator for Python, explicit control evaluator for Python (controller), explicit control evaluator for Python (driver loop), explicit control evaluator for Python (error handling), explicit control evaluator for Python (machine model), explicit control evaluator for Python (monitoring performance (stack use)), explicit control evaluator for Python (running), explicit control evaluator for Python (tail recursion), factorial (stack usage, interpreted), fib (stack usage, interpreted), fib (tree recursive version), get_current_environment, models of evaluation, print_result, print_result (monitored stack version), prompts (explicit control evaluator), read_evaluate_print_loop, set_current_environment, signal_error, simulation (as machine design tool), tail recursion (explicit control evaluator and)
  """

  @summary_5_5 """
  5.5 Compilation
  1. Interpretation vs. Compilation:
  - Contrasts the explicit-control evaluator's *interpretation* strategy (traverse the source program's data structure at run time, dispatching to primitive subroutines) with *compilation* (translate the source program once, ahead of time, into a native-language object program)—and notes their complementary strengths: interpreters for interactive development, compilers for raw speed.
  2. What the Compiler Reuses:
  - Previews that the compiler targets the same register conventions as the explicit-control evaluator (`env`, `argl`, `fun`, `val`, `continue`), so compiled and interpreted code can call each other, and that it gains efficiency precisely by doing at compile time what the evaluator otherwise redoes on every single run.

  Key terms: compiler, compiler (interpreter vs.), compiler for Python, compiler for Python (analyzing evaluator vs.), compiler for Python (efficiency), compiler for Python (explicit control evaluator vs.), compiler for Python (machine operation use), compiler for Python (register use), efficiency (of compilation), explicit control evaluator for Python (as machine language program), explicit control evaluator for Python (as universal machine), general purpose computer, as universal machine, interpreter (compiler vs.), machine language, native language of machine, object program, source language, source program, universal machine (explicit control evaluator as), universal machine (general purpose computer as)
  """

  @summary_5_5_1 """
  5.5.1 Structure of the Compiler
  1. `compile` as a Third Analyze/Execute Split:
  - Presents `compile` as performing the same case analysis as `evaluate`/`analyze`/`eval_dispatch`, but generating a sequence of register-machine instructions (object code) instead of a value, an execution function, or an immediate side effect.
  2. Targets and Linkages:
  - Introduces a *target* register (where the compiled code's result should end up) and a *linkage descriptor* (`"next"`, `"return"`, or a label — how control should proceed once the code finishes) as the two extra parameters threaded through every code generator.
  3. Instruction Sequences and `preserving`:
  - Represents compiled output as an instruction sequence tagged with the registers it needs and the registers it modifies, and introduces `preserving` as the mechanism that inserts `save`/`restore` around a sequence only when actually necessary—letting the compiler avoid the evaluator's blanket "save everything that might be needed" discipline.

  Key terms: append_instruction_sequences, code generator, code generator (arguments of), code generator (value of), compile, compiler for Python (analyzing evaluator vs.), compiler for Python (explicit control evaluator vs.), compiler for Python (expression syntax functions), compiler for Python (stack usage), compiler for Python (structure of), explicit control evaluator for Python (optimizations (additional)), instruction sequence, linkage descriptor, make_instruction_sequence, next, preserving, target register
  """

  @summary_5_5_2 """
  5.5.2 Compiling Components
  1. Linkage Code and Simple Components:
  - Implements `compile_linkage`/`end_with_linkage` (turning a linkage descriptor into trailing `go_to` instructions, `preserving` `continue`), then `compile_literal`/`compile_name` (immediate `assign` instructions extracting the literal or symbol at compile time).
  2. Assignments and Declarations:
  - Implements `compile_assignment_declaration`, recursively compiling the value expression with target `val`, then appending (preserving `env`) code that updates the environment and moves the final value into the target register.
  3. Compiling Conditionals:
  - Shows the standard shape of compiled conditional code: compile the predicate into `val`, test with `is_falsy`, branch to a freshly generated false-branch label, and compile the consequent/alternative each with the conditional's own target and linkage—using `make_label` to keep labels for different conditionals in a program from colliding.

  Key terms: compile_assignment, compile_block, compile_conditional, compile_declaration, compile_lambda_body, compile_lambda_expression, compile_linkage, compile_literal, compile_name, compile_sequence, compiled_function_entry, compiled_function_env, compiler for Python (assignments), compiler for Python (blocks), compiler for Python (conditionals), compiler for Python (dead code analysis), compiler for Python (declarations), compiler for Python (label generation), compiler for Python (lambda expressions), compiler for Python (linkage code), compiler for Python (literals), compiler for Python (names), compiler for Python (sequences of statements), end_with_linkage, is_compiled_function
  """

  @summary_5_5_3 """
  5.5.3 Compiling Applications and Return Statements
  1. Compiling an Application:
  - Implements `compile_application`, compiling the function expression to `fun` and each argument expression to `val`, combining them via `construct_arglist` (built back-to-front, last argument first, so `pair`ing produces the arguments in the right order) with careful `preserving` of `env`/`fun`/`continue` around each piece.
  2. Applying Primitive vs. Compiled Functions:
  - Implements `compile_function_call`, generating a runtime test-and-branch between a `primitive_branch` (calls `apply_primitive_function`) and a `compiled_branch` (jumps to the callee's `compiled_function_entry`), joined afterward via `parallel_instruction_sequences` since only one branch actually executes.
  3. The Four Cases of `compile_fun_appl`, and Why "return"+val Preserves Tail Recursion:
  - Walks through `compile_fun_appl`'s four target/linkage combinations, showing that only when target is `val` *and* linkage is `"return"` can the callee's own final `go_to(reg("continue"))` jump directly to the caller's caller — which is exactly what makes tail calls in compiled code run in constant stack space, just as in the explicit-control evaluator.

  Key terms: Appel, Andrew W., Hanson, Christopher P., Miller, James S., Rozas, Guillermo Juan, all_regs, compile_application, compile_fun_appl, compile_function_call, compile_return_statement, compiler (tail recursion, stack allocation, and garbage collection), compiler for Python (combinations), compiler for Python (function applications), compiler for Python (register use), compiler for Python (return statements), compiler for Python (tail recursive code generated by), construct_arglist, garbage collection (tail recursion and), return statement (handling in compiler), return statement (tail recursion and), return value (undefined as), stack allocation and tail recursion, tail recursion (compiler and), tail recursion (garbage collection and), tail recursion (return statement necessary for)
  """

  @summary_5_5_4 """
  5.5.4 Combining Instruction Sequences
  1. Registers Needed and Modified, as Metadata:
  - Gives the concrete representation of an instruction sequence (a triple of needed-registers, modified-registers, and actual instructions) and the selectors/predicates (`registers_needed`, `registers_modified`, `needs_register`, `modifies_register`) used to decide, without re-scanning instructions, whether a `save`/`restore` pair is actually required.
  2. `append_instruction_sequences`, `preserving`, and `parallel_instruction_sequences`:
  - Defines the three combinators: straightforward concatenation for sequential code, `preserving` for sequential code that must protect a register across a boundary, and a version for combining two sequences that are mutually exclusive branches (like a conditional's two arms), whose combined register-modification set is the union but whose registers-needed must account for both possible paths.

  Key terms: append_instruction_sequences, instruction sequence, instructions, list_difference, list_union, modifies_register, needs_register, parallel_instruction_sequences, preserving, registers_modified, registers_needed, tack_on_instruction_sequence
  """

  @summary_5_5_5 """
  5.5.5 An Example of Compiled Code
  1. A Complete Worked Compilation:
  - Walks a full function definition through the compiler end to end, showing the actual generated instruction sequence and how each piece (argument evaluation, the conditional test, the recursive call, the arithmetic operator combination turned into an application) traces back to the code generators of 5.5.2–5.5.3.
  2. Reading Compiled Code as a Text:
  - Uses this worked example to make concrete just how much smaller and more direct the generated code is compared to running the same computation through the general-purpose `eval_dispatch` machinery, reinforcing the chapter's running comparison between interpretation and compilation.

  Key terms: back quotes, compiler for Python (example compilation), compiler for Python (open coding of primitives), compiler for Python (order of argument evaluation), compiler for Python (stack usage), factorial (compilation of), iterative process (recursive process vs.), open coding of primitives, order of evaluation (in compiler), preserving, quotation marks (back quotes), recursive process (iterative process vs.), string(s) (typed over multiple lines)
  """

  @summary_5_5_6 """
  5.5.6 Lexical Addressing
  1. Name Lookup Is Expensive, and Avoidably So:
  - Observes that `lookup_symbol_value`'s frame-by-frame linear search is wasted work whenever the program is lexically scoped, since the compiler can, in principle, already know exactly which frame and which slot in that frame a given name reference will resolve to.
  2. Lexical Addresses and the Compile-Time Environment:
  - Introduces *lexical addresses* (a frame-count and a within-frame displacement) and `lexical_address_lookup`/`lexical_address_assign` as constant-time replacements for `lookup_symbol_value`/`assign_symbol_value`, computed by maintaining a *compile-time environment*—a list of frames of symbol names (no values) that mirrors the shape the runtime environment will have—extended in `compile_lambda_body` and `compile_block` exactly where the real environment would be extended.

  Key terms: compile time environment, compiler for Python (lexical addressing), compiler for Python (scanning out internal declarations), constant (in Python) (detecting assignment to), lexical addressing, lexical addressing (lexical address), lexical scoping (environment structure and), lexical_address_assign, lexical_address_lookup
  """

  @summary_5_5_7 """
  5.5.7 Interfacing Compiled Code to the Evaluator
  1. Letting the Evaluator Call Compiled Code:
  - Extends `apply_dispatch` with a third case, `is_compiled_function`, jumping straight to the callee's entry point (after the usual stack marker), so interpreted and compiled functions can call one another transparently.
  2. `compile_and_go`:
  - Implements `compile_and_go`, which compiles a whole program with target `val` and linkage `"return"`, assembles it, extends the global environment with its scanned-out top-level names, and starts the evaluator machine at a new `external_entry` point that runs the compiled code before falling into the ordinary read-evaluate-print loop.
  3. The Payoff, Measured:
  - Compares stack usage for compiled vs. interpreted `factorial(5)` (36 pushes/depth 14 vs. 151 pushes/depth 28), concretely quantifying compilation's efficiency advantage, and closes the chapter reflecting on interpretation and compilation as two complementary strategies for porting a language to a new machine.

  Key terms: C (Python interpreter written in), C (compiling Python into), C (error handling), Internet Worm, Spafford, Eugene H., UNIX, apply_dispatch (modified for compiled code), compile_and_go, compile_and_run, compiled_apply, compiler (interpreter vs.), compiler for Python, compiler for Python (explicit control evaluator vs.), compiler for Python (interfacing to evaluator), compiler for Python (monitoring performance (stack use) of compiled code), compiler for Python (running compiled code), error handling (in compiled code), explicit control evaluator for Python (modified for compiled code), external_entry, factorial (stack usage, compiled), fib (stack usage, compiled), interpreter (compiler vs.), metacircular evaluator for Python (compilation of), porting a language, scanning out declarations (in compiler)
  """
end
