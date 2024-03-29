<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db-connection-mysql](./db-connection-mysql.md) &gt; [MySQLConnectionOptions](./db-connection-mysql.mysqlconnectionoptions.md) &gt; [typeCast](./db-connection-mysql.mysqlconnectionoptions.typecast.md)

## MySQLConnectionOptions.typeCast property

Determines how column values are converted into JavaScript types.

<b>Signature:</b>

```typescript
typeCast?: true | TypeCastFunc;
```

## Remarks

A custom type cast function can be provided. Otherwise, must be `true` or omitted to use the default.

The framework relies on the default type casting logic being enabled, so any custom type cast function must respect it.

