import type { BunFile } from "bun";
import type { IProduct } from "./model";
import { STORED_CATALOGS_PATH } from "./const";

export class DataStorageManager {
    private _catalogsFile: BunFile;

    constructor(targetName: string, catalogName: string){
       const catalogsDataPath = `${STORED_CATALOGS_PATH}/${targetName}/${catalogName}.json`;

       this._catalogsFile = Bun.file(catalogsDataPath);
    }

    /**
     * Read catalog from disk.
     */
    async loadCatalog(){
        if(!(await this._catalogsFile.exists())){
            return [];
        }

        return await this._catalogsFile.json();
    }


    /**
     * Write catalog to disk.
     */
    async storeCatalog(catalog: IProduct[]){
        return await Bun.write(this._catalogsFile, JSON.stringify(catalog, null, 4));
    }
}