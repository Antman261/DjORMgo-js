# DjORMgo-js

DjORMgo-js is a simple, django-inspired ORM for Node, that aims to fill properties, map joins, and handle basic insertions.

```typescript
import {Model, FieldType, Field} from "djormgo-js";

class User extends Model {
  tablename = "users";
  fields: Array<Field> = [
    {name: "id", type: FieldType.AUTO},
    {name: "username", type: FieldType.VARCHAR},
    {name: "active", type: FieldType.BOOL, default: true},
    {name: "created", type: FieldType.DATE, default: () => new Date()}
  ];
}

const userDAO = new User();

const bob = await userDAO.queryManager.get({username: "bob"});
console.log(bob.active); // true
bob.active = false;
await userDAO.queryManager.update(bob);


const someUsers = await userDAO.queryManager.filter({active: true})
console.log(someUsers[0].username) // sally
```

DjORMgo aims to provide a reliable way to achieve 80% of database work, while supporting an easy `RawQuery` interface for more complicated queries. For example:

```typescript
import {RawQuery} from "djormgo-js";

const users = await userDAO.queryManager.filter(
    new RawQuery(
        "SELECT * FROM users WHERE active = $1 AND created > $2 OR username IN ($3, $4)", 
        [true, new Date(), 'bob', 'sally']
    )
);
console.log(users.length); // 21

userDAO.queryManager.insert({username: "bobette"});

```

In the previous example, the fields `active` and `created` used their default values, while the field `id` was ignored due to it being an auto-increment field.

DjORMgo does not provide migration management, but does require schema definitions in the form of classes extending Model. 

As such, it will throw errors whenever a field does not match the expected type, rather than trying to continue operation in an unexpected state. 

This is a vast improvement on running raw queries with client.query, where a change to a column won't throw an error until certain branches of code are executed utilising that column in an unsupported way.


