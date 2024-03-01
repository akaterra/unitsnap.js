import * as fixture from './fixture';
import { spyOnDescriptor, spyOnStaticDescriptor, spyOnFunction, spyOnMethod, spyOnStaticMethod } from './spy';
import * as typeHelpers from './type_helpers';
import { copyConstructor, copyPrototype, copyScope, copyScopeDescriptors, getAncestors } from './instance';
import { History } from './history';
import { ClassDef, Constructor, ConstructorParameters, Es5Class, Es6Class, Fn, IntermediateClass, Prototype } from './utils';
import { Observer } from './observer';

export type ExtractValue<T> = T extends _Custom<T> ? T['value'] : T;

export type Primitive = string | number | boolean | symbol | null | undefined;

export type MockPropsPrimitive<T, U = never> = T extends Primitive ? Fn<T> : T extends _Property ? ReturnType<T['descriptor']['get']> : U;

export type MockPropsFunc<T, U = never> = T extends Fn ? T : U;

export type MockPropsStaticPrimitive<T, U = never> = T extends _StaticProperty ? ReturnType<T['descriptor']['get']> : U;

export type MockPropsStaticFunc<T, U = never> = T extends _StaticMethod ? T['fn'] : U;

export type MockClassDef<
  T extends ClassDef<any> = Es6Class<any>,
  P extends keyof T | Record<string, any> = keyof T,
> = Es6Class<
  T extends Es5Class
    ? ReturnType<T> extends void ? any : ReturnType<T>
    : T extends Es6Class
      ? InstanceType<T>
      : never,
  ConstructorParameters<T>,
  P extends keyof T ? never : {
    [K in keyof MockProps<T, P>]?: MockPropsPrimitive<
      MockProps<T, P>[K],
      MockPropsFunc<MockProps<T, P>[K]>
    >;
  }
> & T & {
  [K in keyof MockProps<T, P>]?: MockPropsStaticPrimitive<
    MockProps<T, P>[K],
    MockPropsStaticFunc<MockProps<T, P>[K]>
  >;
};

export type MockClass<
  T extends ClassDef<any> = Es6Class<any>,
  P extends keyof T | Record<string, any> = keyof T,
> = MockClassDef<T, P> & {
  OBSERVER?: Observer;
  RESTORE?: () => T;
};

export type MockProps<
  T extends ClassDef<any> = Es6Class<any>,
  P extends keyof T | Record<string, any> = keyof T,
> = P extends keyof T ? {} : P;

// type check
if (0) {
  class X {
    constructor(x: number) {}
  
    a(a?: string) { return 'a' }

    d(d?: string) { return 'd' }
  }
  
  function Y(y: string) {
  
  }
  
  Y.prototype = {
    a(a?: string) { return 'a' }
  }

  const m: Mock = null;
  const E = m.override(X, { b: StaticMethod(() => 1), c: 1, d: 1 });
  E.b() === 1;
  const e = new E(1);
  e.a() === 'a';
  e.c() === 1;
  e.d() === 'd';
}

export class Mock {
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

