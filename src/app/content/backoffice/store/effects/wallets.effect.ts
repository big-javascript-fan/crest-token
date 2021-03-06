import { IRootState } from './../../content/myreferrals/store/reducers/index';
import {
  GENERATE_WALLET_ADDRESS_REQUEST,
  GenerateWalletAddressFail,
  GenerateWalletAddressRequest,
  GenerateWalletAddressSuccess,
  WALLET_REQUEST,
  WalletLoadFail,
  WalletLoadSuccess,
  WalletRequest
} from './../actions/wallets.action';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { WalletsService } from '../../../../shared/services/wallets.service';

@Injectable()
export class WalletsEffects {

  @Effect()
  public loadWallets$: Observable<Action> = this.actions$
    .ofType(WALLET_REQUEST).pipe(
      map((action: WalletRequest) => action.payload),
      switchMap((userId: string) => this._walletsService.getUserWallets(userId).pipe(
        map((data: any) => new WalletLoadSuccess(data)),
        catchError((err: Error) => {
          // tslint:disable-next-line
          console.log(err);
          return of(new WalletLoadFail(err));
        })
      )),
    );


  @Effect()
  public generateWalletAddress$: Observable<Action> = this.actions$
    .ofType(GENERATE_WALLET_ADDRESS_REQUEST).pipe(
      withLatestFrom(this._store.select('backoffice', 'user', '_id')),
      map(([action, userId]: [GenerateWalletAddressRequest, string]) => ({...action.payload, userId})),
      switchMap((data: GenerateWalletAddress) => this._walletsService.generateWalletAddress(data).pipe(
        map((res: { address: string }) => new GenerateWalletAddressSuccess({...data, ...res})),
        catchError((err: Error) => {
          // tslint:disable-next-line
          console.log(err);
          return of(new GenerateWalletAddressFail(err));
        })
      )),
    );

  public constructor(
    private actions$: Actions,
    private _walletsService: WalletsService,
    private _store: Store<IRootState>,
  ) {
  }
}
