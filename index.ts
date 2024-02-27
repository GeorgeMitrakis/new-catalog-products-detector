
import moment from "moment";
import { DEFAULT_TIME_INTERVAL } from "./app/const";
import type { ICatalog, IProduct } from "./app/model";
import { createCatalogObject, getCatalogPage, isWithinFunctioningHours } from "./app/utils";

const origin = "https://www.spitogatos.gr"
const url = `${origin}/pwliseis-katoikies/athina-voreia-proastia/timi_eos-200000/emvado_apo-65`;

const productSelector = "article";
const productTitleSelector = ".tile__title";
const productPriceSelector = ".price__text";
const productPathnameSelector = ".tile__content  a.tile__link";

let previousCatalog: IProduct[] = [];

async function run(){    
    if(!isWithinFunctioningHours()){
        console.log("Outside functioning hours. Skipping.")
        return;
    }

    const newEntries = await crawlCatalog();

    if(newEntries.length > 0){
        const date = moment().format("YYYY-MM-DD");
        const time = moment().format("HH:mm");


        console.log(JSON.stringify(newEntries, null, 4));
        logToFile(newEntries, date, time);
    }
}

async function crawlCatalog() {
    const catalogPageHtml = await getCatalogPage(url);
    // const catalogPageHtml = await Bun.file('./test.html').text();

    if(!catalogPageHtml){
        return [];
    }

    // if(!await Bun.file('./fixtures/catalog.json').exists()){
    //     await Bun.write('./fixtures/catalog.json', '[]');
    // }

    // previousCatalog = JSON.parse(await Bun.file('./fixtures/catalog.json').text());

    const newCatalog = createCatalogObject({
        catalogPageHtml,
        origin,
        productSelector,
        productTitleSelector,
        productPriceSelector,
        productPathnameSelector
    })

    // const newCatalog = JSON.parse(await Bun.file('./catalog.json').text());
    previousCatalog = newCatalog;

    // await Bun.write('./fixtures/catalog.json', JSON.stringify(newCatalog, null, 4));
    // await Bun.write('./fixtures/catalog.html', catalogPageHtml);

    return getNewEntries(previousCatalog, newCatalog);
}

function getNewEntries(source: IProduct[], target: IProduct[]) {
    const sourceLinks = source.map((product) => product.link);
    const targetLinks = target.map((product) => product.link);

    const newLinks = targetLinks.filter((link) => !sourceLinks.includes(link));

    return target.filter(product => newLinks.includes(product.link));
}

async function logToFile(products: IProduct[], filename: string, heading: string) {
    const file = Bun.file(`./logfiles/${filename}.txt`);
    const writer = file.writer();

    writer.write(`${heading}\n\n`);

    for (const product of products) {
        writer.write(`${product.name}\n`);
        writer.write(`${product.price}\n`);
        writer.write(`${product.link}\n\n`);
    }

    writer.end();
}


const searchInterval = setInterval(run, DEFAULT_TIME_INTERVAL * 1000);
run();