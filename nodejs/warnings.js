export const checkIndexBadEndWarning = (indexStr) => {
	const last = indexStr.slice(-1);
  if (last == "!" || last == "@") {
    console.log("WARNING, index ends with special character:\n" + indexStr);
  }
}

export const checkLongLineWarning = (line) => {
	if (line.length >= 75) {
    console.log("WARNING, line is too long (>74 chars) and will overflow the page:\n" + line);
  }
}

export const missingRequireWarning = () => {
	console.log("WARNING, REQUIRE not found: " + required);
}