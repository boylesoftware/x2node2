<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db-connection-mysql](./db-connection-mysql.md) &gt; [MySQLConnectionOptions](./db-connection-mysql.mysqlconnectionoptions.md) &gt; [bigNumberStrings](./db-connection-mysql.mysqlconnectionoptions.bignumberstrings.md)

## MySQLConnectionOptions.bigNumberStrings property

Determines if big number values are always returned as strings even if the value fits in a `Number`<!-- -->.

<b>Signature:</b>

```typescript
bigNumberStrings?: boolean;
```

## Remarks

This option is relevant only when [supportBigNumbers](./db-connection-mysql.mysqlconnectionoptions.supportbignumbers.md) is `true` and since [supportBigNumbers](./db-connection-mysql.mysqlconnectionoptions.supportbignumbers.md) is forced to be `false`<!-- -->, this option is never relevant.
