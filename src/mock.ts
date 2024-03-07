import * as fixture from './fixture';
import { spyOnDescriptor, spyOnStaticDescriptor, spyOnFunction, spyOnMethod, spyOnStaticMethod, State, StateReportType, StateType } from './spy';
import { copyConstructor, copyPrototype, copyScope, copyScopeDescriptors, getAncestors } from './instance';
import { _History } from './history';
import { ClassDef, ConstructorParameters, ConstructorReturnType, Es5ClassDef, Es6Class, Es6ClassDef, Fn, NotNeverKeys, ObjectFromList } from './utils';
import { _Observer } from './observer';
import { _Processor, ProcessorChecker, ProcessorSerializer } from './processor';

export class Observe { private constructor() {} private __observe() {} };
export const Initial = Observe;
export class This { private constructor() {} private __this() {} };
export class Null { private constructor() {} private __null() {} };
export class Undefined { private constructor() {} private __undefined() {} };

export type Extract<T, TSelf = never> = ExtractCustom<ExtractFixture<T, TSelf>>

export type ExtractCustom<T> = T extends _Custom<any>
  ? T['value']
  : T;

export type ExtractFixture<T, TSelf = never> = T extends fixture._Fixture<any>
  ? ReturnType<T['pop']>
  : T extends typeof fixture.Fixture | typeof fixture._Fixture ? TSelf : T;

export type PropertyType<T> = T extends _Property<any>
  ? Extract<T['descriptor']['value']> extends Fn<any>
    ? ReturnType<Extract<T['descriptor']['value']>>
    : T['descriptor']['value']
  : T;

export type StaticPropertyType<T> = T extends _StaticProperty<any>
  ? Extract<T['descriptor']['value']> extends Fn<any>
    ? ReturnType<Extract<T['descriptor']['value']>>
    : T['descriptor']['value']
  : T;

export type Placeholder<T, TSelf = never> = T extends typeof Observe | typeof Initial
  ? never
  : T extends typeof This
    ? TSelf
    : T extends typeof Null // same as "null"
      ? null
      : T extends typeof Function | typeof Undefined // same as "undefined"
        ? undefined
        : T;

export type PlaceholderFn<T, TSelf = never> = T extends typeof Observe | typeof Initial
  ? never
  : T extends typeof This
    ? Fn<TSelf>
    : T extends typeof Null // same as "null"
      ? Fn<null>
      : T extends typeof Function | typeof Undefined // same as "undefined"
        ? Fn<undefined>
        : T extends Fn ? T : Fn<T>;

export type Integrated =
  number |
  bigint |
  boolean |
  string |
  symbol |
  object;

export type AllPlaceholders = typeof Function | typeof Initial | typeof Observe | typeof This | typeof Null | typeof Undefined;

export type StubPlaceholders = typeof Function | typeof This | typeof Null | typeof Undefined;

export type MockProps<T, U = never, TSelf = never> = T extends _Property<any>
  ? Placeholder<Extract<PropertyType<T>>, TSelf>
  : Extract<T> extends Integrated | StubPlaceholders
    ? PlaceholderFn<Extract<T>, TSelf>
    : U;

export type MockStaticProps<T, U = never, TSelf = never> = T extends _StaticProperty<any>
  ? Placeholder<Extract<StaticPropertyType<T>>, TSelf>
  : T extends _StaticMethod<any>
    ? PlaceholderFn<Extract<T['fn']>, TSelf>
    : U;

export type MockPropsTypes = Integrated |
  AllPlaceholders |
  fixture._Fixture |
  typeof fixture._Fixture |
  typeof fixture.Fixture |
  _Custom<any>;

export type MockPropsMap = Record<
  string,
  MockPropsTypes | _Property<any> | _StaticMethod<any> | _StaticProperty<any>
>;

export type MockClassMixin<T> = {
  OBSERVER?: _Observer;
  RESTORE?: () => T;
}

export type MockClassBase<
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
  Pick<TStaticProps, NotNeverKeys<TStaticProps>>;

export type MockClass<
  T extends ClassDef<any> = Es6Class<any>,
  P extends ReadonlyArray<string | number | symbol> | MockPropsMap = (keyof T)[],
> = MockClassBase<T, P> & MockClassMixin<MockClassBase<T, P>>;

