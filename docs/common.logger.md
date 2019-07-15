<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/common](./common.md) &gt; [Logger](./common.logger.md)

## Logger interface

Logger service interface.

<b>Signature:</b>

```typescript
export interface Logger 
```

## Methods

|  Method | Description |
|  --- | --- |
|  [addContext(ctx)](./common.logger.addcontext.md) | Create new logger based on this one and add context to it. |
|  [debug(category)](./common.logger.debug.md) | Get debug logger for the given category. |
|  [error(message, err)](./common.logger.error.md) | Log an error. |
|  [isDebugEnabled(category)](./common.logger.isdebugenabled.md) | Tell if debug message are enabled for the specified category. |

## Remarks

Logger service is used by applications to log unexpected application errors as well as debug messages, when enabled. Debug messages are categorized and logger implementations usually allow selectively enabling/disabling certain debug message categories.

A logger service is always available on the application, even if not explicitly configured. The [DefaultLogger](./common.defaultlogger.md) implementation is used by default.
