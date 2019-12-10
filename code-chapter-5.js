function assoc(key, records) {
    return is_null(records)
           ? undefined
           : equal(key, head(head(records)))
             ? head(records)
             : assoc(key, tail(records));
}

/// From §4.1
function is_tagged_list(exp, tag) {
    return is_pair(exp)
        ? equal(head(exp), tag)
        : false;
}

function get_contents(register) {
    return register("get");
}

function set_contents(register, value) {
    return register("set")(value);
}

/// Stuff from §5.1

function op(name) {
    return list("op", name);
}

function reg(name) {
    return list("reg", name);
}

function label(name) {
    return list("label", name);
}

function constant(value) {
    return list("constant", value);
}

function branch(label) {
    return list("branch", label);
}

function assign(register_name, source) {
    return append(list("assign", register_name), source);
}

function go_to(label) {
    return list("go_to", label);
}

function test(op, lhs, rhs) {
    return list("test", op, lhs, rhs);
}

/// ============== § 5.2 A Register-Machine Simulator

function binary_function(f) { // f is binary
    return arg_list => 
        length(arg_list) === 2
        ? apply_in_underlying_javascript(
             f, arg_list)
        : error(arg_list, 
             "Incorrect number of arguments passed to binary function ");
}

/// copied into xml sources
function gcd_machine() {
    return make_machine(list("a", "b", "t"),
                        list(list("rem", binary_function((a, b) => a % b)),
                             list("=", binary_function((a, b) => a === b))),
                        list("test-b",
                             test(op("="), reg("b"), constant(0)),
                             branch(label("gcd-done")),
                             assign("t", list(op("rem"), reg("a"), reg("b"))),
                             assign("a", list(reg("b"))),
                             assign("b", list(reg("t"))),
                             go_to(label("test-b")),
                             "gcd-done"));
}        

/// ============== § 5.2.1 The Machine Model

/// copied into xml sources
function make_machine(register_names, ops, controller_text) {
    const machine = make_new_machine();

    map(reg_name => machine("allocate_register")(reg_name), register_names);
    machine("install_operations")(ops);
    machine("install_instruction_sequence")(assemble(controller_text, machine));

    return machine;
}

/// ============== § 5.2.1 > Registers

/// copied into xml sources
function make_register(name) {
    let contents = "*unassigned*";

    function dispatch(message) {
        if (message === "get") {
            return contents;

        } else {
            if (message === "set") {
                return value => { contents = value; };

            } else {
                error(message, "Unknown request: REGISTER");
            }
        }
    }

    return dispatch;
}

/// ============== § 5.2.1 > The stack

/// copied into xml sources
function make_stack() {
    let stack = null;

    function push(x) { 
        stack = pair(x, stack); 
        return "done";
    }

    function pop() {
        if (is_null(stack)) {
            error("Empty stack: POP");

        } else {
            const top = head(stack);
            stack = tail(stack);
            return top;
        }
    }

    function initialize() {
        stack = null;
        return "done";
    }

    function dispatch(message) {
        return message === "push"
            ? push
            : message === "pop"
            ? pop()
            : message === "initialize"
            ? initialize()
            : error("Unknown request: STACK", message);
    }

    return dispatch;
}

/// copied into xml sources
function pop(stack) {
    return stack("pop");
}

/// copied into xml sources
function push(stack, value) {
    return stack("push")(value);
}

/// ============== § 5.2.1 > Figure 5.13 (and following paragraphs)

