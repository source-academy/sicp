function formatAttributes(attrs: string) {
  const attrStr = Object.entries(attrs)
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");
  return attrStr ? " " + attrStr : "";
}

function escapeXML(str: string): string {
  return str
    .replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;")
    .replace(/<([^a-zA-Z\/])/g, "&lt;$1") // Fix lone < characters
    .replace(/([^a-zA-Z0-9"'\s\/])>/g, "$1&gt;"); // Fix lone > characters;
}

function strongEscapeXML(str: string): string {
  return str
    .replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;))/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/【([\s\S]*?)】/g, "");
}

export { formatAttributes, escapeXML, strongEscapeXML };
