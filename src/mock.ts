import * as fixture from './fixture';
import { spyOnDescriptor, spyOnStaticDescriptor, spyOnFunction, spyOnMethod, spyOnStaticMethod } from './spy';
import { copyConstructor, copyPrototype, copyScope, copyScopeDescriptors, getAncestors } from './instance';
import { History } from './history';
import { ClassDef, ConstructorParameters, ConstructorReturnType, Es5ClassDef, Es6Class, Es6ClassDef, Fn, NotNeverKeys, ObjectFromList } from './utils';
import { _Observer } from './observer';

export class Observe { private constructor() {} private __observe() {} };
export const Initial = Observe;
export class This { private constructor() {} private __this() {} };
export class Null { private constructor() {} private __null() {} };
export class Undefined { private constructor() {} private __undefined() {} };

export type CustomType<T> = T extends _Custom<any> ? T['value'] : T;

export type PropertyType<T> = T extends _Property<any>
  ? T['descriptor']['value'] extends Fn<any>
    ? ReturnType<T['descriptor']['value']>
    : T['descriptor']['value']
  : T;

export type StaticPropertyType<T> = T extends _StaticProperty<any>
  ? T['descriptor']['value'] extends Fn<any>
    ? ReturnType<T['descriptor']['value']>
    : T['descriptor']['value']
  : T;

export type Placeholder<T, TSelf = never> = T extends typeof Observe | typeof Initial
  ? never
  : T extends typeof This
    ? TSelf
    : T extends typeof Null // same as "null"
      ? null
      : T extends typeof Undefined // same as "undefined"
        ? undefined
        : T;

export type PlaceholderFn<T, TSelf = never> = T extends typeof Observe | typeof Initial
  ? never
  : T extends typeof This
    ? Fn<TSelf>
    : T extends typeof Null // same as "null"
      ? Fn<null>
      : T extends typeof Undefined // same as "undefined"
        ? Fn<undefined>
        : T extends Fn ? T : Fn<T>;

export type Integrated<T = any> = string | number | boolean | symbol | null | undefined | Fn<T>;

export type AllPlaceholders = typeof Initial | typeof Observe | typeof This | typeof Null | typeof Undefined;

export type StubPlaceholders = typeof This | typeof Null | typeof Undefined;

export type MockProps<T, U = never, TSelf = never> = CustomType<T> extends Integrated | StubPlaceholders
  ? PlaceholderFn<CustomType<T>, TSelf>
  : T extends _Property<any>
    ? Placeholder<CustomType<PropertyType<T>>, TSelf>
    : U;

export type MockStaticProps<T, U = never, TSelf = never> = T extends _StaticProperty<any>
  ? Placeholder<CustomType<StaticPropertyType<T>>, TSelf>
  : T extends _StaticMethod<any>
    ? PlaceholderFn<CustomType<T['fn']>, TSelf>
    : U;

export type MockPropsTypes<T = any> = Integrated<T> |
  AllPlaceholders |
  fixture._Fixture |
  typeof fixture._Fixture |
  typeof fixture.Fixture |
  _Custom<any>;

export type MockPropsMap = Record<
  string,
  MockPropsTypes<any> | _Property<any> | _StaticMethod<any> | _StaticProperty<any>
>;

export type MockClassMixin<T> = {
  OBSERVER?: _Observer;
  RESTORE?: () => T;
}

export type MockClass<
  T extends ClassDef<any> = Es6Class<any>,
  P extends ReadonlyArray<string | number | symbol> | MockPropsMap = (keyof T)[],
  TConstructorReturnType = ConstructorReturnType<T>,
  TMockProps = P extends ReadonlyArray<string | number | symbol>
    ? { [K in keyof ObjectFromList<P, unknown>]: K extends keyof T ? typeof Observe : typeof Undefined }
    : P,
  TProps extends Record<string, any> = {
    [K in keyof TMockProps]?: MockProps<
      TMockProps[K],
      never,
      TConstructorReturnType
    >;
  },
  TStaticProps extends Record<string, any> = {
    [K in keyof TMockProps]?: MockStaticProps<
      TMockProps[K],
      never,
      T
    >;
  },
  TConstructable = T extends Es5ClassDef<any>
    ? { new (...args: ConstructorParameters<T>): T }
    : T extends Es6ClassDef<any>
      ? InstanceType<T>
      : never
> = Es6Class<
  TConstructable,
  ConstructorParameters<T>,
  TProps
