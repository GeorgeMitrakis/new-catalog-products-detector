
import moment from "moment";
import { DEFAULT_TIME_INTERVAL } from "./app/const";
import type { ICatalog, IProduct } from "./app/model";
import {  getNewEntries, isWithinFunctioningHours } from "./app/utils";
import { TargetsSet, type ICatalogPageSelectors, type ITarget, type ITargetCatalog } from "./app/targets";
import { crawlCatalog } from "./app/crawler";
import { NotificationsHandler } from "./app/notifications";



async function run(){    
    // if(!isWithinFunctioningHours()){
    //     console.log("Outside functioning hours. Skipping.")
    //     return;
    // }

    const targets = await new TargetsSet().init();
    
    for (const target of targets) {
        await handleTarget(target);
    }
}

async function handleTarget(target: ITarget){

    const notificationsHandler = new NotificationsHandler(target.telegram.botToken, target.telegram.chatId);

    for (const catalog of target.catalogs) {
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
                        const date = moment().format("YYYY-MM-DD");
                        const time = moment().format("HH:mm");
                
                
                        console.log(JSON.stringify(newEntries, null, 4));
                        await logToFile(newEntries, date, time);
    
                        let message = `${catalog.url}\n`;
    
                        for (const newEntry of newEntries) {
                            message += `    ${newEntry.name}\n`;
                            message += `    ${newEntry.price}\n`;
                            message += `    ${newEntry.link}\n\n`;
                        }
    
    
                        await notificationsHandler.send(message);
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

        console.log(`Interval #${interval} for ${catalog.url} has started. Duration: ${intervalDurationInMinutes} minutes.`)
    }

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

run();