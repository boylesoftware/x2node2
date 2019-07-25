// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { SQLDialect } from "./dialect";
import { DatabaseShape } from "./shape";
import { DatabaseConnection } from "./connection";
import { DatabaseMonitor } from "./monitor";

/**
 * Transaction context.
 *
 * @typeParam P - Transaction parameters shape.
 *
 * @public
 */
export interface TransactionContext<P> {

  /**
   * Transaction parameters.
   */
  readonly $params: P;
}

/**
 * Function that creates a transaction step.
 *
 * @typeParam P - Transaction parameters shape.
 * @typeParam X - Shape of the transaction context object as it is passed into
 * the step.
 * @typeParam Y - Shape of the transaction context object as it is left after
 * the step is executed.
 * @param dialect - SQL dialect of the database.
 * @param dbShape - Database shape descriptor.
 * @returns Transaction step.
 *
 * @public
 */
export interface TransactionStepFactory<
  P,
  X extends TransactionContext<P>,
  Y extends TransactionContext<P>
> {
  (dialect: SQLDialect, dbShape: DatabaseShape): TransactionStep<P, X, Y>;
}

/**
 * Transaction step.
 *
 * @remarks
 * Steps are building blocks of a transaction. They are constructed when a
 * transaction is built and are executed when it is executed.
 *
 * @typeParam P - Transaction parameters shape.
 * @typeParam X - Shape of the transaction context object as it is passed into
 * the step.
 * @typeParam Y - Shape of the transaction context object as it is left after
 * the step is executed.
 *
 * @public
 */
export interface TransactionStep<
  P,
  X extends TransactionContext<P>,
  Y extends TransactionContext<P>
> {

  /**
   * Execute the step.
   *
   * @param con - Database connection.
   * @param mon - Database monitor.
   * @param ctx - Transaction context.
   * @returns Promise of the new transaction context. If the promise is
   * rejected, no further steps are executed and the transaction is rolled back.
   */
  execute(con: DatabaseConnection, mon: DatabaseMonitor, ctx: X): Promise<Y>;
}

/**
 * Transaction definition.
 *
 * @remarks
 * A single transaction definition can be executed more than once generating
 * multiple transactions. A transaction definition wraps a single transaction
 * step, called _master step_, which, in turn, can be compound and consist of
 * multiple nested steps. Execution of a transaction is execution of its master
 * step.
 *
 * @typeParam P - Transaction parameters shape.
 * @typeParam R - Type of the transaction result object, which is the
 * transaction's master step output transaction context.
 *
 * @public
 */
export interface Transaction<P, R extends TransactionContext<P>> {

  /**
   * Execute transaction.
   *
   * @param params - Transaction parameters.
   * @returns Promise of the transaction result object. If the promise is
   * rejected, it means the transaction was rolled back. Otherwise, the
   * transaction was committed.
   */
  execute(params: P): Promise<R>;
}

/**
 * Builder used to construct transaction definitions.
 *
 * @typeParam P - Transaction parameters shape.
 *
 * @public
 */
export interface TransactionBuilder<P> {

  sequence<R extends TransactionContext<P>>(stepF: TransactionStepFactory<P, TransactionContext<P>, R>): Transaction<P, R>;
  //... fetch, etc.
}
