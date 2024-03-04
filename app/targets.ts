import { Glob } from "bun";

export interface ITargetCatalog {
    url : string,
    requestsPerHour : number
}

export interface ICatalogPageSelectors {
    product : string,
    productTitle : string,
    productPrice : string,
    productPathname : string
}

export interface ITarget {
    origin : string,
    catalogs : ITargetCatalog[],
    useProxy : boolean,
    catalogPageSelectors: ICatalogPageSelectors,
    telegram : {
        botToken: string,
        chatId: string | number
    }
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



