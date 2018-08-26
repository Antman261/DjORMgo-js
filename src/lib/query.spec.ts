// tslint:disable:no-expression-statement
import test from 'ava';
import { RawQuery, SelectQuery } from './query';

test('RawQuery.toString()', async t => {
    const d = new Date();
    const q = new RawQuery(
        `SELECT * FROM test WHERE bob = $1 AND sally = $2 AND date = $3`,
        ["good", 2, d]
    );
    t.is(q.toString(), `SELECT * FROM test WHERE bob = 'good' AND sally = '2' AND date = '${d}'`);
});

test('SelectQuery.toString()', async t => {
    const d = new Date();
    const q = new SelectQuery(
        {bob: "good", sally: 2, date: d},
        "test",
    );
    t.is(q.toString(), `SELECT * FROM test WHERE bob = 'good' AND sally = '2' AND date = '${d}'`);
});
