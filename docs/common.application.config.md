<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/common](./common.md) &gt; [Application](./common.application.md) &gt; [config](./common.application.config.md)

## Application.config property

Application configuration service.

<b>Signature:</b>

```typescript
readonly config: Configuration;
```

## Remarks

The configuration service is different in that it is always available on the application, even before it is initialized. If not explicitely configured, [DefaultConfiguration](./common.defaultconfiguration.md) is used. If explicitely configured, the default configuration is used before the configured service is initialized and after it is shut down.
