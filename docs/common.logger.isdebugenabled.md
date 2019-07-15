<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/common](./common.md) &gt; [Logger](./common.logger.md) &gt; [isDebugEnabled](./common.logger.isdebugenabled.md)

## Logger.isDebugEnabled() method

Tell if debug message are enabled for the specified category.

<b>Signature:</b>

```typescript
isDebugEnabled(category: string): boolean;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  category | <code>string</code> | Category name. |

<b>Returns:</b>

`boolean`

`true` if debug messages are enabled for the category, `false` if the category debug logger is a no-op.

## Remarks

If constructing a message for the debug logger returned by the [debug()](./common.logger.debug.md) method is an expensive operation, it sometimes worth checking if the logger is actually a no-op before invoking it. This method allows to perform such check.
