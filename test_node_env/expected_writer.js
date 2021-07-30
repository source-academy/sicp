import { Script } from "vm";
import { createWriteStream } from "fs";

let writer2 = createWriteStream("test_node_env/expect.txt");
const args = process.argv.slice(2);
const expected = args[0];

writer2.once("open", function (fd) {
  let e = new Script(expected);
  let r = e.runInNewContext();
  if (typeof r !== "undefined") {
    writer2.write(JSON.stringify(r));
  } else {
    writer2.write("undefined");
  }
  writer2.end();
});
