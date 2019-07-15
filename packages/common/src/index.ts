// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

/**
 * Common mobule the provides foundation for the rest of the X2 Framrwork and
 * applications that use it.
 *
 * @remarks
 * This mobule deals with the notion of the X2 application, its lifecycle,
 * services, which are singletons that provide service layer functionality to
 * the rest of the application, as well as common basic functionality such as
 * logging and application configuration.
 *
 * @packageDocumentation
 */

export * from "./application";
export * from "./configuration";
export * from "./default-configuration";
export * from "./logger";
export * from "./default-logger";
