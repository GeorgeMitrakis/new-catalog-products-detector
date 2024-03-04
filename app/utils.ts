import settings from "./settings";
import type { IProduct } from "./model";
import jsdom from "jsdom";
import moment from "moment";
import type { ICatalogPageSelectors } from "./targets";
const { JSDOM } = jsdom;



export function isWithinFunctioningHours(){
    const now = moment();

    return (
        now.diff(moment().set("hour", 9).set("minute", 0), "minutes") >= 0 && 
        now.diff(moment().set("hour", 21).set("minute", 0), "minutes") <= 0
    );
}

export function getNewEntries(source: IProduct[], target: IProduct[]) {
    const sourceLinks = source.map((product) => product.link);
    const targetLinks = target.map((product) => product.link);

    const newLinks = targetLinks.filter((link) => !sourceLinks.includes(link));

    return target.filter(product => newLinks.includes(product.link));
}