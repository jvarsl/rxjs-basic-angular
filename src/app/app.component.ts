import { Component, OnInit } from '@angular/core';
import {
  combineLatest,
  from,
  fromEvent,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  delay,
  concatMap,
  map,
  filter,
  tap,
  debounceTime,
  throttleTime,
  switchMap,
  catchError,
  retry,
} from 'rxjs/operators';
/*
stream - events emitted over time
*/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'learn-rxjs';
  modified$ = new Observable<number>();

  ngOnInit(): void {
    // dollar sign - means it's observable https://angular.io/guide/rx-library#naming-conventions-for-observables
    // side effect meaning - it should not change anything anywhere in the app (meaning tap should not change some values)

    // both create observables:
    // "from" - returns one by one
    // "of" - returns whole object (let it be array or a number)

    // tap - to peak inside pipe, should be used for minor stuff only (to not have this
    // minor stuff inside map)
    const source$ = from([1, 2, 3, 4, 5, 6, 7]).pipe(
      concatMap((item) => of(item).pipe(delay(1000))),
      tap((x) => console.log(x))
    );

    this.modified$ = source$.pipe(
      map((x) => Math.pow(x, 2)),
      filter((item) => item > 4)
    );

    /*                */
    // debounceTime - doesn't do anything until the time is over
    // throttleTime - does every time specified (immediately and then our time)
    // bufferCount - collect specified ammount and once the count is met, show everything under one array
    const mouseMove$ = fromEvent(document, 'mousemove');
    const mouseMoveDebounce$ = mouseMove$.pipe(debounceTime(1000));
    // mouseMoveDebounce$.subscribe((x) => console.log(x));

    /*                */
    // switchMap - allows start with one observable and switch to next one

    // idea - get user id then fetch his data
    const user$ = of({ uid: Math.random() });

    const fetchOrders$ = (userId: number) => {
      return of(`${userId}'s order data`);
    };

    const orders$ = user$.pipe(
      switchMap((user) => {
        return fetchOrders$(user.uid);
      })
    );

    orders$.subscribe((x) => console.log(x));

    /*                */
    const randomDigit$ = new Observable<number>((x) => x.next(Math.random()));

    const delayedRandomDigit$ = randomDigit$.pipe(delay(2000));

    // combineLatest emits everything once it's ready (if new one comes - emits everything again)
    // we pass as array
    const comboCombine$ = combineLatest([
      delayedRandomDigit$,
      randomDigit$,
      randomDigit$,
    ]);
    // our 2 sec delay makes everything delayed
    comboCombine$.subscribe((x) => console.log('comboCombine', x));

    // merge and output as results come (the one that got the result, not all at once)
    const comboMerge$ = merge(delayedRandomDigit$, randomDigit$, randomDigit$);
    // delayed gets delayed, but the rest output as soon as respond
    comboMerge$.subscribe((x) => console.log('comboMerge', x));

    /*                */
    // errors
    const sub$ = new Subject<string>();

    sub$
      .pipe(
        tap({
          next: (x) => console.log('value tap inside subPipe', x),
          error: (x) => console.log('error tap inside subPipe', x),
        }),
        catchError((err) => of('error happened')),
        // retry allows trying once again - useful for http calls
        retry(2)
      )
      .subscribe((x) => console.log(x));

    sub$.next('good');
    setTimeout(() => {
      sub$.error(of('broken'));
    }, 4000);
  }
}
