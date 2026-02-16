import fs from "fs/promises";
import {JSDOM} from "jsdom";
import { title } from "process";

const dataContent = await fs.readFile("../data/raw/document.json", "utf-8");
const pages = JSON.parse(dataContent);
const invertedIndex = {};

for (let i = 0; i < pages.length; i++){
    const dom = new JSDOM(pages[i].html);
    const document = dom.window.document;
    const pageID = i;

    document.querySelectorAll("script, style, nav, footer").forEach(el => el.remove());

    let pureText = "";
    for (const el of document.querySelectorAll("p, h1, h2, h3, li")){
        pureText += (el?.textContent ?? "") + " "; // vrací text uvnitř elementu bez html tagů
    }

    pureText = pureText.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "");

    const words = pureText.match(/\p{L}+/gu) ?? [];

    const wordFrequency = {};
    for(let word of words){
        if(wordFrequency[word]){
            wordFrequency[word]++;
        } else{
            wordFrequency[word] = 1;
        }
    }

    for(let word in wordFrequency){
        let tf = wordFrequency[word] / words.length;

        if(!invertedIndex[word]){
            invertedIndex[word] = [];
        }        

        invertedIndex[word].push({pageId: pageID, tf: tf});
    }
    
    }
    for(let term in invertedIndex){
        let idf = Math.log(pages.length / invertedIndex[term].length);
        
        for (let page of invertedIndex[term]) {
            page.tfidf = page.tf * idf;
            delete page.tf;
        }
    }
    console.log(invertedIndex);

    await fs.writeFile(
        "../data/raw/inverted-index.json",
        JSON.stringify(invertedIndex, null, 2), 
        "utf-8");