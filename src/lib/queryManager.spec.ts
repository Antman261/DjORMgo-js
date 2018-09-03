// tslint:disable:no-expression-statement
import test from 'ava';
import {Field, FieldType, Model} from "./model";
import {initOrm} from "./init";
const Knex = require('knex');

const knex = Knex({
    client: 'pg',
    connection: {
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "test",
        database: "postgres"
    },
});
initOrm(knex);

class MyModel extends Model {}

test('queryManager modelClass', async t => {
    const m = new MyModel();
    t.is(m.queryManager['modelClass'], 'MyModel')
});

test('queryManager tableName implicit', async t => {
    const m = new MyModel();
    t.is(m.queryManager['tableName'], 'my_model')
});

test('queryManager tableName explicit', async t => {
    class MyOtherModel extends Model {
        constructor() {
            super({tableName: "test_table"})
        }
    }
    const m = new MyOtherModel();
    t.is(m.queryManager['tableName'], 'test_table')
});

test('queryManager get', async t => {
    await knex.raw("CREATE TABLE IF NOT EXISTS test_model (id BIGSERIAL PRIMARY KEY, username TEXT, created TIMESTAMP WITH TIME ZONE)", []);
    const d = new Date();
    class TestModel extends Model {
        constructor() {
            super({fields: [
                    {name: "id", type: FieldType.AUTO} as Field,
                    {name: "username", type: FieldType.VARCHAR} as Field,
                    {name: "created", type: FieldType.DATE} as Field
                ],
            });
        }
    }
    const m = new TestModel();
    const r = await m.insert({username: 'bob', created: d});
    const g = await m.get({id: 1});
    t.deepEqual(g, {id: 1, username: 'bob', created: d});
    t.deepEqual(g, r);
    await knex.raw("DROP TABLE test_model CASCADE", []);
});
