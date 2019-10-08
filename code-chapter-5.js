/// From §4.1
function is_tagged_list(exp, tag) {
    return is_pair(exp)
        ? equals(head(exp), tag)
        : false;
}

/// Scheme association lists
/// https://www.gnu.org/software/mit-scheme/documentation/mit-scheme-ref/Association-Lists.html
function assoc(key, alist) {
    if (is_null(alist)) {
        return false; 
    } else if (equal(head(head(alist)), key)) {
        return head(alist);
    } else {
        return assoc(tail(alist), key);
    }
}

// Missing:
// parse

function get_contents(register) {
    return register("get");
}

function set_contents(register, value) {
    return register("set")(value);
}

/// ============== § 5.2 A Register-Machine Simulator

function gcd_machine() {
    return make_machine(list("a", "b", "t"),
                        list(pair("rem", (a, b) => a % b), pair("=", equal)),
                        parse("...program from below...."));
}        

/// ============== § 5.2.1 The Machine Model

function make_machine(register_names, ops, controller_text) {
    const machine = make_new_machine();

    map(reg_name => machine("allocate_register")(reg_name), register_names);
    machine("install_operations")(ops);
    machine("install_instruction_sequence")(assemble(controller_text, machine));

    return machine;
}

/// ============== § 5.2.1 > Registers

function make_register(name) {
    let contents = "*unassigned*";

    function dispatch(message) {
        if (message === "get") {
            return contents;

        } else {
            if (message === "set") {
                return value => { contents = value; };

            } else {
                error("Unknown request: REGISTER", message);
            }
        }
    }

    return dispatch;
}

/// ============== § 5.2.1 > The stack

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

function pop(stack) {
    return stack("pop");
}

function push(stack, value) {
    return stack("push")(value);
}

/// ============== § 5.2.1 > Figure 5.13 (and following paragraphs)

