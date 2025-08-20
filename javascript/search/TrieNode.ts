export class TrieNode {
  children: { [key: string]: TrieNode };
  value: string[];
  key: string;

  constructor() {
    this.children = {};
    this.value = [];
    this.key = "";
  }
}

export function insert(keyStr: string, value: string, trie: TrieNode) {
  const keys = [...keyStr];
  let node: TrieNode | undefined = trie;
  for (const k of keys) {
    if (!node.children[k]) {
      node.children[k] = new TrieNode();
    }
    node = node.children[k];
  }
  node.value.push(value);
  node.key = keyStr;
}

export function search(keyStr: string, trie: TrieNode) {
  const keys = [...keyStr];
  let node = trie;
  for (let i = 0; i < keys.length; i++) {
    if (node === undefined || node.children === undefined) {
      console.log("when searching, got undefined node or node.children");
      console.log("i is " + i);
      return null;
    }
    // OK since we have i < keys.length
    const k = keys[i]!;
    if (!node.children[k]) {
      return null;
    }
    node = node.children[k];
  }
  return node.value;
}

export function autoComplete(incompleteKeys: string, trie: TrieNode, n = 30) {
  let node = trie;
  for (const ik of incompleteKeys) {
    if (!node.children[ik]) {
      return [];
    }
    node = node.children[ik];
  }

  const result = [];
  const queue = [node];
  while (queue.length > 0 && result.length < n) {
    // OK since we have queue.length > 0
    const node = queue.shift()!;
    if (node.value.length > 0) {
      result.push(node.key);
    }
    for (const child of Object.values(node.children)) {
      queue.push(child);
    }
  }
  return result;
}
