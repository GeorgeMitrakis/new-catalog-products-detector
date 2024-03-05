import moment from "moment";
import { crawlCatalog } from "./crawler";
import type { IProduct } from "./model";
import type { ITarget, ITargetCatalog } from "./targets";

export function handleCatalog(target: ITarget, catalog: ITargetCatalog, newEntriesFoundCallback: Function){
    const intervalDurationInMinutes = 60 / catalog.requestsPerHour;
    let previousCatalog: IProduct[] = [];
    let intervalIteration = 0;
    let iterationRunning = false;
    
    const interval = setInterval(
        async () => {
            try {
                intervalIteration++;

                console.log(`Interval #${interval}, Iteration #${intervalIteration}`);

                if(iterationRunning){
                    throw new Error("Another iteration is already running.");
                }

                iterationRunning = true;

                if(!isWithinFunctioningHours()){
                    throw new Error("Outside functioning hours. Skipping.");
                }

                console.time(`crawling_timer_${interval}_${intervalIteration}`);
                const newCatalog = await crawlCatalog(catalog, target.catalogPageSelectors, target.origin, target.useProxy);
                console.timeEnd(`crawling_timer_${interval}_${intervalIteration}`);

                const newEntries = getNewEntries(previousCatalog, newCatalog);
                
                if(previousCatalog.length > 0 && newEntries.length > 0){
                    await newEntriesFoundCallback(newEntries);
                }

                previousCatalog = newCatalog;
            } catch (error) {
                console.log(error);
            } finally {
                iterationRunning = false;
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
        now.diff(moment().set("hour", 9).set("minute", 0), "minutes") >= 0 && 
        now.diff(moment().set("hour", 21).set("minute", 0), "minutes") <= 0
    );
}