// type check, never runs
if (0) {
  function assert<A, B extends A>(a: A, b: B) {

  }

  /* eslint-disable unused-imports/no-unused-vars */
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
  const E = m.by(X, {
    B: StaticMethod(() => 1),
    C: StaticMethod(Observe),
    F: StaticMethod(fixture.Fixture(1)),
    P: StaticProperty().get(2),
    Q: StaticProperty().get(3),
    R: StaticProperty().get(Custom(4)),
    S: StaticMethod(Custom(() => 1)),
    T: StaticProperty().get(fixture.Fixture(1)),
    X: StaticMethod(Null),
    Y: StaticMethod(This),
    Z: StaticMethod(Undefined),
    b: 1,
    c: Observe,
    f: fixture.Fixture(1),
    p: Property().get(2),
    q: Property().get(3),
    r: Property().get(Custom(4)),
    s: Custom(() => 1),
    t: Property().get(fixture.Fixture(1)),
    x: Null,
    y: This,
    z: Undefined,
  });
  assert(E.A(), 'a');
  assert(E.B(), 1);
  assert(E.C(), 'c');
  assert(E.F(), 1);
  assert(E.P, 2);
  assert(E.Q, 3);
  assert(E.R, 4);
  assert(E.S(), 1);
  assert(E.T, 1);
  assert(E.X(), null);
  assert(E.Y(), X);
  assert(E.Z(), undefined);
  const e = new E(1);
  assert(e.a(), 'a');
  assert(e.b(), 1);
  assert(e.c(), 'c');
  assert(e.f(), 1);
  assert(e.p, 2);
  assert(e.q, 3);
  assert(e.r, 4);
  assert(e.s(), 1);
  assert(e.t, 1);
  assert(e.x(), null);
  assert(e.y(), new X(1));
  assert(e.z(), undefined);

  assert(E.RESTORE(), E);
  /* eslint-enable */
}

export class _Mock {
  explicitInstance: boolean;

  private _callArgsProcessor = new _Processor();
  private _returnValueProcessor = new _Processor();
  private _currentProcessor = null;

  private _history: _History;
  private _fixturePop: any;

  get callArgsProcessor() {
    return this._callArgsProcessor.processors.length ? this._callArgsProcessor : null;
  }

  get returnValueProcessor() {
    return this._returnValueProcessor.processors.length ? this._returnValueProcessor : null;
  }

  get fixturePop() {
    if (!this._fixturePop) {
      throw new Error('Mock observer must be defined in linked history before "Fixture" reference can be used');
    }

    return this._fixturePop;
  }

  get history() {
    return this._history;
  }

  get onCallArgs() {
    this._currentProcessor = this._callArgsProcessor;

    return this;
  }

  get onReturnValue() {
    this._currentProcessor = this._returnValueProcessor;

    return this;
  }

  constructor(history?: _History) {
    this._currentProcessor = this._callArgsProcessor;
    this._history = history;

    if (history && history.observer) {
      this._fixturePop = history.observer.env.fixture.pop.bind(history.observer.env.fixture);
    }
  }

  setExplicitInstance() {
    this.explicitInstance = true;

    return this;
  }

  addProcessor(checker: ProcessorChecker, serializer?: ProcessorSerializer) {
    this._currentProcessor.add(checker, serializer);

    return this;
  }

  addClassOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._currentProcessor.classOf(cls, serializer);

