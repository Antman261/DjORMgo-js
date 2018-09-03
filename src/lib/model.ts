import {QueryManager, QueryResult} from "./queryManager";
import {Filter, RawQuery} from "./query";

export type Field = {
    name: string;
    type: FieldType
}

export enum FieldType {
    AUTO,
    INT,
    BIGINT,
    TEXT,
    VARCHAR,
    DATE,
    BOOL
}

type ModelInit = {
    tableName?: string;
    fields?: Array<Field>
}

export class Model {
    fields: Array<Field> = [];
    tableName: string;
    queryManager: QueryManager;
    constructor({tableName= "", fields= []}:ModelInit ={}) {
        this.tableName =  tableName;
        this.fields = fields;
        this.queryManager = new QueryManager(this);
    }

    async get(filter: Filter | RawQuery, client=null): Promise<QueryResult> {
        return await this.queryManager.get(filter, client);
    }
    async filter(filter: Filter | RawQuery, client=null): Promise<Array<QueryResult>> {
        return await this.queryManager.filter(filter, client);
    }
    async insert(row: any, client=null): Promise<QueryResult> {
        return await this.queryManager.insert(row, client);
    }
    async update(row: any, client=null): Promise<QueryResult> {
        return await this.queryManager.update(row, client);
    }
}

