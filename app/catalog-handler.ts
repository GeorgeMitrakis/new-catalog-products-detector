import moment from "moment";
import { crawlCatalog } from "./crawler";
import type { IProduct } from "./model";
import type { ITarget, ITargetCatalog } from "./targets";
import { getArrayWithoutElem } from "./utils";
import { DataStorageManager } from "./data-storage-manager";

export async function handleCatalog(target: ITarget, catalog: ITargetCatalog, newEntriesFoundCallback: Function){
    const intervalDurationInMinutes = 60 / catalog.requestsPerHour;
    const _dataStorageManager = new DataStorageManager(target.name, catalog.name);

    let previousCatalog: IProduct[] = await _dataStorageManager.loadCatalog();
    let intervalIteration = 0;
    let iterationsRunning: number[] = [];
    
    const interval = setInterval(
        async () => {
            try {
                intervalIteration++;

                console.log(`Interval #${interval}, Iteration #${intervalIteration}`);

                if(iterationsRunning.length){
                    throw new Error("Another iteration is already running.");
                }

                iterationsRunning.push(intervalIteration);

                if(!isWithinFunctioningHours()){
                    throw new Error("Outside functioning hours. Skipping.");
                }

                console.time(`crawling_timer_${interval}_${intervalIteration}`);
                const newCatalog = await crawlCatalog(catalog, target.catalogPageSelectors, target.origin, target.useProxy);
                console.timeEnd(`crawling_timer_${interval}_${intervalIteration}`);

                const newEntries = getNewEntries(previousCatalog, newCatalog);
                
                if(newEntries.length > 0){
                    await newEntriesFoundCallback(newEntries);
                }

                previousCatalog = newCatalog;
                await _dataStorageManager.storeCatalog(newCatalog);
            } catch (error) {
                console.log(error);
            } finally {
                iterationsRunning = getArrayWithoutElem(intervalIteration, iterationsRunning);
            }
        }, 
        intervalDurationInMinutes * 60 * 1000
    )

    console.log(`Interval #${interval} for ${catalog.url} has been set. Duration: ${intervalDurationInMinutes} minutes.`)
}

function getNewEntries(source: IProduct[], target: IProduct[]) {
    const sourceLinks = source.map((product) => product.link);
    const targetLinks = target.map((product) => product.link);

    const newLinks = targetLinks.filter((link) => !sourceLinks.includes(link));

    return target.filter(product => newLinks.includes(product.link));
}

function isWithinFunctioningHours(){
    const now = moment();

    return (
        now.diff(moment().set("hour", 7).set("minute", 0), "minutes") >= 0 && 
        now.diff(moment().set("hour", 23).set("minute", 0), "minutes") <= 0
    );
}