import { Script } from 'vm';
import { createWriteStream } from 'fs';

let writer2 = createWriteStream("test_node_env/expected.txt");
writer2.once('open', function(fd) {
    let r = e.runInNewContext();
    if (typeof r !== 'undefined') {
        writer2.write(JSON.stringify(r));
    } else {
        writer2.write("undefined");
    }
    writer2.end();
});

let e = new Script(`49`);
