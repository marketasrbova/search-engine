import {JSDOM} from "jsdom";
import fs from "fs/promises";

const baseUrl = "https://www.ox.ac.uk";
const urlsToCrawl = [baseUrl];
const visited = new Set(); // každá hodnota v něm může být pouze jednou
const maxCrawl = 40;
const rawData = [];

function normalizeUrl(urlString){
    const urlObj = new URL(urlString);
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
    if(hostPath.endsWith("/")){
        return hostPath.slice(0, -1);
    }
    return hostPath;
}


const crawl = async () => {
    for (let i = 0; i < maxCrawl && urlsToCrawl.length > 0; i++) {
        const currentUrl = urlsToCrawl.shift(); // vezme první z urlsToCrawl a zároveň ji vymaže
        const normalizedUrl = normalizeUrl(currentUrl);

        if (visited.has(normalizedUrl)) continue; //vrací true / false, continue znamená přeskoč a jdi na další iteraci
        visited.add(normalizedUrl);

        const response = await fetch(currentUrl);
        const htmlBody = await response.text(); // převádí tělíčko na string
        
        rawData.push({
            url: currentUrl,
            html: htmlBody
        });

        const dom = new JSDOM(htmlBody);
        const document = dom.window.document;

        const links = [...document.querySelectorAll("a")].map(a=>a.getAttribute("href")) //vrátí přesně to, co je v atributu
        .filter(Boolean) // odstraní prázdné hodnoty
        .map(link => {
            try{
                return new URL(link, currentUrl).href; // URL(url, base), pokud url je absolutní, base se ignoruje
            } catch{
                return null;
            }
        }).filter(Boolean);
        

        urlsToCrawl.push(...links);
        //console.log(urlsToCrawl);    
    }

    await fs.writeFile(
        "../data/raw/document.json",
        JSON.stringify(rawData, null, 2), // null: data se nijak specificky netransformují, 2: odsazení pro čitelnost JSONu
        "utf-8");
}
crawl();