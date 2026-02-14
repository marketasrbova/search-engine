import {JSDOM} from "jsdom";

const baseUrl = "https://ssps.cz";
const urlsToCrawl = [baseUrl];
const visited = new Set(); // každá hodnota v něm může být pouze jednou
const maxCrawl = 4;

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
        console.log(urlsToCrawl);    
    }
}
crawl();