/// copied into xml sources
function make_new_machine() {
    const pc = make_register("pc");
    const flag = make_register("flag");
    const stack = make_stack();
    let the_instruction_sequence = null;
    let the_ops = list(list("initialize_stack", () => stack("initialize")));
    let register_table = list(list("pc", pc), list("flag", flag));
    
    function allocate_register(name) {
        if (assoc(name, register_table) === undefined) {
            register_table = pair(list(name, make_register(name)), register_table);

        } else {
            error(name, "Multiply defined register: ");
        }

        return "register_allocated";
    }

    function lookup_register(name) {
        const val = assoc(name, register_table);
        
        return val === undefined
            ? error(name, "Unknown register:")
            : head(tail(val));
    }

    function execute() {
        const insts = get_contents(pc);

        if (is_null(insts)) {
            return "done";

        } else {
            const proc = instruction_execution_proc(head(insts)); 
            proc(); /// FIXME: delete intermediate step? Added by Tobias for clarity.
            return execute();
        }
    }

    function dispatch(message) {
        return message === "start"
                ? () => { set_contents(pc, the_instruction_sequence); return execute(); }
            : message === "install_instruction_sequence"
                ? seq => { the_instruction_sequence = seq; }
            : message === "allocate_register"
                ? allocate_register
            : message === "get_register"
                ? lookup_register
            : message === "install_operations"
                ? ops => { the_ops = append(the_ops, ops); }
            : message === "stack"
                ? stack
            : message === "operations"
                ? the_ops
            : error(message, "Unknown request: MACHINE");
    }
    
    return dispatch;
}

/// copied into xml sources
function start(machine) {
    return machine("start")();
}

/// copied into xml sources
function get_register_contents(machine, register_name) {
    return get_contents(get_register(machine, register_name));
}

/// copied into xml sources
function set_register_contents(machine, register_name, value) {
    set_contents(get_register(machine, register_name), value);
    return "done";
}

/// copied into xml sources
function get_register(machine, reg_name) {
    return machine("get_register")(reg_name);
}

/// ============== § 5.2.2 The Assembler

/// copied into xml sources
function assemble(controller_text, machine) {
    function receive(insts, labels) {
        update_insts(insts, labels, machine);
        return insts;
    }
    
    return extract_labels(controller_text, receive);
}

/// copied into xml sources
function extract_labels(text, receive) {
    function helper(insts, labels) { /// FIXME: rename to something useful
        const next_inst = head(text);

        return is_string(next_inst)
            ? receive(insts, pair(make_label_entry(next_inst, insts), labels))
            : receive(pair(make_instruction(next_inst), insts), labels);
    }

    return text === undefined || is_null(text)
        ? receive(null, null)
        : extract_labels(tail(text), helper);
}

/// ============== Footnote 4 of chapter

/// copied into xml sources
function __extract_labels(text, receive) { /// FIXME: remove __
    if (is_null(text)) {
        return pair(null, null);

    } else {
        const result = __extract_labels(tail(text));
        const insts = head(result);
        const labels = tail(result);
        const next_inst = head(text);

        return is_string(next_inst)
            ? pair(insts, pair(make_label_entry(next_inst, insts), labels))
            : pair(pair(make_instruction(next_inst), insts), labels);
    }
}

/// copied into xml sources
function __assemble_alternative(controller_text, machine) { /// FIXME: remove __
    const result = extract_labels(controller_text);
    const insts = head(result);
    const labels = tail(result);

    update_insts(insts, labels, machine);

    return insts;
}

/// (end of footnote)

/// copied into xml sources
function update_insts(insts, labels, machine) {
    const pc = get_register(machine, "pc");
    const flag = get_register(machine, "flag");
    const stack = machine("stack");
    const ops = machine("operations");

    const set_iep = set_instruction_execution_proc;
    const make_ep = make_execution_procedure;
    return map(i => set_iep(i,
                            make_ep(instruction_text(i),
                                    labels,
                                    machine,
                                    pc,
                                    flag,
                                    stack,
                                    ops)),
               insts);
}

/// copied into xml sources
function make_instruction(text) {
    return pair(text, null);
}

/// copied into xml sources
function instruction_text(inst) {
    return head(inst);
}

/// copied into xml sources
function instruction_execution_proc(inst) {
    return tail(inst);
}

/// copied into xml sources
function set_instruction_execution_proc(inst, proc) {
    set_tail(inst, proc); 
}

/// copied into xml sources
function make_label_entry(label_name, insts) {
    return pair(label_name, insts);
}