> &
  Omit<T, NotNeverKeys<TStaticProps>> &
  Pick<TStaticProps, NotNeverKeys<TStaticProps>> &
  MockClassMixin<TConstructable>;

// type check, never runs
if (0) {
  class X {
    constructor(x: number) {}
    a(a?: string) { return 'a' }
    b(b?: string) { return 'b' }
    c(c?: string) { return 'c' }
    get p(): string { return 'c' }
    set p(p: string) {}
    static A(a?: string) { return 'a' }
    static B(b?: string) { return 'b' }
    static C(c?: string) { return 'c' }
    static get P(): string { return 'c' }
    static set P(p: string) {}
  }
  
  function Y(y: number) {
  }

  Y.prototype = {
    a(a?: string) { return 'a' },
    b(b?: string) { return 'b' },
    c(c?: string) { return 'c' },
    get p(): string { return 'c' },
    set p(p: string) {},
  }

  Y.A = (a?: string) => { return 'a' };
  Y.B = (b?: string) => { return 'b' };
  Y.C = (c?: string) => { return 'c' };
  // static get P(): string { return 'c' }
  // static set P(p: string) {}

  const m: _Mock = null;
  const E = m.override(X, {
    B: StaticMethod(() => 1),
    C: StaticMethod(Observe),
    P: StaticProperty().get(2),
    Q: StaticProperty().get(3),
    R: StaticProperty().get(Custom(4)),
    X: StaticMethod(Null),
    Y: StaticMethod(This),
    Z: StaticMethod(Undefined),
    S: StaticMethod(Custom(() => 1)),
    b: 1,
    c: Observe,
    p: Property().get(2),
    q: Property().get(3),
    r: Property().get(Custom(4)),
    x: Null,
    y: This,
    z: Undefined,
    s: Custom(() => 1),
  });
  E.A() === 'a';
  E.B() === 1;
  E.C() === 'c';
  E.P === 2;
  E.Q === 3;
  E.R === 4;
  E.X() === null;
  E.Y();
  E.Z() === undefined;
  E.S();
  const e = new E(1);
  e.a() === 'a';
  e.b() === 1;
  e.c() === 'c';
  e.p === 2;
  e.q === 3;
  e.r === 4;
  e.x() === null;
  e.y();
  e.z() === undefined;
  e.s();
}

export class _Mock {
  explicitInstance: boolean;

  private _history: History;
  private _fixturePop: any;

  get fixturePop() {
    if (!this._fixturePop) {
      throw new Error('Mock observer must be defined in linked history before "Fixture" reference can be used');
    }

    return this._fixturePop;
  }

  get history() {
    return this._history;
  }

  constructor(history?: History) {
    this._history = history;

    if (history && history.observer) {
      this._fixturePop = history.observer.env.fixture.pop.bind(history.observer.env.fixture);
    }
  }

  setExplicitInstance() {
    this.explicitInstance = true;

    return this;
  }

