import {Monad} from "./monad";

type MaybeMatch<T, K> = {
  nothing: () => K,
  just: (t: T) => K
};

export abstract class Maybe<A> implements Monad<A> {
  abstract match<K>(m: MaybeMatch<any, K>): K;
  of: <B>(v: B) => Maybe<B> = of;
  abstract chain<B>(f: (a: A) => Maybe<B>): Maybe<B>;
  abstract flatten<B>(m: Monad<Monad<B>>): Monad<B>;
  abstract map<B>(f: (a: A) => B): Maybe<B>;
  abstract mapTo<B>(b: B): Maybe<B>;
  lift<T1, R>(f: (t: T1) => R, m: Maybe<T1>): Maybe<R>;
  lift<T1, T2, R>(f: (t: T1, u: T2) => R, m1: Maybe<T1>, m2: Maybe<T2>): Maybe<R>;
  lift<T1, T2, T3, R>(f: (t1: T1, t2: T2, t3: T3) => R, m1: Maybe<T1>, m2: Maybe<T2>, m3: Maybe<T3>): Maybe<R>;
  lift(f: Function, ...args: any[]): any {
    switch (f.length) {
    case 1:
      return args[0].val !== undefined ? Just(f(args[0].val)) : nothing;
    case 2:
      if (args[0].val !== undefined && args[1].val !== undefined) {
        return Just(f(args[0].val, args[1].val));
      } else {
        return nothing;
      }
    case 3:
      if (args[0].val !== undefined &&
          args[1].val !== undefined &&
          args[2].val !== undefined) {
        return Just(f(args[0].val, args[1].val, args[2].val));
      } else {
        return nothing;
      }
    }
  }
}

function of<V>(v: V): Maybe<V> {
  return new ImplJust(v);
}

class ImplNothing<A> extends Maybe<A> {
  constructor() {
    super();
  };
  match<K>(m: MaybeMatch<any, K>): K {
    return m.nothing();
  }
  chain<B>(f: (a: A) => Maybe<B>): Maybe<A> {
    return this;
  }
  flatten<B>(m: Maybe<Maybe<B>>): Maybe<B> {
    return m.match({
      nothing: () => Nothing(),
      just: (m) => m
    });
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return new ImplNothing<B>();
  }
  mapTo<B>(b: B): Maybe<B> {
    return new ImplNothing<B>();
  }
}

class ImplJust<A> extends Maybe<A> {
  val: A;
  constructor(val: A) {
    super();
    this.val = val;
  }
  match<K>(m: MaybeMatch<A, K>): K {
    return m.just(this.val);
  }
  chain<B>(f: (v: A) => Maybe<B>): Maybe<B> {
    return f(this.val);
  }
  flatten<B>(m: Maybe<Maybe<B>>): Maybe<B> {
    return m.match({
      nothing: () => Nothing(),
      just: (m) => m
    });
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return new ImplJust(f(this.val));;
  }
  mapTo<B>(b: B): Maybe<B> {
    return new ImplJust<B>(b);
  }
}

export function Just<V>(v: V): Maybe<V> {
  return new ImplJust(v);
}

const nothing = new ImplNothing();

export function Nothing<V>(): Maybe<V> {
  return nothing;
}
