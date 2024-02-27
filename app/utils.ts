import { Settings } from "./settings";
import type { IProduct } from "./model";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export async function getCatalogPage(url: string): Promise<string|null> {

    const { protocol, host, username, password } = new Settings().getSettings().proxySettings;

    const response = await fetch(url, {
        proxy: `${protocol}://${username}:${password}@${host}`,
        verbose: true
    });

    if(!response.ok){
        console.error(response.status);
        return '';
    }

    const html = await response.text(); // HTML string

    return html;
}


export function createCatalogObject({
    catalogPageHtml,
    origin,
    productSelector,
    productTitleSelector,
    productPriceSelector,
    productPathnameSelector
}:{
    catalogPageHtml: string,
    origin: string,
    productSelector: string,
    productTitleSelector : string,
    productPriceSelector : string,
    productPathnameSelector : string
}){
    const dom = new JSDOM(catalogPageHtml);
    const document = dom.window.document;

    const productsElements = document.querySelectorAll<HTMLElement>(productSelector);

    const products : IProduct[] = Array.from(productsElements).map((productElem) => {
        const title = productElem.querySelector(productTitleSelector)?.textContent || "";
        const price = productElem.querySelector(productPriceSelector)?.textContent || "";
        const pathname = productElem.querySelector(productPathnameSelector)?.getAttribute("href") || "";
        
        return {
            name: title,
            price,
            link: `${origin}${pathname}`,
        }
    });

    return products;
}