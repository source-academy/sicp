// maximum permissible concurrent translations
export const max_trans_num = Number(process.env.MAX_TRANSLATION_NO) || 5;

// log file configs
export const translationSummaryPrefix: string = "translation-summary";
export const jsonSummaryPrefix: string = "json-summary";
export const ignoredTags: string[] = [
    "LATEXINLINE",
    "LATEX",
    "SNIPPET",
    "SCHEMEINLINE",
    "SCHEME",
    "LONG_PAGE",
    "LABEL",
    "HISTORY",
    "REF",
    "FIGURE",
];
export const max_chunk_len: Number = Number(process.env.MAX_LEN) || 3000;