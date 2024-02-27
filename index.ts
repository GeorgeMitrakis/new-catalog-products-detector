
import { DEFAULT_TIME_INTERVAL } from "./app/const";
import type { ICatalog, IProduct } from "./app/model";
import { createCatalogObject, getCatalogPage } from "./app/utils";

const origin = "https://www.spitogatos.gr"
const url = `${origin}/pwliseis-katoikies/athina-voreia-proastia/timi_eos-200000/emvado_apo-65`;

const productSelector = "article";
const productTitleSelector = ".tile__title";
const productPriceSelector = ".price__text";
const productPathnameSelector = ".tile__content  a.tile__link";

// const searchInterval = setInterval(run, DEFAULT_TIME_INTERVAL * 60 * 1000);

async function run(){
    const catalogPageHtml = await getCatalogPage(url);
    // const catalogPageHtml = await Bun.file('./test.html').text();

    if(!catalogPageHtml){
        return;
    }

    if(!await Bun.file('./catalog.json').exists()){
        await Bun.write('./catalog.json', '[]');
    }
    const previousCatalog = JSON.parse(await Bun.file('./catalog.json').text());

    // const catalogPage = createElementFromHTML(catalogPageHtml);
    const newCatalog = createCatalogObject({
        catalogPageHtml,
        origin,
        productSelector,
        productTitleSelector,
        productPriceSelector,
        productPathnameSelector
    })

    // const newCatalog = JSON.parse(await Bun.file('./catalog.json').text());

    console.log(JSON.stringify(getNewEntries(previousCatalog, newCatalog), null, 4));

    await Bun.write('./catalog.json', JSON.stringify(newCatalog, null, 4));
    await Bun.write('./catalog.html', catalogPageHtml);
}

await run();

function getNewEntries(source: IProduct[], target: IProduct[]) {
    const sourceLinks = source.map((product) => product.link);
    const targetLinks = target.map((product) => product.link);

    const newLinks = targetLinks.filter((link) => !sourceLinks.includes(link));

    return target.filter(product => newLinks.includes(product.link));
}