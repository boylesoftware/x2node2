// Copyright (c) Boyle Software, Inc. All rights reserved. Licensed under the MIT license.

import {
  TransactionContext as ITransactionContext,
  Transaction as ITransaction,
  TransactionBuilder as ITransactionBuilder,
  TransactionStepFactory,
  TransactionStep
} from "../transaction";
import { DatabaseShape } from "../shape";
import { DatabaseConnectionProvider } from "../connection";
import { DatabaseMonitorProvider } from "../monitor";

export class TransactionContext<P> implements ITransactionContext<P> {

  public readonly $params: P;

  public constructor(params: P) {

    this.$params = params;
  }
}

export class Transaction<P, R extends TransactionContext<P>> implements ITransaction<P, R> {

  private readonly _conProvider: DatabaseConnectionProvider;

  private readonly _monProvider: DatabaseMonitorProvider;

  private readonly _masterStep: TransactionStep<P, TransactionContext<P>, R>;

  public constructor(
    conProvider: DatabaseConnectionProvider,
    monProvider: DatabaseMonitorProvider,
    masterStep: TransactionStep<P, TransactionContext<P>, R>
  ) {

    this._conProvider = conProvider;
    this._monProvider = monProvider;
    this._masterStep = masterStep;
  }

  public async execute(params: P): Promise<R> {

    // TODO: actual implementation with logging and tx handling
    return this._conProvider.getConnection(
    ).then(
      (con): Promise<R> => this._monProvider.getMonitor(
        con
      ).then(
        (mon): Promise<R> => this._masterStep.execute(
          con, mon, new TransactionContext(params)
        ).finally(
          (): void => {
            mon.release();
          }
        )
      ).finally(
        (): void => {
          con.release();
        }
      )
    );
  }
}

export class TransactionBuilder<P> implements ITransactionBuilder<P> {

  private readonly _dbShape: DatabaseShape;

  private readonly _conProvider: DatabaseConnectionProvider;

  private readonly _monProvider: DatabaseMonitorProvider;

  public constructor(
    dbShape: DatabaseShape,
    conProvider: DatabaseConnectionProvider,
    monProvider: DatabaseMonitorProvider,
  ) {

    this._dbShape = dbShape;
    this._conProvider = conProvider;
    this._monProvider = monProvider;
  }

  public sequence<R extends TransactionContext<P>>(
    stepF: TransactionStepFactory<P, TransactionContext<P>, R>
  ): Transaction<P, R> {

    return new Transaction(
      this._conProvider,
      this._monProvider,
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
