import {QueryManager} from "./queryManager";

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

export class Model {
    fields: Array<Field> = [];
    tableName: string = "";
    queryManager: QueryManager;
    constructor() {
        this.queryManager = new QueryManager(this);
    }
}
