import type { IProduct } from "./model";
import settings from "./settings";
import type { ICatalogPageSelectors, ITargetCatalog } from "./targets";
import jsdom from "jsdom";
const { JSDOM } = jsdom;


export async function crawlCatalog(catalog: ITargetCatalog, selectors: ICatalogPageSelectors, origin: string, useProxy: boolean) {
    const catalogPageHtml = await getCatalogPage(catalog.url, useProxy);

    if(!catalogPageHtml){
        throw new Error("Empty page");
    }

    return createCatalogObject(catalogPageHtml, origin, selectors);
}


async function getCatalogPage(url: string, useProxy: boolean = false): Promise<string|null> {

    const { protocol, host, username, password } = settings.getSettings().proxy;

    let fetchOptions: FetchRequestInit = { verbose: true };

    if(useProxy){
        fetchOptions = { ...fetchOptions, proxy: `${protocol}://${username}:${password}@${host}` };
    }

    const response = await fetch(url, fetchOptions);

    if(!response.ok){
        throw new Error(response.statusText);
    }

    const html = await response.text(); // HTML string

    return html;
}


function createCatalogObject( catalogPageHtml: string, origin: string, selectors: ICatalogPageSelectors){
    const dom = new JSDOM(catalogPageHtml);
    const document = dom.window.document;

    const catalogName = document.querySelector(selectors.catalog)?.textContent || "";

    const productsElements = document.querySelectorAll<HTMLElement>(selectors.product);

    const products : IProduct[] = Array.from(productsElements).map((productElem) => {
        const name = productElem.querySelector(selectors.productTitle)?.textContent || "";
        const price = productElem.querySelector(selectors.productPrice)?.textContent || "";
        const pathname = productElem.querySelector(selectors.productPathname)?.getAttribute("href") || "";
        
        return {
            name,
            price,
            link: `${origin}${pathname}`,
            catalogName
        }
    });

    return products;
}
