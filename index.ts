import type { IProduct } from "./app/model";
import { TargetsSet, type ITarget, type ITargetCatalog } from "./app/targets";
import { NotificationsHandler } from "./app/notifications";
import { handleCatalog } from "./app/catalog-handler";

async function run(){
    const targets = await new TargetsSet().init();
    
    for (const target of targets) {
        await handleTarget(target);
    }
}

async function handleTarget(target: ITarget){

    const notificationsHandler = new NotificationsHandler(target.telegram.botToken, target.telegram.chatId);

    for (const catalog of target.catalogs) {
        await handleCatalog(
            target, 
            catalog, 
            async (newEntries: IProduct[]) => {
                console.log(JSON.stringify(newEntries, null, 4));
                await notifyAboutNewEntries(catalog, newEntries, notificationsHandler);
            }
        )
    }
}

async function notifyAboutNewEntries(catalog:ITargetCatalog, newEntries: IProduct[], notificationsHandler: NotificationsHandler){
    let message = `${catalog.url}\n`;

    for (const newEntry of newEntries) {
        message += `    ${newEntry.name}\n`;
        message += `    ${newEntry.price}\n`;
        message += `    ${newEntry.link}\n\n`;
    }

    await notificationsHandler.send(message);
}

run();