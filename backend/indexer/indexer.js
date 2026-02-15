import fs from "fs/promises";
import {JSDOM} from "jsdom";
import { title } from "process";

const dataContent = await fs.readFile("../data/raw/document.json", "utf-8");
const pages = JSON.parse(dataContent);

for (let i = 0; i < pages.length; i++){
    const dom = new JSDOM(pages[i].html);
    const document = dom.window.document;
    const pageID = i;

    document.querySelectorAll("script, style, nav, footer").forEach(el => el.remove());

    let pureText = "";
    for (const el of document.querySelectorAll("p, h1, h2, h3, li")){
        pureText += el?.textContent ?? "" + " "; // vrací text uvnitř elementu bez html tagů
    }
    console.log(pureText);

    pureText = pureText.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "");
    console.log(pureText);

    const words = pureText.match(/\p{L}+/gu);
    console.log(words);

    const wordFrequency = {};
    for(let word of words){
        if(wordFrequency[word]){
            wordFrequency[word]++;
        } else{
            wordFrequency[word] = 1;
        }
    }
    console.log(wordFrequency);

    const invertedIndex = {};

    for(let term in wordFrequency){
        let tf = wordFrequency[term] / words.length;

        if(!invertedIndex[term]){
            invertedIndex[term] = [];
        }        

        invertedIndex[term].push({pageId: pageID, tf: tf});
    }

    console.log(invertedIndex);
}