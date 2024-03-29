<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db](./db.md) &gt; [DatabaseConnection](./db.databaseconnection.md) &gt; [executeQuery](./db.databaseconnection.executequery.md)

## DatabaseConnection.executeQuery() method

Execute query (`SELECT` statement) on the connection.

<b>Signature:</b>

```typescript
executeQuery<R>(sql: string, parser: QueryResultParser<R>): Promise<R>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sql | <code>string</code> | Query SQL. |
|  parser | <code>QueryResultParser&lt;R&gt;</code> | Query result parser. |

<b>Returns:</b>

`Promise<R>`

Promise of the query result. The promise is rejected if there was an error.

## Remarks

Not allowed when there is an unresolved promise returned by one of the transaction methods (in other words when the connection is in transitional transaction status).

