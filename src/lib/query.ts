import {defaultClient} from "./init";

export interface Filter {
    [propName: string]: string | boolean | number | Date;
}

export class RawQuery {
    hasExecuted: boolean;
    cachedResult: any;
    constructor(private queryString: string, private inputs: Array<string | number | boolean | Date>) {
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
        this.cachedResult = await client.raw(this.queryString, this.inputs);
        return this.cachedResult;
    }

    public refresh(client: any= null) {
        return this._execute(client);
    }

    public toString(): string {
        const {queryString, inputs} = this;
        let i = 0;
        return queryString.replace(/\?/gm, (match: string):string => {
            match;
            return `'${inputs[i++]}'` as string;
        });
    }
}

type OpMap = {
    [name: string]: string;
}

export class SelectQuery extends RawQuery {
    private static opMap: OpMap = {
        gt: ">",
        gte: ">=",
        lt: "<",
        lte: "<=",
        not: "!=",
        eq: "=",
    };
    constructor(filter: Filter, tableName: string) {
        const filters = Object.keys(filter)
            .map((key) => {
                const {col, op} = SelectQuery.keyExpander(key);
                return `${col} ${op} ?`
            })
            .join(" AND ");
        const queryString = `SELECT * FROM ${tableName} WHERE ${filters}`;
        const inputs = Object.values(filter) as Array<string | boolean | number | Date>;
        super(queryString, inputs);
    }

    private static keyExpander(key: string): any {
        const [col, opWord= "eq"] = key.split("__");
        let op: string = SelectQuery.opMap[opWord] || "=";
        return {op, col}
    }
}

export class InsertQuery extends RawQuery {
    constructor(row: any, tableName: string) {
        const cols = Object.keys(row)
            .join(", ");
        const valuesStr = Object.keys(row)
            .map(() => `?`)
            .join(", ");
        const queryString = `INSERT INTO ${tableName} (${cols}) VALUES (${valuesStr}) RETURNING *`;
        const inputs = Object.values(row);
        super(queryString, inputs as Array<number | string | boolean | Date>);
    }
}

export class UpdateQuery extends RawQuery {
    constructor(row: any, tableName: string, autoColumnName: string) {
        const fieldsStr = Object.keys(row)
            .filter(colName => colName !== autoColumnName)
            .map((k) => `${k} = ?`)
            .join(", ");
        const queryString = `UPDATE ${tableName} SET ${fieldsStr} WHERE ${autoColumnName} = ${row[autoColumnName]} RETURNING *`;
        const values = Object.assign({}, row);
        delete values[autoColumnName];
        super(queryString, Object.values(values) as Array<number | string | boolean | Date>);
    }
}