/// copied into xml sources
function lookup_label(labels, label_name) {
    const val = assoc(label_name, labels);

    return val === undefined
        ? error(label_name, "Undefined label: ASSEMBLE")
        : tail(val);
}

/// ============== § 5.2.3

/// copied into xml sources
function make_execution_procedure(inst, labels, machine, pc, flag, stack, ops) {
    const x = head(inst);

    return x === "assign"
        ? make_assign(inst, machine, labels, ops, pc)
        : x === "test"
        ? make_test(inst, machine, labels, ops, flag, pc)
        : x === "branch"
        ? make_branch(inst, machine, labels, flag, pc)
        : x === "go_to"
        ? make_goto(inst, machine, labels, pc)
        : x === "save"
        ? make_save(inst, machine, stack, pc)
        : x === "restore"
        ? make_restore(inst, machine, stack, pc)
        : x === "perform"
        ? make_perform(inst, machine, labels, ops, pc)
        : error(inst, "Unknown instruction type: ASSEMBLE");
}

/// ============== § 5.2.3 > assign instructions

/// copied into xml sources
function make_assign(inst, machine, labels, operations, pc) {
    const target = get_register(machine, assign_reg_name(inst));
    const value_exp = assign_value_exp(inst);
    const value_proc = is_operation_exp(value_exp)
          ? make_operation_exp(value_exp, machine, labels, operations)
          : make_primitive_exp(head(value_exp), machine, labels);

    function perform_make_assign() {
        set_contents(target, value_proc());
        advance_pc(pc); 
    }

    return perform_make_assign;
}

/// copied into xml sources
function assign_reg_name(assign_instruction) {
    return head(tail(assign_instruction));
}

/// copied into xml sources
function assign_value_exp(assign_instruction) { 
    return tail(tail(assign_instruction));
}

/// copied into xml sources
function advance_pc(pc) {
    set_contents(pc, tail(get_contents(pc))); 
    
}

/// ============== § 5.2.3 > test, branch and goto instructions

/// copied into xml sources
function make_test(inst, machine, labels, operations, flag, pc) {
    const condition = test_condition(inst);

    if (is_operation_exp(condition)) {
        const condition_proc = make_operation_exp(condition, machine, labels, operations);

        function perform_make_test() {
            set_contents(flag, condition_proc());
            advance_pc(pc); 
        }

        return perform_make_test; 
    } else {
        error(inst, "Bad TEST instruction: ASSEMBLE");
    }
}

/// copied into xml sources
function test_condition(test_instruction) {
    return tail(test_instruction);
}

/// copied into xml sources
function make_branch(inst, machine, labels, flag, pc) {
    const dest = branch_dest(inst);
    
    if (is_label_exp(dest)) {
        const insts = lookup_label(labels, label_exp_label(dest));

        function perform_make_branch() {
            if (get_contents(flag)) {
                set_contents(pc, insts);

            } else {
                advance_pc(pc);
            }
        }

        return perform_make_branch;

    } else {
        error(inst, "Bad BRANCH instruction: ASSEMBLE");
    }
}

/// copied into xml sources
function branch_dest(branch_instruction) {
    return head(tail(branch_instruction));
}

/// copied into xml sources
function make_goto(inst, machine, labels, pc) {
    const dest = goto_dest(inst);

    if (is_label_exp(dest)) {
        const insts = lookup_label(labels, label_exp_label(dest));
        return () => set_contents(pc, insts);

    } else if (is_register_exp(dest)) {
        const reg = get_register(machine, register_exp_reg(dest));
        return () => set_contents(pc, get_contents(reg));

    } else {
        error(inst, "Bad GOTO instruction: ASSEMBLE");
    }
}

/// copied into xml sources
function goto_dest(goto_instruction) {
    return head(tail(goto_instruction));
}

/// ============== § 5.2.3 > Other instructions

