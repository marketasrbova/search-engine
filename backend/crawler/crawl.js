import {JSDOM} from "jsdom";
import fs from "fs/promises";

const baseUrl = "https://www.cam.ac.uk";
const urlsToCrawl = [baseUrl];
const toCrawlOnPage = [];
const visited = new Set(); // každá hodnota v něm může být pouze jednou
const maxCrawl = 200;
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
        let currentUrl = urlsToCrawl.shift() ?? toCrawlOnPage.shift(); // vezme první z urlsToCrawl a zároveň ji vymaže
        if(!currentUrl){
            break;
        }

        const normalizedUrl = normalizeUrl(currentUrl);
        if (visited.has(normalizedUrl)) continue; //vrací true / false, continue znamená přeskoč a jdi na další iteraci
        visited.add(normalizedUrl);

        let htmlBody = null;
        try {
            const response = await fetch(currentUrl);
            if (!response.ok) continue;

            htmlBody = await response.text();// převádí tělíčko na string
        } catch (err) {
            console.log("Failed to fetch:", currentUrl);
            continue;
        }
        
        rawData.push({
            url: currentUrl,
            html: htmlBody
        });

        const dom = new JSDOM(htmlBody);
        const document = dom.window.document;

        console.log([...document.querySelectorAll("a")].map(a => a.getAttribute("href")));

        const currentOrigin = new URL(currentUrl).origin;
        const links = [...document.querySelectorAll("a")].map(a=>a.getAttribute("href")) //vrátí přesně to, co je v atributu
        .filter(Boolean) // odstraní prázdné hodnoty
        .map(link => {
            try{
                return new URL(link, currentUrl).href; // URL(url, base), pokud url je absolutní, base se ignoruje
            } catch{
                return null;
            }
        }).filter(Boolean);
        console.log("linky: ", links)

        for(const link of links){
            const linkOrigin = new URL(link).origin;
            if(linkOrigin === currentOrigin){
                toCrawlOnPage.push(link);
            }else{
                urlsToCrawl.push(link);
            }
        }
        //console.log("on outer: ", urlsToCrawl, "on the page: ", toCrawlOnPage);    
    }

    await fs.writeFile(
        "../data/raw/document.json",
        JSON.stringify(rawData, null, 2), // null: data se nijak specificky netransformují, 2: odsazení pro čitelnost JSONu
        "utf-8");
}
crawl();