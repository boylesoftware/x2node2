<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@x2node/common](./common.md) &gt; [Application](./common.application.md) &gt; [init](./common.application.init.md)

## Application.init() method

Initialize the application and make it ready to use.

<b>Signature:</b>

```typescript
init(): Promise<this>;
```
<b>Returns:</b>

`Promise<this>`

Promise, which resolves with the initialized application or rejects with an application initialization error.

## Remarks

This method must be called before the newly created and configured application can be used. Calling this method creates, configures and initializes all application services. After successful initialization, the application's [Application.ready](./common.application.ready.md) flag becomes `true` and the [Application.init()](./common.application.init.md) method can no longer be called (will throw an error if attempted).

If [Application.init()](./common.application.init.md) is called (asynchronously) before active initialization is complete, the same initialization promise is returned. This, however, should not be normal application behavior. A corresponding warning message will be logged in the console.

An error will be thrown if [Application.init()](./common.application.init.md) is called while the application is being shutdown via the [Application.shutdown()](./common.application.shutdown.md) method. On the other hand, it is possible to call the [Application.shutdown()](./common.application.shutdown.md) method before the initialization is complete. In that case, the initialization will be aborted, all services already initialized will be shut down. The promise returned by the [Application.init()](./common.application.init.md) method will reject with an error after the shutdown is complete.