/// copied into xml sources
function make_save(inst, machine, stack, pc) {
    const reg = get_register(machine, stack_inst_reg_name(inst));

    function perform_make_save() {
        push(stack, get_contents(reg));
        advance_pc(pc);
    }

    return perform_make_save;
}

/// copied into xml sources
function make_restore(inst, machine, stack, pc) {
    const reg = get_register(machine, stack_inst_reg_name(inst));

    function perform_make_restore() {
        set_contents(reg, pop(stack));
        advance_pc(pc); 
    }

    return perform_make_restore;
}

/// copied into xml sources
function stack_inst_reg_name(stack_instruction) {
    return head(tail(stack_instruction));
}

/// copied into xml sources
function make_perform(inst, machine, labels, operations, pc) {
    const action = perform_action(inst);

    if (is_operation_exp(action)) {
        const action_proc = make_operation_exp(action, machine, labels, operations);
        return () => { action_proc(); advance_pc(pc); }

    } else {
        error(inst, "Bad PERFORM instruction: ASSEMBLE");
    }
}

/// copied into xml sources
function perform_action(inst) {
    return tail(inst); 
}

/// ============== § 5.2.3 > Execution Procedures for Subexpressions

/// copied into xml sources
function make_primitive_exp(exp, machine, labels) {
    if (is_constant_exp(exp)) {
        const c = constant_exp_value(exp);
        return () => c;
        
    } else if (is_label_exp(exp)) {
        const insts = lookup_label(labels, label_exp_label(exp));
        return () => insts;

    } else if (is_register_exp(exp)) {
        const r = get_register(machine, register_exp_reg(exp));
        return () => get_contents(r); 

    } else {
        error(exp, "Unknown expression type: ASSEMBLE");
    }
}

/// copied into xml sources
function is_register_exp(exp) {
    return is_tagged_list(exp, "reg");
}

/// copied into xml sources
function register_exp_reg(exp) {
    return head(tail(exp));
}

/// copied into xml sources
function is_constant_exp(exp) {
    return is_tagged_list(exp, "constant");
}

/// copied into xml sources
function constant_exp_value(exp) {
    return head(tail(exp));
}

/// copied into xml sources
function is_label_exp(exp) {
    return is_tagged_list(exp, "label");
}

/// copied into xml sources
function label_exp_label(exp) {
    return head(tail(exp));
}

/// copied into xml sources
function make_operation_exp(exp, machine, labels, operations) {
    const op = lookup_prim(operation_exp_op(exp), operations);
    const aprocs = map(e => make_primitive_exp(e, machine, labels), operation_exp_operands(exp));

    function perform_make_operation_exp() {
        return op(map(p => p(), aprocs));
    }
    
    return perform_make_operation_exp;
}

/// copied into xml sources
function is_operation_exp(exp) {
    return is_pair(exp) && is_tagged_list(head(exp), "op");
}

/// copied into xml sources
function operation_exp_op(operation_exp) {
    return head(tail(head(operation_exp)));
}

/// copied into xml sources
function operation_exp_operands(operation_exp) {
    return tail(operation_exp);
}

/// copied into xml sources
function lookup_prim(symbol, operations) {
    const val = assoc(symbol, operations);

    return val === undefined
        ? error(symbol, "Unknown operation: ASSEMBLE")
        : head(tail(val));
}


/// ============== § 5.2.4 Monitoring Machine Performance 

/*
/// copied into xml sources
list(list("initialize-stack", () => stack("initialize")),
     list("print-stack-statistics", () => stack("print-statistics")));

/// copied into xml sources
function _make_stack() { /// FIXME: remove _
    let s = null;
    let number_pushes = 0;
    let max_depth = 0;
    let current_depth = 0;

    function push(x) {
        s = pair(x, s);
        number_pushes = number_pushes + 1;
        current_depth = current_depth + 1;
        max_depth = math_max(current_depth, math_max);
    }

    function pop() {
        if (is_null(s)) {
            error("Empty stack: POP");

        } else {
            const top = head(s);
            s = tail(s);
            current_depth = current_depth - 1;

            return top;
        }
    }

    function initialize() {
        s = null;
        number_pushes = 0;
        max_depth = 0;
        current_depth = 0;

        return "done";
    }

    function print_statistics() {
        display(accumulate((b, a) => stringify(a) + b,
                           list("\n", "total-pushes = ", number_pushes,
                                "\n", "maximum-depth = ", max_depth)));
    }

    function dispatch(message) {
        return message === "push"
            ? push
            : message === "pop"
            ? pop()
            : message === "initialize"
            ? initialize()
            : message === "print-statistics"
            ? print_statistics()
            : error(message, "Unknown request: STACK");
    }

    return dispatch;
}
*/
/// ============== § 5.3

