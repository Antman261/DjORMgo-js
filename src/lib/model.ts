import {QueryManager} from "./queryManager";

export interface Field {
    name: string;
    type: FieldType
}

export enum FieldType {
    INT,
    BIGINT,
    TEXT,
    VARCHAR,
    DATE,
}

export class Model {
    fields: Array<Field> = [];
    tableName: string = "";
    queryManager: QueryManager;
    constructor() {
        this.queryManager = new QueryManager(this);
    }
}
