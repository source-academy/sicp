export const checkIndexBadEndWarning = indexStr => {
  const last = indexStr.slice(-1);
  if (last == "!" || last == "@") {
    console.log(
      "WARNING, index ends with special character: " + indexStr + "\n"
    );
  }
};

export const checkLongLineWarning = str => {
  const lines = str.split("\n");
  for (const line of lines) {
    if (line.length > 72) {
      console.log(
        "WARNING, line is too long (>72 chars) and will overflow the page:\n" +
          line +
          "\n"
      );
    }
  }
};

export const missingRequireWarning = required => {
  console.log("WARNING, REQUIRES not found: " + required + "\n");
};

export const missingExampleWarning = name => {
  console.log("WARNING, EXAMPLE not found: " + name + "\n");
};

export const repeatedNameWarning = name => {
  console.log("WARNING, Repeated SNIPPET name: " + name + "\n");
};

export const repeatedRefNameWarning = name => {
  console.log("WARNING, Repeated REF name: " + name + "\n");
};

export const missingExerciseWarning = name => {
  console.log("WARNING, EXERCISE not found:" + name + "\n");
};

export const missingReferenceWarning = name => {
  console.log("WARNING, REF not found:" + name + "\n");
};
