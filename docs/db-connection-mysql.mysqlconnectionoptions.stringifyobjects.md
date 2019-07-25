<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db-connection-mysql](./db-connection-mysql.md) &gt; [MySQLConnectionOptions](./db-connection-mysql.mysqlconnectionoptions.md) &gt; [stringifyObjects](./db-connection-mysql.mysqlconnectionoptions.stringifyobjects.md)

## MySQLConnectionOptions.stringifyObjects property

Irrelevant (the framework does not use this functionality of the underlying module).

<b>Signature:</b>

```typescript
stringifyObjects?: boolean;
```

## Remarks

Originally, tells if objects passed as values to SQL statements with placeholders are substituted with object string values (via calling `toString()` on the object) (if `true`<!-- -->), or expanded to comma-separated lists of `field = value` constructs (if `false`<!-- -->).
