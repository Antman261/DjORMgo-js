import {Filter, SelectQuery, RawQuery, InsertQuery, UpdateQuery} from "./query";
import {FieldType, Model, Field} from "./model";
import * as _ from "lodash";

export interface QueryResult {
    [name: string]: string | boolean | number | Date;
}

export class GetError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GetError";
    }
}

export class SchemaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SchemaError";
    }
}

export class QueryManager {
    private readonly autoColumnName: string;
    private readonly modelClass: any;
    private readonly tableName: string;

    constructor(private model: Model) {
        let autoColumnName = "";
        for (const field of this.model.fields) {
            if (field.type === FieldType.AUTO) {
                autoColumnName = field.name;
            }
        }
        this.autoColumnName = autoColumnName;
        this.modelClass = this.model.constructor.name;
        this.tableName = this.model.tableName || _.snakeCase(this.modelClass);
    }

    async get(filter: Filter | RawQuery, client=null): Promise<QueryResult> {
        const result: any = await this._lookup(filter, client);
        if (result.rows.length === 1) {
            return this._buildQueryResult(result.rows[0]);
        } else if (result.rows.length > 1) {
            throw new GetError(`Too many results for query: ${filter}`);
        } else {
            throw new GetError(`No match for query: ${filter}`);
        }
    }

    async filter(filter: Filter | RawQuery, client=null): Promise<Array<QueryResult>> {
        const result = await this._lookup(filter, client);
        return result.rows.map(this._buildQueryResult);
    }

    async insert(row: any, client=null): Promise<QueryResult> {
        if (row instanceof RawQuery) {
            const result = await row.execute(client);
            return this._buildQueryResult(result);
        }
        const cleanRow = Object.assign({}, row);
        delete cleanRow[this.autoColumnName];
        const result = await new InsertQuery(cleanRow, this.tableName).execute(client);
        return this._buildQueryResult(result.rows[0]);
    }

    async update(row: any, client=null): Promise<QueryResult> {
        if (row instanceof RawQuery) {
            const result = await row.execute(client);
            return this._buildQueryResult(result);
        }
        const result = await new UpdateQuery(
            row,
            this.tableName,
            this.autoColumnName
        ).execute(client);
        return this._buildQueryResult(result.rows[0]);
    }

    private async _lookup(filter: Filter | RawQuery, client=null): Promise<any> {
        const query = filter instanceof RawQuery ? filter : new SelectQuery(filter, this.tableName);
        return await query.execute(client);
    }

    private _buildQueryResult(row: any): QueryResult {
        const queryResult: QueryResult = {};
        for (let field of this.model.fields) {
            queryResult[field.name] = this.typeMapper(field, row[field.name]);
        }
        return queryResult;
    }

    /**
     * This function takes a model field, inspects 75its type, and coerces the database return into the correct type if needed.
     * @param modelField
     * @param dbData
     */
    private typeMapper(modelField: Field, dbData: any): string | boolean | number | Date {
        if (dbData === undefined) {
            throw new SchemaError(`SchemaError: Model/schema mismatch for ${this.tableName}, column ${modelField.name}`);
        }
        if ([FieldType.AUTO, FieldType.BIGINT, FieldType.INT].includes(modelField.type)) {
            const v = parseInt(dbData, 10);
            if (Number.isSafeInteger(v)) {
                return v;
            }
            // this will create unexpected behaviour for ints above 2^53-1... but then
            // a lot of people probably don't even think about the javascript max int
            // issue when interacting with a db. As long as it is documented, then this
            // is a "feature", else it is a bug.
            // Consider implementing a 64int library
        }
        // TODO check and write coercers, or throw if types don't match. It might make sense for field types to be classes and implement their own coercers.
        return dbData;
    }
}