function make_new_machine() {
    const pc = make_register("pc");
    const flag = make_register("flag");
    const stack = make_stack();
    let the_instruction_sequence = null;
    let the_ops = list(pair("initialize_stack", () => stack("initialize")));
    let register_table = list(pair("pc", pc), pair("flag", flag));
    
    function allocate_register(name) {
        if (assoc(name, register_table)) {
            error("Multiply defined register: ", name);

        } else {
            register_table = pair(pair(name, make_register(name)), register_table);
        }

        return "register_allocated";
    }

    function lookup_register(name) {
        const val = assoc(name, register_table);

        return is_null(val)
            ? error("Unknown register:", name);
            : head(tail(val));
    }
    
    
    function execute() {
        const insts = get_contents(pc);

        if (is_null(insts)) {
            return "done";

        } else {
            instruction_execution_proc(head(insts))(); 
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
            : error("Unknown request: MACHINE", message);
    }
    
    return dispatch;
}

function start(machine) {
    return machine("start")();
}

function get_register_contents(machine, register_name) {
    return get_contents(get_register(machine, register_name));
}

function set_register_contents(machine, register_name, value) {
    set_contents(get_register(machine, register_name), value);
    return "done";
}

function get_register(machine, reg_name) {
    return machine("get_register")(reg_name);
}

/// ============== § 5.2.2 The Assembler

function assemble(controller_text, machine) {
    function receive(insts, labels) {
        update_insts(insts, labels, machine);
        insts;
    }
    
    extract_labels(controller_text, receive);
}

function extract_labels(text, receive) {
    function helper(insts, labels) { /// FIXME: rename to something useful
        const next_inst = head(text);

        return is_string(next_inst)
            ? receive(insts, pair(make_label_entry(next_inst, insts), labels));
            : receive(pair(make_instruction(next_inst), insts), labels);
    }

    return is_null(text)
        ? receive(null, null)
        : extract_labels(tail(text), helper);
}

/// ============== Footnote 4 of chapter

function __extract_labels(text, receive) { /// FIXME: remove __
    if (is_null(text)) {
        return pair(null, null);

    } else {
        const result = extract_labels(tail(text));
        const insts = head(result);
        const labels = tail(result);
        const next_inst = head(text);

        return is_string(next_inst)
            ? pair(insts, pair(make_label_entry(next_inst, insts)), labels);
            : pair(pair(make_instruction(next_inst), insts), labels);
    }
}

function __assemble_alternative(controller_text, machine) { /// FIXME: remove __
    const result = extract_labels(controller_text);
    const insts = head(result);
    const labels = tail(result);

    update_insts(insts, labels, machine);

    return insts;
}

/// (end of footnote)

function update_insts(insts, labels, machine) {
    const pc = get_register(machine, "pc");
    const flag = get_register(machine, "flag");
    const stack = get_register(machine, "stack");
    const ops = get_register(machine, "operations");

    const set_iep = set_instruction_execution_proc;
    const make_ep = make_execution_procedure;
    return map(i => set_iep(inst,
                            make_ep(instruction_text(inst),
                                    labels,
                                    machine,
                                    pc,
                                    flag,
                                    stack,
                                    ops)),
               insts);
}

function make_instruction(text) {
    return pair(text, null);
}

function instruction_text(inst) {
    return head(inst);
}

function instruction_execution_proc(inst) {
    return head(inst);
}

function set_instruction_execution_proc(inst, proc) {
    set_tail(inst, proc); 
}

function make_label_entry(label_name, insts) {
    return pair(label_name, insts);
}

function lookup_label(labels, label_name) {
    const val = assoc(label_name, labels);

    return val === false
        ? error("Undefined label: ASSEMBLE", label_name)
        : tail(val);
}

/// ============== § 5.2.3

function make_execution_procedure(inst, labels, machine, pc, flag, stack, ops) {
    const x = head(inst);

    return x === "assign"
        ? make_assign(inst, machine, labels, ops, flag, pc)
        : x === "test"
        ? make_test(inst, machine, labels, ops, flag, pc)
        : x === "branch"
        ? make_branch(inst, machine, labels, flag, pc)
        : x === "goto"
        ? make_goto(inst, machine, labels, pc)
        : x === "save"
        ? make_save(inst, machine, stack, pc)
        : x === "restore"
        ? make_restore(inst, machine, stack, pc)
        : x === "perform"
        ? make_perform(inst, machine, labels, ops, pc)
        : error("Unknown instruction type: ASSEMBLE", inst);
}

/// ============== § 5.2.3 > assign instructions

function make_assign(inst, machine, labels, operations, pc) {
    const target = get_register(machine, assign_reg_name(inst));
    const value_exp = assign_value_exp(inst);
    const value_proc = operation_exp(value_exp)
          ? make_operation_exp(value_exp, machine, labels, operations)
          : make_primitive_exp(head(value_exp), machine, labels);

    function perform() {
        set_contents(target, value_proc());
        advance_pc(pc);
    }

    return perform;
}

function assign_reg_name(assign_instruction) {
    return head(tail(assign_instruction));
}

function assign_value_exp(assign_instruction) { 
    return tail(tail(assign_instruction));
}

function advance_pc(pc) {
    set_contents(pc, head(tail(get_contents(pc))));
}

/// ============== § 5.2.3 > test, branch and goto instructions

function make_test(inst, machine, labels, operations, flag, pc) {
    const condition = test_condition(inst);

    if (operation_exp(condition)) {
        const condition_proc = make_operation_exp(condition, machine, labels, operations);

        function perform() {
            set_contents(flag, condition_proc());
            advance_pc(pc);
        };

        return perform; 
    } else {
        error("Bad TEST instruction: ASSEMBLE", inst);
    }
}

function test_condition(test_instruction) {
    return tail(test_instruction);
}

function make_branch(inst, machine, labels, flag, pc) {
    const dest = branch_dest(inst);
    
    if (is_label_exp(dest)) {
        const insts = lookup_label(labels, label_exp_label(dest));

        function perform() {
            if (get_contents(flag)) {
                set_contents(pc, insts);
                advance_pc(pc);

            } else {
                /// Do nothing
            }
        }

        return perform;

    } else {
        error("Bad BRANCH instruction: ASSEMBLE", inst);
    }
}

function branch_dest(branch_instruction) {
    return head(tail(branch_instruction));
}

function make_goto(inst, machine, labels, pc) {
    const dest = goto_dest(inst);

    if (is_label_exp(dest)) {
        const insts = lookup_label(labels, label_exp_label(dest));
        return () => set_contents(pc, insts);

    } else if (is_register_exp(dest)) {
        const reg = get_register(machine, register_exp_reg(dest));
        return () => set_contents(pc, get_contents(reg));

    } else {
        error("Bad GOTO instruction: ASSEMBLE", inst);
    }
}

function goto_dest(goto_instruction) {
    head(tail(goto_instruction));
}

/// ============== § 5.2.3 > Other instructions

function make_save(inst, machine, stack, pc) {
    const reg = get_register(machine, stack_inst_reg_name(inst));

    function perform() {
        push(stack, get_contents(reg));
        advance_pc(pc);
    }

    return perform;
}

function make_restore(inst, machine, stack, pc) {
    const reg = get_register(machine, stack_inst_reg_name(inst));

    function perform() {
        set_contents(reg, pop(stack));
        advance_pc(pc);
    }

    return perform;
}

function stack_inst_reg_name(stack_instruction) {
    return head(tail(stack_instruction));
}

function make_perform(inst, machine, labels, operations, pc) {
    const action = perform_action(inst);

    if (operation_exp(action)) {
        const action_proc = make_operation_exp(action, machine, labels, operations);
        return () => advance_pc(pc);

    } else {
        error("Bad PERFORM instruction: ASSEMBLE", inst);
    }
}

function perform_action(inst) {
    return tail(inst); 
}

/// ============== § 5.2.3 > Execution Procedures for Subexpressions

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
        error("Unknown expression type: ASSEMBLE", exp);
    }
}

function is_register_exp(exp) {
    return is_tagged_list(exp, "reg");
}

function register_exp_reg(exp) {
    return head(tail(exp));
}

function is_constant_exp(exp) {
    return is_tagged_list(exp, "const");
}

function constant_exp_value(exp) {
    return head(tail(exp));
}

function is_label_exp(exp) {
    return is_tagged_list(exp, "label");
}

function label_exp_label(exp) {
    return head(tail(exp));
}

function make_operation_exp(exp, machine, labels, operations) {
    const op = lookup_prim(operation_exp_op(exp), operations);
    const aprocs = map(e => make_primitive_exp(e, machine, labels), operation_exp_operands(exp));

    function perform() {
        apply(op, map(p => p(), aprocs));
    }
    
    return perform;
}

function operation_exp(exp) {
    return is_pair(exp) && is_tagged_list(head(exp), "op");
}

function operation_exp_op(operation_exp) {
    return head(tail(operation_exp));
}

function operation_exp_operands(operation_exp) {
    return head(operation_exp);
}

function lookup_prim(symbol, operations) {
    const val = assoc(symbol, operations);

    return val
        ? head(tail(val))
        : error("Unknown operation: ASSEMBLE", symbol);
}


/// ============== § 5.2.4 Monitoring Machine Performance 

list(list("initialize-stack", () => stack("initialize")),
     list("print-stack-statistics", () => stack("print-statistics")));


function make_stack() {
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
        display(accumulate((a, b) => stringify(a) + b,
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
            : error("Unknown request: STACK", message);
    }

    return dispatch;
}

/// ============== § 5.3
