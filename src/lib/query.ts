import {defaultClient} from "./init";

export class Query {
    hasExecuted: boolean;
    cachedResult: any;
    constructor(private selector: string, private inputs: Array<string | number | boolean | Date>) {
        this.hasExecuted = false;
    }

    /**
     *
     * @param client Optionally accepts a client, e.g. for use with transactional clients.
     */
    public async execute(client: any= null) {
        if (!this.hasExecuted) {
            this.hasExecuted = true;
            return await this._execute(client)
        } else {
            return await this.cachedResult;
        }
    }

    private async _execute(client: any= null) {
        // TODO extend this to inspect client type so it can support multiple dbs, e.g. wrap mysqljs callback in a Promise
        if (!client) client = defaultClient;
        this.cachedResult = await client.query(this.selector, this.inputs);
        return this.cachedResult;
    }

    public refresh(client: any= null) {
        return this._execute(client);
    }

    public toString(): string {
        const {selector, inputs} = this;
        return selector.replace(/\$\d/gm, (match: string):string => {
            return inputs[parseInt(match.replace("$", ""), 10)-1] as string;
        });
    }
}
