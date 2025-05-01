// maximum permissible concurrent translations
const max_trans_num = Number(process.env.MAX_TRANSLATION_NO) || 5;

// log file configs
const translationSummaryPrefix = "translation-summary";
const jsonSummaryPrefix = "json-summary";

export {max_trans_num, translationSummaryPrefix, jsonSummaryPrefix}