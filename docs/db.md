<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/db](./db.md)

## db package

SQL database operations module for <i>X2 Framework</i>.

## Classes

|  Class | Description |
|  --- | --- |
|  [Database](./db.database.md) | Database. |
|  [StandardSQLDialect](./db.standardsqldialect.md) | Standard SQL dialect implementation that can be used as a base class for more specific dialect imlementations. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [DatabaseConnection](./db.databaseconnection.md) | Database connection. |
|  [DatabaseConnectionProvider](./db.databaseconnectionprovider.md) | Database connection provider (such as a connection pool, for example). |
|  [DatabaseMonitor](./db.databasemonitor.md) | Database monitor instance associated with a specific database connection and therefore a specific database transaction. |
|  [DatabaseMonitorProvider](./db.databasemonitorprovider.md) | Provider of database monitor instances. |
|  [DatabaseOptions](./db.databaseoptions.md) | Options used to create database object. |
|  [DatabaseShape](./db.databaseshape.md) | Descriptor of the data stored in the database. |
|  [RecordType](./db.recordtype.md) | Class that represents a record type. |
|  [SQLDialect](./db.sqldialect.md) | SQL dialect. |

## Variables

|  Variable | Description |
|  --- | --- |
|  [DB\_CONNECTION\_PROVIDER\_SERVICE](./db.db_connection_provider_service.md) | Standard service key for the database connection provider. |
|  [DB\_MONITOR\_PROVIDER\_SERVICE](./db.db_monitor_provider_service.md) | Standard service key for the database monitor provider. |
|  [LOG\_CATEGORY](./db.log_category.md) | Base debug log category for the database module. |