// --------------------------------------------

function array_test(x) {
    if (Array.isArray === undefined) {
        return x instanceof Array
    } else {
        return Array.isArray(x)
    }
}

function pair(x, xs) {
    return [x, xs]
}

function is_pair(x) {
    return array_test(x) && x.length === 2
}

function head(xs) {
    if (is_pair(xs)) {
        return xs[0]
    } else {
        throw new Error("head(xs) expects a pair as argument xs, but encountered " + xs)
    }
}

function tail(xs) {
    if (is_pair(xs)) {
        return xs[1]
    } else {
        throw new Error("tail(xs) expects a pair as argument xs, but encountered " + xs)
    }
}

function set_head(xs, v) {
    if (is_pair(xs)) {
        return xs[0] = v;
    } else {
        throw new Error("head(xs) expects a pair as argument xs, but encountered " + xs)
    }
}

function set_tail(xs, v) {
    if (is_pair(xs)) {
        return xs[1] = v;
    } else {
        throw new Error("tail(xs) expects a pair as argument xs, but encountered " + xs)
    }
}

function is_null(xs) {
    return xs === null
}

function is_list(xs) {
    for (; ; xs = tail(xs)) {
        if (is_null(xs)) {
            return true
        } else if (!is_pair(xs)) {
            return false
        }
    }
}

function list() {
    let the_list = null
    for (let i = arguments.length - 1; i >= 0; i--) {
        the_list = pair(arguments[i], the_list)
    }
    return the_list
}

function length(xs) {
    let i = 0
    while (!is_null(xs)) {
        i += 1
        xs = tail(xs)
    }
    return i
}

function map(f, xs) {
    return is_null(xs) ? null : pair(f(head(xs)), map(f, tail(xs)))
}

function reverse(xs) {
    if (!is_list(xs)) {
        throw new Error("reverse(xs) expects a list as argument xs, but encountered " + xs)
    }
    let result = null
    for (; !is_null(xs); xs = tail(xs)) {
        result = pair(head(xs), result)
    }
    return result
}

function append(xs, ys) {
    if (is_null(xs)) {
        return ys
    } else {
        return pair(head(xs), append(tail(xs), ys))
    }
}

function member(v, xs) {
    for (; !is_null(xs); xs = tail(xs)) {
        if (head(xs) === v) {
            return xs
        }
    }
    return null
}

function remove(v, xs) {
    if (is_null(xs)) {
        return null
    } else {
        if (v === head(xs)) {
            return tail(xs)
        } else {
            return pair(head(xs), remove(v, tail(xs)))
        }
    }
}

function equal(item1, item2) {
    if (is_pair(item1) && is_pair(item2)) {
        return equal(head(item1), head(item2)) && equal(tail(item1), tail(item2))
    } else {
        return item1 === item2
    }
}

function is_string(xs) {
    return typeof xs === 'string';
}

function error(val, str) {
    const output = (str === undefined ? '' : str + ' ') + stringify(val)
    throw new Error(output)
}

function stringify(val) {
    return "" + val;
}

function display(arg) {
    const util = require('util')
    console.log(util.inspect(arg, false, null, true /* enable colors */));
}

const m = gcd_machine();

display(set_register_contents(m, "a", 206));
display(set_register_contents(m, "b", 40));
display(start(m));
display(get_register_contents(m, "a"))
