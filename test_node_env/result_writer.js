import { Script } from 'vm';
import 'sicp';
import { readFileSync, createWriteStream } from 'fs';
"use strict";

let writer = createWriteStream("test_node_env/result.txt");
const args = process.argv.slice(2);
const programPath = args[0];

writer.once('open', function(fd) {
    let s = new Script(readFileSync(programPath));
    let r = s.runInThisContext();
    if (typeof r !== 'undefined') {
        writer.write(JSON.stringify(r));
    } else {
        writer.write("undefined");
    }
    writer.end();
});
