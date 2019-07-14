export const checkIndexBadEndWarning = indexStr => {
  const last = indexStr.slice(-1);
  if (last == "!" || last == "@") {
    console.log("WARNING, index ends with special character: " + indexStr + "\n");
  }
};

export const checkLongLineWarning = str => {
  const lines = str.split("\n");
  for (const line of lines) {
    if (line.length >= 75) {
      console.log(
        "WARNING, line is too long (>74 chars) and will overflow the page:\n" +
          line + "\n"
      );
    }
  }
};

export const missingRequireWarning = (required) => {
  console.log("WARNING, REQUIRES not found: " + required + "\n");
};

export const missingExampleWarning = (name) => {
  console.log("WARNING, EXAMPLE not found: " + name + "\n");
};

export const repeatedNameWarning = (name) => {
  console.log("WARNING, Repeated SNIPPET name: " + name + "\n");
};
