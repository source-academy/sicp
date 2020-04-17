import {
  repeatedRefNameWarning,
  missingReferenceWarning
} from "./warnings.js";
import { allFilepath, tableOfContent } from "../index.js";
import { tagsToRemove, toIndexFolder, recursiveProcessTextHtml, processTextHtml } from '../parseXmlHtml';
import { getChildrenByTagName, ancestorHasTag } from '../utilityFunctions';

export const referenceStore = {};

let chapter_number = 0;
let subsubsection_count;
let fig_count;
let foot_count;
let ex_count;
let unlabeledEx = 0;

const ifIgnore = (node) => {
	let ifIgnore = false;
	tagsToRemove.forEach(
		tag => {
			if (ancestorHasTag(node, tag)) { ifIgnore = true; };
		});
	return ifIgnore;
}

export const setupReferences = (node, filename) => {

	const chapArrIndex = allFilepath.indexOf(filename);
	const chapterIndex = tableOfContent[filename].index;

	subsubsection_count = 0;
	foot_count = 0;
	if (chapter_number != chapterIndex.substring(0,1)) {
		chapter_number = chapterIndex.substring(0,1);
		fig_count = 0;
		ex_count = 0;
	}
	//console.log("setting up " + chapterIndex);
	const labels = node.getElementsByTagName("LABEL");
	
	for (let i = 0; labels[i]; i++) {

		const label = labels[i];
		const referenceName = label.getAttribute("NAME");
		const ref_type = referenceName.split(":")[0];
		//const ref_name = referenceName.split(":")[1];
		
		if (ifIgnore(label)) { continue; }
		//console.log(referenceName + " processed");

      	if (referenceStore[referenceName]) {
			console.log(chapterIndex);
        	repeatedRefNameWarning(referenceName);
        	continue;
		}

		let href;
		let displayName;
		if (ref_type == "sec") {
			if (ancestorHasTag(label, "SUBSUBSECTION")) {
				subsubsection_count++;
				displayName = `${chapterIndex}.${subsubsection_count}`;
				href = `${chapterIndex}.html#sec${chapterIndex}.${subsubsection_count}`;
			} else {
				displayName = chapterIndex;
				href = `${chapterIndex}.html`;
			}
		
		} else if (ref_type == "fig") {
			fig_count++;
			displayName = `${chapter_number}.${fig_count}`;
			href = `${chapterIndex}.html#fig_${displayName}`;
	
		} else if (ref_type == "foot") {
			foot_count++;
			displayName = foot_count;
			href = `${chapterIndex}.html#footnote-${foot_count}`;
		
		} else { continue; }

		//console.log(referenceName + " added");
	    referenceStore[referenceName] = { href, displayName, chapterIndex };
	}
	
	// set up exercise references separately
	// account for unlabeled exercises
	const exercises = node.getElementsByTagName("EXERCISE");
	for (let i = 0; exercises[i]; i++) {
		const exercise = exercises[i];

		if (ifIgnore(exercise)) { continue; }

		const label  = exercise.getElementsByTagName("LABEL")[0];
		let referenceName;
		let ref_type;
		if (!label) {
			//unlabelled exercise
			unlabeledEx ++;
			referenceName = "ex:unlabeled" + unlabeledEx;
			ref_type = referenceName.split(":")[0];
    		
		} else {
			referenceName = label.getAttribute("NAME");
			ref_type = referenceName.split(":")[0];
		}

		if (ref_type != "ex") {continue;}

		if (referenceStore[referenceName]) {
			console.log(chapterIndex);
        	repeatedRefNameWarning(referenceName);
        	continue;
		}

		ex_count ++;
		const displayName = `${chapter_number}.${ex_count}`;
		const href = `${chapterIndex}.html#ex_${displayName}`;
		//console.log(referenceName + " added");
		referenceStore[referenceName] = { href, displayName, chapterIndex };
	}
}

export const processReferenceHtml = (node, writeTo, chapterIndex) => {
	const referenceName = node.getAttribute("NAME");
	if (!referenceStore[referenceName]) {
		missingReferenceWarning(referenceName);
		return;
	}

	const href = referenceStore[referenceName].href;
	const displayName = referenceStore[referenceName].displayName;
	const ref_type = referenceName.split(":")[0];

	writeTo.push(`<REF NAME="${referenceName}">`);

	if (ref_type == "sec") {
		writeTo.push(`<a class="superscript" id="${chapterIndex}-sec-link-${displayName}" href="./${href}">${displayName}</a></REF>`);
	} else if (ref_type == "fig") {
		writeTo.push(`<a class="superscript" id="${chapterIndex}-fig-link-${displayName}" href="./${href}">${displayName}</a></REF>`);
	} else if (ref_type == "ex") {
		writeTo.push(`<a class="superscript" id="${chapterIndex}-ex-link-${displayName}" href="./${href}">${displayName}</a></REF>`);
	} else if (ref_type == "foot") {
		writeTo.push(`<a class="superscript" id="${chapterIndex}-foot-link-${displayName}" href="./${href}">${displayName}</a></REF>`);

	}
}

export default processReferenceHtml;
