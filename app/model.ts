export interface IProduct {
    name: string;
    price: string;
    link: string;
    characteristics?: Object;
}

export interface ICatalog {
    products: IProduct[];
}