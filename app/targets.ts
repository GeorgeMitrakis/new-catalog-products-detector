import { Glob } from "bun";

export interface ITargetCatalog {
    name: string;
    url : string;
    requestsPerHour : number;
    productEmoji: string;
    productEmojiId: string;
    chatId: string | number;
}

export interface ICatalogPageSelectors {
    catalog: string;
    product : string;
    productTitle : string;
    productPrice : string;
    productHref : string;
}

export interface ITarget {
    name: string;
    origin : string;
    catalogs : ITargetCatalog[];
    useProxy : boolean;
    catalogPageSelectors: ICatalogPageSelectors;
    telegram : {
        botToken: string
    };
}

const targetsPath = 'targets/';

export class TargetsSet {
    targets: ITarget[] = [];

    async init(){
        const glob = new Glob(`${targetsPath}/*`);

        for (const targetFile of glob.scanSync(".")) {
            const targetName = targetFile.replace(targetsPath, "").replace(".json", "");
            
            if(targetName === "example"){
                continue;
            }
            
            this.targets.push(await Bun.file(targetFile).json());
        }

        return this.targets;
    }
}



