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
    let messageList = ``;

    // catalog name remains the same for each entry
    let messageEmojiHtml = "";
    if(!!catalog.productEmoji && !!catalog.productEmojiId){
        messageEmojiHtml = `<tg-emoji emoji-id="4909228789914927963">🏠</tg-emoji> `;
    }

    for (const newEntry of newEntries) {
        messageList += `\n${messageEmojiHtml || "-"}  ${newEntry.name}, ${newEntry.price}: <a href="${newEntry.link}">${newEntry.link}</a>\n`;
    }

    let messageTitle = `<strong>${newEntries[0].catalogName}</strong>`;

    let message = `${messageTitle} (<a href="${catalog.url}">link</a>)\n${messageList}`

    await notificationsHandler.send(message);
}

run();