  by<T extends Es5Class | Es6Class, P extends keyof T | Record<string, any>>(cls: T, props?: MockProps<T, P>, bypassOnBehalfOfInstanceReplacement?): MockClass<T, P> {
    const maker = new ClassMaker(this, cls, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(maker.makeConstructor(cls, true, this.explicitInstance));

    return clazz;
  }

  from(props: MockProps, bypassOnBehalfOfInstanceReplacement?): MockClass {
    const maker = new ClassMaker(this, function () {}, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(maker.makeConstructor(maker.cls, true, this.explicitInstance), true);

    return clazz;
  }

  override<T extends Es5Class | Es6Class, P extends keyof T | Record<string, any>>(cls: T, props?: MockProps<T, P>, bypassOnBehalfOfInstanceReplacement?): MockClass<T, P> {
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

  spy(fn: Fn): Fn {
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

export type PropertyDescriptor<T = any> = {
  get?: Fn<T>;
  set?: Fn<void, Parameters<(value: T) => void>>;
};

export class _Property<T = any> {
  constructor(public readonly descriptor: PropertyDescriptor<T> = {}) {

  }

  get(get: _Property<T>['descriptor']['get']): this {
    this.descriptor.get = get;

    return this;
  }

  set(set: _Property<T>['descriptor']['set']): this {
    this.descriptor.set = set;

    return this;
  }
}

export function Property<T extends ReturnType<_Property['descriptor']['get']>>(descriptor?: _Property<T>['descriptor']) {
  return new _Property<T>(descriptor);
}

export class _StaticMethod<T extends Fn = Fn> {
  constructor(public readonly fn?: T) {

  }
}

export function StaticMethod<T extends _StaticMethod['fn']>(fn?: _StaticMethod<T>['fn']) {
  return new _StaticMethod<T>(fn);
}

export class _StaticProperty<T = any> {
  constructor(public readonly descriptor: PropertyDescriptor<T> = {}) {

  }

  get(get: _StaticProperty<T>['descriptor']['get']): this {
    this.descriptor.get = get;

    return this;
  }

  set(set: _StaticProperty<T>['descriptor']['set']): this {
    this.descriptor.set = set;

    return this;
  }
}

export function StaticProperty<T extends ReturnType<_StaticProperty['descriptor']['get']>>(descriptor?: _StaticProperty<T>['descriptor']) {
  return new _StaticProperty<T>(descriptor);
}

export class _Custom<T = any> {
  _argsAnnotation: string[];
  _epoch: string;
  _exclude: boolean;

  constructor(public readonly value?: T) {
    if (value instanceof _Custom) {
      this.value = new _Custom<T>(value.value) as unknown as T;
    }
  }

  argsAnnotation(argsAnnotation: _Custom['_argsAnnotation']): this {
    this._argsAnnotation = argsAnnotation;

    return this;
  }

  epoch(epoch: _Custom['_epoch']): this {
    this._epoch = epoch;

    return this;
  }

  exclude(): this {
    this._exclude = true;

    return this;
  }
}

export function Custom<T = any>(value?: T) {
  return new _Custom<T>(value);
};

export function ArgsAnnotation<T = any>(argsAnnotation: _Custom<T>['_argsAnnotation'], value?: T) {
  return new _Custom<T>(value).argsAnnotation(argsAnnotation);
}

export function Epoch<T = any>(epoch: _Custom<T>['_epoch'], value?: T) {
  return new _Custom<T>(value).epoch(epoch);
}

export function Exclude<T = any>(value?: T) {
  return new _Custom<T>(value).exclude();
}

export const Initial = Symbol('Initial');
export const Observe = Initial;
export const This = Symbol('This');
export const Null = Symbol('Null');
export const Undefined = Symbol('Undefined');

const CLASS_NATIVE_PROPS = ['arguments', 'callee', 'caller', 'length', 'name', 'prototype'];

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
    this._clsProps = copyScope(cls, {enumerable: true}, 1);
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

    if (! props) {
      props = Object.getOwnPropertyNames(cls.prototype);

      props.push('constructor');
    }

    this._props = Array.isArray(props)
      ? props.reduce((acc, key) => {
        if (key in this._clsProtoPropsDescriptors) {
          let descriptor = this._clsProtoPropsDescriptors[key];

          switch (descriptor.type) {
            case 'function':
              acc[key] = cls;

              break;

            default:
              acc[key] = new Property(descriptor.descriptor);
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
      if (this._props.constructor instanceof Custom) {
        custom = this._props.constructor;
      }

      rep = classMakerGetReplacement(
        custom ? custom.value : this._props.constructor,
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

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

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

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

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

      if (this._props[key] instanceof StaticProperty) {
        repDescriptor = {};

        if (this._props[key].descriptor.get) {
          if (this._props[key].descriptor.get instanceof Custom) {
            customGet = this._props[key].descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : this._props[key].descriptor.get,
            key,
            this._cls,
            this._clsProps,
            this._propsMetadata.extraStaticProps
          );

          if (repDescriptor.get === this._cls) {
            repDescriptor.get = this._clsPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = this._mock.fixturePop;
          }
        }

        if (this._props[key].descriptor.set) {
          if (this._props[key].descriptor.set instanceof Custom) {
            customSet = this._props[key].descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : this._props[key].descriptor.set,
            key,
            this._cls,
            this._clsProps,
            this._propsMetadata.extraStaticProps
          );

          if (repDescriptor.set === this._cls) {
            repDescriptor.set = this._clsPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
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
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'staticSetter',
            },
            origin: hasOwnProperty(this._clsPropsDescriptors, key) && this._clsPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          }, customSet || {}),
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        });
      } else if (this._props[key] instanceof Property) {
        repDescriptor = {};

        if (this._props[key].descriptor.get) {
          if (this._props[key].descriptor.get instanceof Custom) {
            customGet = this._props[key].descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : this._props[key].descriptor.get,
            key,
            this._cls,
            this._clsProtoScope,
            this._propsMetadata.extraProps
          );

          if (repDescriptor.get === this._cls) {
            repDescriptor.get = this._clsProtoPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = this._mock.fixturePop;
          }
        }

        if (this._props[key].descriptor.set) {
          if (this._props[key].descriptor.set instanceof Custom) {
            customSet = this._props[key].descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : this._props[key].descriptor.set,
            key,
            this._cls,
            this._clsProtoScope,
            this._propsMetadata.extraProps
          );

          if (repDescriptor.set === this._cls) {
            repDescriptor.set = this._clsProtoPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
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
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: this._clsConstructorName + '.' + key,
              type: 'setter',
            },
            origin: hasOwnProperty(this._clsProtoPropsDescriptors, key) && this._clsProtoPropsDescriptors[key].descriptor.set,
            replacement: this._props[key].descriptor.set,
          }, customSet || {}),
          onCall: (context, state) => {
            if (this._mock._history) {
              this._mock._history.push(state);
            }
          },
        });
      } else if (this._props[key] instanceof StaticMethod) {
        if (this._props[key].value instanceof Custom) {
          custom = this._props[key].value;
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : this._props[key].value,
          key,
          this._cls,
          this._clsProps,
          this._propsMetadata.extraStaticProps
        );

        if (rep === this._cls) {
          rep = this._clsPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = this._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

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
        }, custom || {}));
      } else {
        if (this._props[key] instanceof Custom) {
          custom = this._props[key];
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : this._props[key],
          key,
          this._cls,
          this._clsProtoScope,
          this._propsMetadata.extraProps
        );

        if (rep === this._cls) {
          rep = this._clsProtoPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = this._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

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
        }, custom || {}));
      }
    });

    return cls;
  }
}

function classMakerGetReplacement(prop, key, obj, objProps, extraProps) {
  if (prop === Initial || getAncestors(obj).indexOf(prop) !== - 1 || getAncestors(obj.COPY_OF).indexOf(prop) !== - 1) {
    if (!(key in objProps)) {
      prop = Function;
    } else {
      return obj; // as reference to object self-defined property
    }
  }

  if (! (key in objProps)) {
    extraProps.push(key);
  }

  if (prop === Function) {
    return function () {};
  }

  if (prop === fixture.Fixture) {
    return fixture.Fixture;
  }

  if (prop instanceof fixture.Fixture) {
    return prop.pop.bind(prop);
  }

  if (prop === typeHelpers.This) {
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
