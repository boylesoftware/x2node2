// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import { Logger } from "@x2node/common";

import {
  TransactionContext as ITransactionContext,
  Transaction as ITransaction,
  TransactionBuilder as ITransactionBuilder,
  TransactionStepFactory,
  TransactionStep
} from "../transaction";
import { DatabaseShape } from "../shape";
import { DatabaseConnectionProvider, TxMode, TxResolve } from "../connection";
import { DatabaseMonitor } from "../monitor";
import { LOG_CATEGORY } from "../constants";

export class TransactionContext<P> implements ITransactionContext<P> {

  public readonly $logger: Logger;

  public readonly $params: P;

  public constructor(logger: Logger, params: P) {

    this.$logger = logger;
    this.$params = params;
  }
}

let nextTxId = 1;

export class Transaction<P, R extends TransactionContext<P>> implements ITransaction<P, R> {

  private readonly _logger: Logger;

  private readonly _conProvider: DatabaseConnectionProvider;

  private readonly _monitor: DatabaseMonitor;

  private readonly _masterStep: TransactionStep<P, TransactionContext<P>, R>;

  public constructor(
    logger: Logger,
    connectionProvider: DatabaseConnectionProvider,
    monitor: DatabaseMonitor,
    masterStep: TransactionStep<P, TransactionContext<P>, R>
  ) {

    this._logger = logger;
    this._conProvider = connectionProvider;
    this._monitor = monitor;
    this._masterStep = masterStep;
  }

  public async execute(params: P): Promise<R> {

    const txId = nextTxId++;

    const logger = this._logger.addContext([`tx #${txId}`]);
    const log = logger.debug(LOG_CATEGORY);

    // TODO: single record tx, segment/record meta info in result
    // TODO: commit instead of rollback if no modifications

    log("executing transaction");
    return this._conProvider.getConnection().then(async (con): Promise<R> => {
      log(`acquired database connection, session id ${con.sessionId}`);
      try {
        const writeSegments = this._masterStep.writeSegments;
        const readWrite = (writeSegments && writeSegments.length > 0);
        log(`starting ${readWrite ? "read/write" : "read-only"} transaction`);
        return con.beginTransaction(
          readWrite ? TxMode.ReadWrite : TxMode.ReadOnly
        ).then(async (): Promise<R> => {
          try {
            log("acquiring transaction monitor");
            return this._monitor.monitorTransaction(
              con, this._masterStep.readSegments, writeSegments
            ).then(async (mon): Promise<R> => {
              log("executing transaction logic");
              return this._masterStep.execute(
                con, mon, new TransactionContext(logger, params)
              ).then((result): Promise<R> | R => {
                if (readWrite) {
                  log("saving segment updates");
                  return mon.saveSegmentUpdates().then((): R => result);
                } else {
                  return result;
                }
              });
            }).then(async (result): Promise<R> => {
              log("committing transaction");
              return con.endTransaction(TxResolve.Commit).then((): R => result);
            }).catch(async (err): Promise<never> => {
              log("rolling back transaction due to error");
              return con.endTransaction(TxResolve.Rollback).then(
                (): Promise<never> => Promise.reject(err),
                (rollbackErr): Promise<never> => {
                  logger.error("error rolling back transaction", rollbackErr);
                  return Promise.reject(err);
                }
              );
            });
          } catch (err) {
            log("rolling back transaction due to error");
            return con.endTransaction(TxResolve.Rollback).then(
              (): Promise<never> => Promise.reject(err),
              (rollbackErr): Promise<never> => {
                logger.error("error rolling back transaction", rollbackErr);
                return Promise.reject(err);
              }
            );
          }
        }).finally((): void => {
          log("releasing database connection");
          con.release();
        });
      } catch (err) {
        log("releasing database connection");
        con.release();
        throw err;
      }
    });
  }
}

export class TransactionBuilder<P> implements ITransactionBuilder<P> {

  private readonly _logger: Logger;

  private readonly _dbShape: DatabaseShape;

  private readonly _conProvider: DatabaseConnectionProvider;

  private readonly _monitor: DatabaseMonitor;

  public constructor(
    logger: Logger,
    dbShape: DatabaseShape,
    conProvider: DatabaseConnectionProvider,
    monitor: DatabaseMonitor,
  ) {

    this._logger = logger;
    this._dbShape = dbShape;
    this._conProvider = conProvider;
    this._monitor = monitor;
  }

  public sequence<R extends TransactionContext<P>>(
    stepF: TransactionStepFactory<P, TransactionContext<P>, R>
  ): Transaction<P, R> {

    return new Transaction(
      this._logger,
      this._conProvider,
      this._monitor,
      stepF(this._conProvider.dialect, this._dbShape)
    );
  }
  //... fetch, etc.
}

/*export class TransactionContext<P> {

  public readonly $params: P;

  public readonly $txStart: Date;

  protected constructor(params: P) {

    this.$params = params;
    this.$txStart = new Date();
  }
}

export interface TransactionStep<P, X extends TransactionContext<P>, Y extends TransactionContext<P>> {
}

export interface Transaction<P, X extends TransactionContext<P>, Y extends TransactionContext<P>> extends TransactionStep<P, X, Y> {
}

export function defTx<P>(
  tx: TransactionStep<P, TransactionContext<P>, TransactionContext<P>>
): Transaction<P, TransactionContext<P>, TransactionContext<P>> {

  return {};
}*/
