import {Field, FieldType, Model} from "./model";
import {Filter, SelectQuery, RawQuery, InsertQuery} from "./query";
import {Error} from "tslint/lib/error";

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

    constructor(private model: Model) {
        let autoColumnName = "";
        for (const field of this.model.fields) {
            if (field.type === FieldType.AUTO) {
                autoColumnName = field.name;
            }
        }
        this.autoColumnName = autoColumnName;
    }

    async get(filter: Filter | RawQuery, client=null): Promise<QueryResult> {
        const result: any = await this._lookup(filter, client);
        if (result.rows.length === 1) {
            const row = result.rows[0];
            return this._buildQueryResult(row);
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

    async insert(row: any, client=null): Promise<any> {
        const cleanRow = Object.assign({}, row);
        delete cleanRow[this.autoColumnName];
        const result = await new InsertQuery(cleanRow, this.model.tableName).execute(client);
        console.log(result); // is it a row?
        return this._buildQueryResult(result);
    }

    async update(row: any, client=null): Promise<any> {
        const updateFieldsStr = Object.keys(row)
            .filter(this.removeAutoColumn)
            .map((key, idx) => `${key} = $${idx + 1}`);
        const values = Object.assign({}, row);
        delete values[this.autoColumnName];
        const result = await new RawQuery(
            `UPDATE ${this.model.tableName} 
            SET ${updateFieldsStr} 
            WHERE ${this.autoColumnName} = ${row[this.autoColumnName]} 
            RETURNING *`,
            Object.values(values)
        ).execute(client);
        console.log(result); // is it a row?
        return this._buildQueryResult(result);
    }

    private removeAutoColumn(colName: string): boolean {
        return colName !== this.autoColumnName;
    }

    private async _lookup(filter: Filter | RawQuery, client=null): Promise<any> {
        const query = filter instanceof RawQuery ? filter : new SelectQuery(filter, this.model.tableName);
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
            throw new SchemaError(`SchemaError: Model/schema mismatch for ${this.model.tableName}, column ${modelField.name}`);
        }
        if (modelField.type === FieldType.DATE) {
            return new Date(dbData); // This is probably broken but we will check
        }
        // TODO check and write coercers, or throw if types don't match. It might make sense for field types to be classes and implement their own coercers.
        return dbData;
    }
}
