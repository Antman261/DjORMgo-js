export interface Client {
    query(query: string, params: Array<string | number | boolean | Date>): [any];
    raw(query: string, params: Array<string | number | boolean | Date>): [any];
}

type initOptions = {
    client: Client;
}
export let defaultClient: any; // pg,

export const initOrm = ({client}: initOptions) => {
    defaultClient = client;
};

