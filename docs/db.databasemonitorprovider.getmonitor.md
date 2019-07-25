<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db](./db.md) &gt; [DatabaseMonitorProvider](./db.databasemonitorprovider.md) &gt; [getMonitor](./db.databasemonitorprovider.getmonitor.md)

## DatabaseMonitorProvider.getMonitor() method

Allocate monitor instance and associate it with the provided database connection.

<b>Signature:</b>

```typescript
getMonitor(con: DatabaseConnection): Promise<DatabaseMonitor>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  con | <code>DatabaseConnection</code> | Database connection. |

<b>Returns:</b>

`Promise<DatabaseMonitor>`

Promise of the monitor. The promise is rejected if the monitor cannot be allocated.

## Remarks

After the monitor instance no longer needed, it must be release using its [release()](./db.databasemonitor.release.md) method.
