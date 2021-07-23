import { Script } from 'vm';
import 'sicp';
import { readFileSync, createWriteStream } from 'fs';
"use strict";

let writer = createWriteStream("test_node_env/result.txt");
writer.once('open', function(fd) {
    let r = s.runInThisContext();
    if (typeof r !== 'undefined') {
        writer.write(JSON.stringify(r));
    } else {
        writer.write("undefined");
    }
    writer.end();
});

let s = new Script(readFileSync("js_programs/chapter1/section3/subsection4/27_compose_definition_solution.js"));