  by<T extends ClassDef<any>, P extends ReadonlyArray<string | number | symbol> | MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ): MockClass<T, P> {
    const maker = new ClassMaker(this, cls, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(maker.makeConstructor(cls, true, this.explicitInstance));

    return clazz;
  }

  from<P extends ReadonlyArray<string | number | symbol> | MockPropsMap>(props: P, bypassOnBehalfOfInstanceReplacement?): MockClass<{ new (): any }, P> {
    const maker = new ClassMaker(this, function () {}, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(maker.makeConstructor(maker.cls, true, this.explicitInstance), true);

    return clazz;
  }

  override<T extends ClassDef<any>, P extends ReadonlyArray<string | number | symbol> | MockPropsMap = (keyof T)[]>(
    cls: T,
    props?: P,
    bypassOnBehalfOfInstanceReplacement?,
  ): MockClass<T, P> {
    const maker = new ClassMaker(this, cls, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(cls, true);

    clazz.RESTORE = cls.prototype.constructor.RESTORE = () => {
      Object.entries<any>(maker.clsPropsDescriptors).forEach(([ key, descriptor ]) => {
        if (descriptor.level === 0) {
          Object.defineProperty(cls, key, descriptor.descriptor);
        } else {
          delete cls[key];
        }
      });
      maker.propsMetadata.extraStaticProps.forEach((key) => { delete cls[key]; });

      Object.entries<any>(maker.clsProtoPropsDescriptors).forEach(([ key, descriptor ]) => {
        if (descriptor.level === 0) {
          Object.defineProperty(cls.prototype, key, descriptor.descriptor);
        } else {
          delete cls.prototype[key];
        }
      });
      maker.propsMetadata.extraProps.forEach((key) => { delete cls.prototype[key]; });

      delete (cls as any).OBSERVER;
      delete (cls as any).RESTORE;
      delete (cls as any).prototype.constructor.RESTORE;

      return cls;
    };

    return clazz;
  }

  spy<T extends Fn>(fn: T): T {
    return spyOnFunction(fn, {
      argsAnnotation: fn,
      extra: {
        name: fn.name,
        type: 'single',
      },
      origin: fn,
      onCall: (context, state) => {
        if (this._history) {
          this._history.push(state);
        }
      }
    });
  }
}

export function Mock(history?: History) {
  return new _Mock(history);
}

export type PropertyDescriptor<T = any> = {
  get?: any;
  set?: any;
  value?: T;
};

export class _Property<T extends MockPropsTypes = typeof Observe> {
  readonly descriptor: PropertyDescriptor<T>;

  constructor(get?: T, set?: T) {
    this.descriptor = { get, set };
  }

  get<U extends MockPropsTypes = _Property<T>['descriptor']['value']>(get: U): _Property<U> {
    this.descriptor.get = get;

    return this as unknown as _Property<U>;
  }

  set(set: MockPropsTypes): _Property<T> {
    this.descriptor.set = set;

    return this;
  }

  private __property() {}
}

export function Property<T extends MockPropsTypes = typeof Observe>(get?: T, set?: T) {
  return new _Property<T>(get, set);
}

export class _StaticMethod<T extends MockPropsTypes = typeof Observe> {
  constructor(public readonly fn?: T) {

  }

  private __staticMethod() {}
}

export function StaticMethod<T extends MockPropsTypes = typeof Observe>(fn?: _StaticMethod<T>['fn']) {
  return new _StaticMethod<T>(fn);
};

export class _StaticProperty<T extends MockPropsTypes = typeof Observe> {
  readonly descriptor: PropertyDescriptor<T>;

  constructor(get?: T, set?: T) {
    this.descriptor = { get, set };
  }

  get<U extends MockPropsTypes = _StaticProperty<T>['descriptor']['value']>(get: U): _StaticProperty<U> {
    this.descriptor.get = get;

    return this as unknown as _StaticProperty<U>;
  }

  set(set: MockPropsTypes): _StaticProperty<T> {
    this.descriptor.set = set;

    return this;
  }

  private __staticProperty() {}
}

export function StaticProperty<T extends MockPropsTypes = typeof Observe>(get?: T, set?: T) {
  return new _StaticProperty<T>(get, set);
}

export class _Custom<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Null> {
  _argsAnnotation: string[];
  _epoch: string;
  _exclude: boolean;

  constructor(public readonly value: T = Null as T) {
    if (value instanceof _Custom) {
      this.value = value.value as unknown as T;
    }
  }

  argsAnnotation(argsAnnotation: _Custom<T>['_argsAnnotation']): this {
    this._argsAnnotation = argsAnnotation;

    return this;
  }

  epoch(epoch: _Custom<T>['_epoch']): this {
    this._epoch = epoch;

    return this;
  }

  exclude(): this {
    this._exclude = true;

    return this;
  }

  private __custom() {}
}

export function Custom<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Null>(value: T = Null as T) {
  return new _Custom<T>(value);
}

export function ArgsAnnotation<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Observe>(argsAnnotation: _Custom<T>['_argsAnnotation'], value: T = Observe as T) {
  return new _Custom<T>(value).argsAnnotation(argsAnnotation);
}

export function Epoch<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Observe>(epoch: _Custom<T>['_epoch'], value: T = Observe as T) {
  return new _Custom<T>(value).epoch(epoch);
}

export function Exclude<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Observe>(value: T = Observe as T) {
  return new _Custom<T>(value).exclude();
}

const CLASS_NATIVE_PROPS = [ 'arguments', 'callee', 'caller', 'length', 'name', 'prototype' ];

export class ClassMaker {
  private _bypassOnBehalfOfInstanceReplacement: boolean;
  private _cls: any;
  private _clsConstructorName: string;
  private _clsProps: any;
  private _clsPropsDescriptors: any;
  private _clsProtoPropsDescriptors: any;
  private _clsProtoScope: any;
  private _mock: any;
  private _props: any;
  private _propsMetadata: any;

  get cls() {
    return this._cls;
  }

  get clsConstructorName() {
    return this._clsConstructorName;
  }

  get clsPropsDescriptors() {
    return this._clsPropsDescriptors;
  }

  get clsProtoPropsDescriptors() {
    return this._clsProtoPropsDescriptors;
  }

  get propsMetadata() {
    return this._propsMetadata;
  }

  constructor(mock, cls, props, bypassOnBehalfOfInstanceReplacement) {
    if (typeof cls !== 'function') {
      throw new Error('Class constructor must be function');
    }

    this._bypassOnBehalfOfInstanceReplacement = bypassOnBehalfOfInstanceReplacement;
    this._cls = cls;
    this._clsConstructorName = cls.prototype.hasOwnProperty('constructor') ? cls.prototype.constructor.name : cls.name;
    this._clsProps = copyScope(cls, { enumerable: true }, 1);
    this._clsProps = Object.keys(this._clsProps).filter((key) => {
      return CLASS_NATIVE_PROPS.indexOf(key) === - 1;
    }).reduce((acc, key) => {
      Object.defineProperty(acc, key, Object.getOwnPropertyDescriptor(this._clsProps, key));

      return acc;
    }, {});
    this._clsPropsDescriptors = copyScopeDescriptors(cls);
    this._clsProtoPropsDescriptors = copyScopeDescriptors(cls.prototype);
    this._clsProtoScope = copyScope(cls.prototype);
    this._mock = mock;

    if (!props) {
      props = Object.getOwnPropertyNames(cls.prototype);

      props.push('constructor');
    }

    this._props = Array.isArray(props)
      ? props.reduce((acc, key) => {
        if (key in this._clsProtoPropsDescriptors) {
          const descriptor = this._clsProtoPropsDescriptors[key];

          switch (descriptor.type) {
          case 'function':
            acc[key] = cls;

            break;

          default:
            acc[key] = Property(descriptor.descriptor.get, descriptor.descriptor.set);
          }
        } else {
          acc[key] = cls;
        }

        return acc;
      }, {})
      : props;

    this._propsMetadata = { extraStaticProps: [], extraProps: [] };
  }

  makeConstructor(cls, useOriginPrototype, explicitInstance) {
    if (typeof cls !== 'function') {
      throw new Error('Class constructor must be function');
    }

    let custom;
    let rep;

    if (this._props.hasOwnProperty('constructor')) {
      custom = maybeCustom(this._props.constructor);

      rep = classMakerGetReplacement(
        maybeCustomValueOrInitial(this._props.constructor),
        'constructor',
        this._cls,
        this._clsProtoScope,
        this._propsMetadata
      );

      cls = spyOnFunction(copyConstructor(rep), Object.assign({
        argsAnnotation: this._cls,
        extra: {
          name: this._clsConstructorName,
          type: 'constructor',
        },
        origin: cls,
        replacement: rep,
        onCall: (context, state) => {
          if (this._mock._history) {
            this._mock._history.push(state);
          }
        },
      }, custom || {}), true);
    } else {
      cls = copyConstructor(cls, explicitInstance);
    }

    Object.keys(this._clsProps).forEach((key) => {
      Object.defineProperty(cls, key, this._clsPropsDescriptors[key].descriptor);
    });

    Object.defineProperty(cls, 'name', { value: this._cls.name, writable: false });

    if (!useOriginPrototype) {
      cls.prototype = copyPrototype(this._cls);
    } else {
      cls.prototype = this._cls.prototype;
    }

    cls.COPY_OF = this._cls;

    return cls;
  }

  makePrototypeFor(cls, useOriginPrototype?) {
    if (typeof cls !== 'function') {
      throw new Error('Class constructor must be function');
    }

    Object.defineProperty(cls, 'name', { value: this._cls.name, writable: false });

    if (!useOriginPrototype) {
      cls.prototype = copyPrototype(this._cls);
    } else if (cls.prototype !== this._cls.prototype) {
      cls.prototype = this._cls.prototype;
    }

    Object.keys(this._props).forEach((key) => {
      if (key === 'constructor') {
        return;
      }

      let custom = null;
      let customGet = null;
      let customSet = null;
      let rep = null;
      let repDescriptor = null;

      if (this._props[key] instanceof _StaticProperty) {
        customGet = maybeCustom(this._props[key].descriptor.get);
        customSet = maybeCustom(this._props[key].descriptor.set);
        repDescriptor = {};

        if (this._props[key].descriptor.get) {
          repDescriptor.get = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.get),
            key,
            this._cls,
            this._clsProps,
            this._propsMetadata.extraStaticProps
          );

          if (repDescriptor.get === this._cls) {
            repDescriptor.get = this._clsPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture._Fixture) {
            repDescriptor.get = this._mock.fixturePop;
          }
        }

        if (this._props[key].descriptor.set) {
          repDescriptor.set = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.set),
            key,
            this._cls,
            this._clsProps,
            this._propsMetadata.extraStaticProps
          );

          if (repDescriptor.set === this._cls) {
            repDescriptor.set = this._clsPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture._Fixture) {
            repDescriptor.set = this._mock.fixturePop;
          }
        }

        spyOnStaticDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          get: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'staticGetter',
            },
            origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.get,
            replacement: this._props[key].descriptor.get,
          }, customGet ?? {}),
          set: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'staticSetter',
            },
            origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          }, customSet ?? {}),
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        });
      } else if (this._props[key] instanceof _Property) {
        customGet = maybeCustom(this._props[key].descriptor.get);
        customSet = maybeCustom(this._props[key].descriptor.set);
        repDescriptor = {};

        if (this._props[key].descriptor.get) {
          repDescriptor.get = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.get),
            key,
            this._cls,
            this._clsProtoScope,
            this._propsMetadata.extraProps
          );

          if (repDescriptor.get === this._cls) {
            repDescriptor.get = this._clsProtoPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture._Fixture) {
            repDescriptor.get = this._mock.fixturePop;
          }
        }

        if (this._props[key].descriptor.set) {
          repDescriptor.set = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.set),
            key,
            this._cls,
            this._clsProtoScope,
            this._propsMetadata.extraProps
          );

          if (repDescriptor.set === this._cls) {
            repDescriptor.set = this._clsProtoPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture._Fixture) {
            repDescriptor.set = this._mock.fixturePop;
          }
        }

        spyOnDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          get: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'getter',
            },
            origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.get,
            replacement: this._props[key].descriptor.get,
          }, customGet ?? {}),
          set: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'setter',
            },
            origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          }, customSet ?? {}),
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        });
      } else if (this._props[key] instanceof _StaticMethod) {
        custom = maybeCustom(this._props[key].fn);

        rep = classMakerGetReplacement(
          maybeCustomValueOrInitial(this._props[key].fn),
          key,
          this._cls,
          this._clsProps,
          this._propsMetadata.extraStaticProps
        );

        if (rep === this._cls) {
          rep = this._clsPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture._Fixture) {
          rep = this._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', { value: key, writable: false });

        spyOnStaticMethod(cls, key, rep, Object.assign({
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: this._clsConstructorName + '.' + key,
            type: 'staticMethod',
          },
          origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        }, custom ?? {}));
      } else {
        custom = maybeCustom(this._props[key]);

        rep = classMakerGetReplacement(
          maybeCustomValueOrInitial(this._props[key]),
          key,
          this._cls,
          this._clsProtoScope,
          this._propsMetadata.extraProps
        );

        if (rep === this._cls) {
          rep = this._clsProtoPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture._Fixture) {
          rep = this._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', { value: key, writable: false });

        spyOnMethod(cls, key, rep, Object.assign({
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: this._clsConstructorName + '.' + key,
            type: 'method',
          },
          origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        }, custom ?? {}));
      }
    });

    return cls;
  }
}

function classMakerGetReplacement(prop, key, obj, objProps, extraProps) {
  if (
    prop === Initial ||
    prop === Observe ||
    getAncestors(obj).indexOf(prop) !== - 1 ||
    getAncestors(obj.COPY_OF).indexOf(prop) !== - 1
  ) {
    if (!(key in objProps)) {
      prop = Undefined;
    } else {
      return obj; // as reference to object self-defined property
    }
  }

  if (! (key in objProps)) {
    extraProps.push(key);
  }

  if (prop === Null) {
    return function () { return null; };
  }

  if (prop === Undefined) {
    return function () {};
  }

  if (prop === fixture._Fixture) {
    return fixture._Fixture;
  }

  if (prop instanceof fixture._Fixture) {
    return prop.pop.bind(prop);
  }

  if (prop === This) {
    return function () { return this; }
  }

  if (typeof prop === 'function') {
    return prop;
  }

  return function () { return prop; };
}

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}


function maybeCustom(ref: unknown) {
  return ref instanceof _Custom
    ? ref
    : null;
}

function maybeCustomValueOrInitial(ref: unknown) {
  return ref instanceof _Custom
    ? ref.value
    : ref;
}
