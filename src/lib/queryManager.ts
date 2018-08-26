import {Field, FieldType, Model} from "./model";
import {Query} from "./query";

export interface QueryResult {
    model: string;
    data: any;
}

export class QueryManager {
    constructor(private model: Model) {}

    async get(query: Query, client=null): Promise<QueryResult> {
        const result = await query.execute(client);
        if (result.rows.length === 1) {
            const row = result.rows[0];
            const queryResult: QueryResult = {
                model: this.model.tableName,
                data: {},
            };
            const fields = this.model.fields;
            for (let field of fields) {
                // TODO add some logic
                queryResult.data[field.name] = this.typeMapper(field, row[field.name]);
            }
            return queryResult;
        } else if (result.rows.length > 1) {
            throw `GetError: Too many results for query: ${query}`
        } else {
            throw `GetError: No match for query: ${query}`
        }
    }

    /**
     * This function takes a model field, inspects its type, and coerces the database return into the correct type if needed.
     * @param modelField
     * @param dbData
     */
    private typeMapper(modelField: Field, dbData: any): string | boolean | number | Date {
        // TODO write this function
        if (modelField.type === FieldType.DATE) {
            return new Date(dbData); // This is probably broken but we will check
        }
        return dbData;
    }
}
