import fs from "fs";

// line 3 to 68: trie implementation and search functions
class trieNode {
    constructor() {
        this.children = {};
        this.value = [];
        this.key = "";
    }
}

export function insert(keyStr, value, trie) {
    const keys = [...keyStr];
    let node = trie;
    for (let i = 0; i < keys.length; i++) {
        if (!node.children[keys[i]]) {
            node.children[keys[i]] = new trieNode();
        }
        node = node.children[keys[i]];
    }
    node.value.push(value);
    node.key = keyStr;
}

export function search(keyStr, trie) {
    const keys = [...keyStr];
    let node = trie;
    for (let i = 0; i < keys.length; i++) {
        if(node === undefined || node.children === undefined) {
            console.log("when searching, got undefined node or node.children");
            console.log("i is " + i);
            return null;
        }

        if (!node.children[keys[i]]) {
            return null;
        }
        node = node.children[keys[i]];
    }
    return node.value;
}

export function autoComplete(incompleteKeys, trie, n = 30) {
    let node = trie;
    for (let i = 0; i < incompleteKeys.length; i++) {
        if (!node.children[incompleteKeys[i]]) {
            return [];
        }
        node = node.children[incompleteKeys[i]];
    }
    const result = [];
    const queue = [node];
    while (queue.length > 0 && result.length < n) {
        const node = queue.shift();
        if (node.value.length > 0) {
            result.push(node.key);
        }
        for (const child of Object.values(node.children)) {
            queue.push(child);
        }
    }
    return result;
}

export const getUrl= searchResult => `https://sourceacademy.nus.edu.sg/sicpjs/${searchResult.id}`;


// search data, maintaining and updation functions and write function from this line onwards
export const idToContentMap = {};
export const textTrie = new trieNode();
export const indexTrie = new trieNode();


const parseIndexSearchEntryTo = (node, json) => {
    if (node === null) return;
    if(indexParsers[node.nodeName]) {
        indexParsers[node.nodeName](node, json);
        return;
    }
};

// currently not used, a map of all the tags in json, good reference
const processingFunctions = {
    '#text': 1,
  
    B: 1,
    BR: 1,
  
    DISPLAYFOOTNOTE: 1,
  
    EM: 1,
  
    EPIGRAPH: 1,
  
    EXERCISE: 1,
  
    FIGURE: 1,
  
    FOOTNOTE_REF: 1,
  
    JAVASCRIPTINLINE: 1,
  
    LATEX: 1,
  
    LI: 1,
  
    LINK: 1,
  
    META: 1,
  
    OL: 1,
  
    REF: 1,
  
    REFERENCE: 1,
  
    SNIPPET: 1,
  
    SUBHEADING: 1,
  
    SUBSUBHEADING: 1,
  
    TABLE: 1,
  
    TEXT: 1,
  
    TITLE:1,
  
    TT: 1,
  
    UL: 1,
};
// this list is dependent on the implementation of parseXmlJson and frontend
// so why parsing json at frontend? why not send html to frontend which will then only need to care

const indexParsers = {
    // plain text nodes
     "#text": (node,json) => {
        json["text"] += node.nodeValue;
    },
    
    OPERATOR: (node,json) => {
        json["text"] += "operators";
    },
    PARSING: (node,json) => {
        json["text"] += "parsing JavaScript";
    },
    FUNCTION: (node,json) => {
        json["text"] += "function (JavaScript)";
    }, 
    PRIMITIVE: (node,json) => {
        json["text"] += "primitive functions (ECMAScript equivalent in parentheses if they are in the ECMAScript standard)";
    },
    ENDASH: (node,json) => {
        json["text"] += "–";
    },
    APOS: (node,json) => {
        json["text"] += "'";
    },
    EACUTE_LOWER : (node,json) => {
        json["text"] += "é";
    },
    AACUTE_LOWER : (node,json) => {
        json["text"] += "á";
    },
    AACUTE_UPPER : (node,json) => {
        json["text"] += "Á";
    },
    SPACE: (node,json) => {
        json["text"] += " ";
    },
    // next and only child is text nodes
    ECMA: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing ECMA, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["text"] += ` (${node.firstChild.nodeValue})`;
    },
    JAVASCRIPTINLINE: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing JAVASCRIPTINLINE, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["text"] += node.firstChild.nodeValue;
    },
    QUOTE: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing QUOTE, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["text"] += `"${node.firstChild.nodeValue}"`;
    },
    USE: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing USE, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["text"] += node.firstChild.nodeValue;
        json["ORDER"] = node.firstChild.nodeValue;
    },
    DECLARATION: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing USE, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["text"] += node.firstChild.nodeValue;
        json["ORDER"] = node.firstChild.nodeValue;
    },
    ORDER: (node,json) => {
        if(node.firstChild.nodeName !== "#text") {
            console.log("when parsing ORDER, got this unknown node name" + node.firstChild.nodeName);
            return;
        }
        json["ORDER"] = node.firstChild.nodeValue;
    },
    // other nodes
    CLOSE: (node,json) => {
        json["CLOSE"] = true;
    },
    OPEN: (node,json) => {
        json["OPEN"] = true;
    },
    SUBINDEX: (node, json) => {
        const newJson = {"text":""};
        json["SUBINDEX"] = newJson;
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            parseIndexSearchEntryTo(child, newJson);
        }
    },
    SPLITINLINE: (node,json) => {
        const javascriptNode = node.getElementsByTagName("JAVASCRIPT")[0];
        if(!javascriptNode) {
            console.log("when parsing SPLITINLINE, got no JAVASCRIPT node");
            return;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            parseIndexSearchEntryTo(child, json);
        }
    },
    INDEX: (node, json) => {
        json["text"] = "";
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            parseIndexSearchEntryTo(child, json);
        }
        if(node.getElementsByTagName("PRIMITIVE")[0]) {
         json.SUBINDEX.text = json.SUBINDEX.text.replace(" (\\textit{ns})", "");
        }
    },

    //todo
    LATEXINLINE: (node,json) => {
        json["text"] += `LATEX: ${node.firstChild.nodeValue}`;
    },  
};

export const parseAndInsertToIndexTrie = (node, json) => {
    parseIndexSearchEntryTo(node, json);
    insert(json.text, json, indexTrie);
}

export const parseAndInsertToIdToContentMap = (json,chapterIndex, idStack = []) => {
    if(Array.isArray(json)) {
        for (let i = 0; i < json.length; i++) {
        parseAndInsertToIdToContentMap(json[i],chapterIndex,idStack);
        }
        return;
    }

    if(json.id) {
        const id = chapterIndex + json.id;
        idStack.push(id);
        idToContentMap[id] = "";
    }
    if(json.body) {
        idToContentMap[idStack[idStack.length-1]] += json.body;
    }
    if(json.child) {
        parseAndInsertToIdToContentMap(json.child,chapterIndex,idStack);
    }
    if(json.id) {
        idStack.pop();
    }
}

const buildTextTrie = () => {
    for (const [key, value] of Object.entries(idToContentMap)) {
        const words = value.trim().replace(/\s+/g," ").toLowerCase().replace(/\n/gi, "").split(" ").filter(a => a != "" && a != '\"');
        for (const word of words) {
            insert(word, key, textTrie);
        }
    }
}

export const writeRewritedSearchData = () => {
    buildTextTrie();

    const searchData = {indexTrie, textTrie, idToContentMap};
    fs.writeFile("json/rewritedSearchData.json", JSON.stringify(searchData), (err) => {
        if (err) {
            console.log(err);
        }
    });
}


