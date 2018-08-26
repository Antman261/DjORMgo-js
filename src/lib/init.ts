export interface IClient {
    query(query: string, params: Array<string | number | boolean>): Array<any>;
}

type initOptions = {
    client: IClient;
}
export let defaultClient: any; // pg,

export const initOrm = ({client}: initOptions) => {
    defaultClient = client;
};

