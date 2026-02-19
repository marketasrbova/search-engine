import fs from "fs/promises";
import {JSDOM} from "jsdom";

const invertedIndex = await fs.readFile("./data/clean/inverted-index.json", "utf-8");
const index = JSON.parse(invertedIndex);

function magnitude(index){
    const pageMagnitudes = {};

    for(const term in index){
        for(const {pageId, tfidf} of index[term]){
            pageMagnitudes[pageId] = (pageMagnitudes[pageId] ?? 0) + tfidf * tfidf;
        }
    }
    for(const id in pageMagnitudes){ 
            pageMagnitudes[id] = Math.sqrt(pageMagnitudes[id]); // velikost vektoru stránky |u|
    }
    return pageMagnitudes;
}
const pageMagnitudes = magnitude(index);


function createQueryVector(query){
    const words = query.toLowerCase().split(/\W+/).filter(Boolean);
    const wordCount = {};
    for (let word of words){
        wordCount[word] = (wordCount[word] || 0) + 1;
    }
    const totalWords = words.length;
    const queryVector = {};
    for(let word in wordCount){
        queryVector[word] = (wordCount[word] / totalWords); // tf?
    }
    return queryVector;
}


function search(index, pageMagnitudes, query){
    const queryVector = createQueryVector(query);
    const cosineSimilarity = {};
    let queryMagnitude = 0;

    for(const term in queryVector){
        const queryWeight = queryVector[term];
        queryMagnitude += queryWeight * queryWeight; 

        const terms = index[term] ?? [];

        for (const {pageId, url, tfidf} of terms){
            if(!cosineSimilarity[pageId]){
                cosineSimilarity[pageId] = {url, score: 0};
            }
            cosineSimilarity[pageId].score += tfidf * queryWeight; // vektor stránky * velikost vektoru dotazu = dotProduct
        }
    }

    queryMagnitude = Math.sqrt(queryMagnitude); // velikost vektoru dotazu |v|, po tom, co se započítají všechna slova dotazu

    for(const pageId in cosineSimilarity){ // score = (A · B) / (|A| × |B|)
        cosineSimilarity[pageId].score /= pageMagnitudes[pageId] * queryMagnitude; // dotproduct/ (velikost vektoru stránky * velikost vektoru dotazu)
    }

    return Object.values(cosineSimilarity).sort((a, b) => b.score - a.score);
}

export function searchPages(query){
    console.log("dotaz: ", query , "index:", search(index, pageMagnitudes, query))
    return search(index, pageMagnitudes, query);
}
