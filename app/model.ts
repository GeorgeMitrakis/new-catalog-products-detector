export interface IProduct {
    catalogName: string;
    name: string;
    price: string;
    link: string;
    characteristics?: Object;
}

export interface ICatalog {
    products: IProduct[];
}