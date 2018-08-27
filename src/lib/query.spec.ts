// tslint:disable:no-expression-statement
import test from 'ava';
import {InsertQuery, RawQuery, SelectQuery, UpdateQuery} from './query';

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

test('SelectQuery.keyExpander()', async t => {
    const {op, col} = SelectQuery['keyExpander']('bob__lt');
    t.is(op, '<');
    t.is(col, 'bob')
});

test('InsertQuery.toString()', async t => {
    const q = new InsertQuery({username: 'bob', active: true}, 'users');
    t.is(q.toString(), `INSERT INTO users (username, active) VALUES ('bob', 'true') RETURN *`);
});

test('UpdateQuery.toString()', async t => {
    const q = new UpdateQuery({id: 1, username: 'bobette', active: false}, 'users', 'id');
    t.is(q.toString(), `UPDATE users SET username = 'bobette', active = 'false' WHERE id = 1`)
})
