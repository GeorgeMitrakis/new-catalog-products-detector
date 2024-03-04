import type { IProduct } from "./model";
import settings from "./settings";
import type { ICatalogPageSelectors, ITargetCatalog } from "./targets";
import jsdom from "jsdom";
const { JSDOM } = jsdom;


export async function crawlCatalog(catalog: ITargetCatalog, selectors: ICatalogPageSelectors, origin: string, useProxy: boolean) {
    const catalogPageHtml = await getCatalogPage(catalog.url, useProxy);
    // const catalogPageHtml = await Bun.file('./test.html').text();

    if(!catalogPageHtml){
        return [];
    }

    // if(!await Bun.file('./fixtures/catalog.json').exists()){
    //     await Bun.write('./fixtures/catalog.json', '[]');
    // }

    // previousCatalog = JSON.parse(await Bun.file('./fixtures/catalog.json').text());

    // const newCatalog = createCatalogObject(catalogPageHtml, origin, selectors);
    return createCatalogObject(catalogPageHtml, origin, selectors);

    // const newCatalog = JSON.parse(await Bun.file('./catalog.json').text());
    // previousCatalog = newCatalog;

    // await Bun.write('./fixtures/catalog.json', JSON.stringify(newCatalog, null, 4));
    // await Bun.write('./fixtures/catalog.html', catalogPageHtml);

    // return getNewEntries(previousCatalog, newCatalog);
}


async function getCatalogPage(url: string, useProxy: boolean = false): Promise<string|null> {

    const { protocol, host, username, password } = settings.getSettings().proxy;

    let fetchOptions: FetchRequestInit = { verbose: true };

    if(useProxy){
        fetchOptions = { ...fetchOptions, proxy: `${protocol}://${username}:${password}@${host}` };
    }

    const response = await fetch(url, fetchOptions);

    if(!response.ok){
        console.error(response.status);
        return '';
    }

    const html = await response.text(); // HTML string

    return html;
}


function createCatalogObject( catalogPageHtml: string, origin: string, selectors: ICatalogPageSelectors){
    const dom = new JSDOM(catalogPageHtml);
    const document = dom.window.document;

    const productsElements = document.querySelectorAll<HTMLElement>(selectors.product);

    const products : IProduct[] = Array.from(productsElements).map((productElem) => {
        const title = productElem.querySelector(selectors.productTitle)?.textContent || "";
        const price = productElem.querySelector(selectors.productPrice)?.textContent || "";
        const pathname = productElem.querySelector(selectors.productPathname)?.getAttribute("href") || "";
        
        return {
            name: title,
            price,
            link: `${origin}${pathname}`,
        }
    });

    return products;
}