    return this;
  }

  addInstanceOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._currentProcessor.instanceOf(cls, serializer);

    return this;
  }

  addNullProcessor(serializer?: ProcessorSerializer) {
    this._currentProcessor.null(serializer);

    return this;
  }

  addPathProcessor(path: string, serializer: ProcessorSerializer) {
    this._currentProcessor.path(path, serializer);

    return this;
  }

  addRegexPathProcessor(regex: string | RegExp, serializer: ProcessorSerializer) {
    this._currentProcessor.regexPath(regex, serializer);

    return this;
  }

  addUndefinedProcessor(serializer?: ProcessorSerializer) {
    this._currentProcessor.undefined(serializer);

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
        type: StateType.SINGLE,
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

export function Mock(history?: _History) {
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

export interface ICustomEnv {
  argsAnnotation: string[] | Fn;
  callArgsProcessor: _Processor;
  epoch: string;
  exclude: boolean;
  returnValueProcessor: _Processor;
}

export class _Custom<T extends Exclude<MockPropsTypes, _Custom<any>> = typeof Null> {
  private _argsAnnotation: ICustomEnv['argsAnnotation'];
  private _epoch: ICustomEnv['epoch'];
  private _exclude: ICustomEnv['exclude'];

  private _callArgsProcessor = new _Processor();
  private _returnValueProcessor = new _Processor();
  private _currentProcessor: _Processor = null;

  get callArgsProcessor() {
    return this._callArgsProcessor.processors.length ? this._callArgsProcessor : null;
  }

  get returnValueProcessor() {
    return this._returnValueProcessor.processors.length ? this._returnValueProcessor : null;
  }

  get env(): ICustomEnv {
    return {
      argsAnnotation: this._argsAnnotation,
      callArgsProcessor: this._callArgsProcessor,
      epoch: this._epoch,
      exclude: this._exclude,
      returnValueProcessor: this._returnValueProcessor,
    };
  }

  get onCallArgs() {
    this._currentProcessor = this._callArgsProcessor;

    return this;
  }

  get onReturnValue() {
    this._currentProcessor = this._returnValueProcessor;

    return this;
  }

  constructor(public readonly value: T = Null as T) {
    if (value instanceof _Custom) {
      this.value = value.value as unknown as T;
    }

    this._callArgsProcessor = this._callArgsProcessor;
  }

  addProcessor(checker: ProcessorChecker, serializer?: ProcessorSerializer) {
    this._currentProcessor.add(checker, serializer);

    return this;
  }

  addClassOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._currentProcessor.classOf(cls, serializer);

    return this;
  }

  addInstanceOfProcessor(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    this._currentProcessor.instanceOf(cls, serializer);

    return this;
  }

  addNullProcessor(serializer?: ProcessorSerializer) {
    this._currentProcessor.null(serializer);

    return this;
  }

  addPathProcessor(path: string, serializer: ProcessorSerializer) {
    this._currentProcessor.path(path, serializer);

    return this;
  }

  addRegexPathProcessor(regex: string | RegExp, serializer: ProcessorSerializer) {
    this._currentProcessor.regexPath(regex, serializer);

    return this;
  }

  addUndefinedProcessor(serializer?: ProcessorSerializer) {
    this._currentProcessor.undefined(serializer);

    return this;
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
  private _clsProtoProps: any;
  private _clsPropsDescriptors: any;
  private _clsProtoPropsDescriptors: any;
  private _mock: _Mock;
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

  constructor(mock: _Mock, cls, props, bypassOnBehalfOfInstanceReplacement) {
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
    this._clsProtoProps = copyScope(cls.prototype);
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

    let custom: _Custom;
    let rep;

    if (this._props.hasOwnProperty('constructor')) {
      custom = maybeCustom(this._props.constructor);

      rep = classMakerGetReplacement(
        maybeCustomValueOrInitial(this._props.constructor),
        'constructor',
        this._cls,
        this._clsProtoProps,
        this._propsMetadata
      );

      cls = spyOnFunction(copyConstructor(rep), {
        argsAnnotation: custom?.env.argsAnnotation ?? this._cls,
        exclude: custom?.env.exclude,
        extra: {
          name: this._clsConstructorName,
          type: StateType.CONSTRUCTOR,
        },
        origin: cls,
        replacement: rep,
        onCall: (context, state) => {
          if (this._mock.history) {
            this._mock.history.push(classMakerProcessState(
              state,
              custom?.callArgsProcessor ?? this._mock.callArgsProcessor,
              custom?.returnValueProcessor ?? this._mock.returnValueProcessor,
            ));
          }
        },
      }, true);
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

      let custom: _Custom = null;
      let customGet: _Custom = null;
      let customSet: _Custom = null;
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

          repDescriptor.get = this.getFinalReplacementForGet(repDescriptor.get, key);
        }

        if (this._props[key].descriptor.set) {
          repDescriptor.set = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.set),
            key,
            this._cls,
            this._clsProps,
            this._propsMetadata.extraStaticProps
          );

          repDescriptor.set = this.getFinalReplacementForSet(repDescriptor.set, key);
        }

        spyOnStaticDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          get: {
            argsAnnotation: customGet?.env?.argsAnnotation,
            exclude: customGet?.env?.exclude,
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: StateType.STATIC_GETTER,
            },
            origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.get,
            replacement: this._props[key].descriptor.get,
          },
          set: {
            argsAnnotation: customSet?.env?.argsAnnotation,
            exclude: customSet?.env?.exclude,
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: StateType.STATIC_SETTER,
            },
            origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          },
          onCall: (context, state) => {
            if (this._mock.history) {
              this._mock.history.push(classMakerProcessState(
                state,
                (state.type === StateType.STATIC_GETTER ? customGet : customSet)?.callArgsProcessor ?? this._mock.callArgsProcessor,
                (state.type === StateType.STATIC_GETTER ? customGet : customSet)?.returnValueProcessor ?? this._mock.returnValueProcessor,
              ));
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
            this._clsProtoProps,
            this._propsMetadata.extraProps
          );

          repDescriptor.get = this.getFinalReplacementForProtoGet(repDescriptor.get, key);
        }

        if (this._props[key].descriptor.set) {
          repDescriptor.set = classMakerGetReplacement(
            maybeCustomValueOrInitial(this._props[key].descriptor.set),
            key,
            this._cls,
            this._clsProtoProps,
            this._propsMetadata.extraProps
          );

          repDescriptor.set = this.getFinalReplacementForProtoSet(repDescriptor.set, key);
        }

        spyOnDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          get: {
            argsAnnotation: customGet?.env?.argsAnnotation,
            exclude: customGet?.env?.exclude,
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: StateType.GETTER,
            },
            origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.get,
            replacement: this._props[key].descriptor.get,
          },
          set: {
            argsAnnotation: customSet?.env.argsAnnotation,
            exclude: customSet?.env.exclude,
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: StateType.SETTER,
            },
            origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          },
          onCall: (context, state) => {
            if (this._mock.history) {
              this._mock.history.push(classMakerProcessState(
                state,
                (state.type === StateType.GETTER ? customGet : customSet)?.callArgsProcessor ?? this._mock.callArgsProcessor,
                (state.type === StateType.GETTER ? customGet : customSet)?.returnValueProcessor ?? this._mock.returnValueProcessor,
              ));
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

        rep = this.getFinalReplacementForValue(rep, key);

        spyOnStaticMethod(cls, key, rep, {
          argsAnnotation: custom?.env?.argsAnnotation,
          exclude: custom?.env?.exclude,
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: this._clsConstructorName + '.' + key,
            type: StateType.STATIC_METHOD,
          },
          origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: (context, state) => {
            if (this._mock.history) {
              this._mock.history.push(classMakerProcessState(
                state,
                custom?.callArgsProcessor ?? this._mock.callArgsProcessor,
                custom?.returnValueProcessor ?? this._mock.returnValueProcessor,
              ));
            }
          },
        });
      } else {
        custom = maybeCustom(this._props[key]);

        rep = classMakerGetReplacement(
          maybeCustomValueOrInitial(this._props[key]),
          key,
          this._cls,
          this._clsProtoProps,
          this._propsMetadata.extraProps
        );

        rep = this.getFinalReplacementForProtoValue(rep, key);

        spyOnMethod(cls, key, rep, {
          argsAnnotation: custom?.env?.argsAnnotation,
          exclude: custom?.env?.exclude,
          bypassOnBehalfOfInstanceReplacement: this._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: this._clsConstructorName + '.' + key,
            type: StateType.METHOD,
          },
          origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: (context, state) => {
            if (this._mock.history) {
              this._mock.history.push(classMakerProcessState(
                state,
                custom?.callArgsProcessor ?? this._mock.callArgsProcessor,
                custom?.returnValueProcessor ?? this._mock.returnValueProcessor,
              ));
            }
          },
        });
      }
    });

    return cls;
  }

  private getFinalReplacementForGet(rep, key) {
    if (rep === this._cls) {
      rep = this._clsPropsDescriptors[key].descriptor.get;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
  }

  private getFinalReplacementForSet(rep, key) {
    if (rep === this._cls) {
      rep = this._clsPropsDescriptors[key].descriptor.set;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
  }

  private getFinalReplacementForValue(rep, key) {
    if (rep === this._cls) {
      rep = this._clsPropsDescriptors[key].descriptor.value;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
  }

  private getFinalReplacementForProtoGet(rep, key) {
    if (rep === this._cls) {
      rep = this._clsProtoPropsDescriptors[key].descriptor.get;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
  }

  private getFinalReplacementForProtoSet(rep, key) {
    if (rep === this._cls) {
      rep = this._clsProtoPropsDescriptors[key].descriptor.set;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
  }

  private getFinalReplacementForProtoValue(rep, key) {
    if (rep === this._cls) {
      rep = this._clsProtoPropsDescriptors[key].descriptor.value;
    } else if (rep === fixture.Fixture || rep === fixture._Fixture) {
      rep = this._mock.fixturePop;
    } else {
      Object.defineProperty(rep, 'name', { value: key, writable: false });
    }

    return rep;
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

  if (!(key in objProps)) {
    extraProps.push(key);
  }

  if (prop === Null) {
    return function () { return null; };
  }

  if (prop === Function || prop === Undefined) {
    return function () {};
  }

  if (prop === fixture._Fixture || prop === fixture.Fixture) {
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

function classMakerProcessState(
  state: State,
  callArgsProcessor: _Processor,
  returnValueProcessor: _Processor,
): State {
  if (callArgsProcessor && state.reportType === StateReportType.CALL_ARGS) {
    state.args = callArgsProcessor.serialize(state.args);
  } else if (returnValueProcessor) {
    state.result = returnValueProcessor.serialize(state.result);
  }

  return state;
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
