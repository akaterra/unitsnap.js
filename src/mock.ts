import * as fixture from './fixture';
import { spyOnDescriptor, spyOnStaticDescriptor, spyOnFunction, spyOnMethod, spyOnStaticMethod } from './spy';
import * as typeHelpers from './type_helpers';
import { copyConstructor, copyPrototype, copyScope, copyScopeDescriptors, getAncestors } from './instance';
import { History } from './history';

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

  constructor(history) {
    this._history = history;

    if (history && history._observer) {
      this._fixturePop = history._observer._fixture.pop.bind(history._observer._fixture);
    }
  }

  setExplicitInstance() {
    this.explicitInstance = true;

    return this;
  }

  by(cls, props, bypassOnBehalfOfInstanceReplacement) {
    const maker = new ClassMaker(this, cls, props, bypassOnBehalfOfInstanceReplacement);

    return maker.makePrototypeFor(maker.makeConstructor(cls, true, this.explicitInstance));
  }

  from(props, bypassOnBehalfOfInstanceReplacement) {
    const maker = new ClassMaker(this, function () {}, props, bypassOnBehalfOfInstanceReplacement);

    return maker.makePrototypeFor(maker.makeConstructor(maker.cls, true, this.explicitInstance), true);
  }

  override(cls, props, bypassOnBehalfOfInstanceReplacement) {
    const maker = new ClassMaker(this, cls, props, bypassOnBehalfOfInstanceReplacement);
    const clazz = maker.makePrototypeFor(cls, true);

    clazz.RESTORE = cls.prototype.constructor.RESTORE = function () {
      Object.keys(maker.clsPropsDescriptors).forEach(function (key) {
        var descriptor = maker.clsPropsDescriptors[key];

        if (descriptor.level === 0) {
          Object.defineProperty(cls, key, descriptor.descriptor);
        } else {
          delete cls[key];
        }
      });
      maker.propsMetadata.extraStaticProps.forEach(function (key) { delete cls[key]; });

      Object.keys(maker.clsPropsDescriptors).forEach(function (key) {
        var descriptor = maker.clsPropsDescriptors[key];

        if (descriptor.level === 0) {
          Object.defineProperty(cls.prototype, key, descriptor.descriptor);
        } else {
          delete cls.prototype[key];
        }
      });
      maker.propsMetadata.extraProps.forEach(function (key) { delete cls.prototype[key]; });

      delete cls.OBSERVER;
      delete cls.RESTORE;
      delete cls.prototype.constructor.RESTORE;

      return cls;
    };

    return clazz;
  }

  spy(fn) {
    var self = this;

    return spyOnFunction(fn, {
      argsAnnotation: fn,
      extra: {
        name: fn.name,
        type: 'single',
      },
      origin: fn,
      onCall: function (context, state) {
        if (self._history) {
          self._history.push(state);
        }
      }
    });
  }
}

export class Property {
  private descriptor: any;

  constructor(descriptor) {
    if (this instanceof Property) {
      this.descriptor = descriptor;
    } else {
      return new Property(descriptor || {});
    }
  }

  get(get) {
    this.descriptor.get = get;

    return this;
  }

  set(set) {
    this.descriptor.set = set;

    return this;
  }
}

export class StaticMethod {
  private value: any;

  constructor(value) {
    if (this instanceof StaticMethod) {
      this.value = value;
    } else {
      return new StaticMethod(value || Function);
    }
  }
}

export class StaticProperty {
  private descriptor: any;

  constructor(descriptor) {
    if (this instanceof StaticProperty) {
      this.descriptor = descriptor;
    } else {
      return new StaticProperty(descriptor || {});
    }
  }

  get(get) {
    this.descriptor.get = get;

    return this;
  }

  set(set) {
    this.descriptor.set = set;

    return this;
  }
}

export declare const Custom: {
  new (value): _Custom;
  (value): _Custom;
}

export class _Custom {
  private value: any;

  constructor(value) {
    if (this instanceof _Custom) {
      this.value = value;
    } else {
      return new _Custom(value || Function);
    }
  }

  argsAnnotation(argsAnnotation) {
    return new ArgsAnnotation(this.value, argsAnnotation);
  }

  epoch(epoch) {
    return new Epoch(this.value, epoch);
  }

  exclude() {
    return new Exclude(this.value);
  }
}

export declare const ArgsAnnotation: {
  new (value, argsAnnotation): _ArgsAnnotation;
  (value, argsAnnotation): _ArgsAnnotation;
}

export class _ArgsAnnotation {
  value: any;
  argsAnnotation: any;

  constructor(value, argsAnnotation) {
    if (this instanceof _ArgsAnnotation) {
      this.value = value;
      this.argsAnnotation = argsAnnotation;
    } else {
      return new _ArgsAnnotation(value, argsAnnotation);
    }
  }
}

export declare const Epoch: {
  new (value, epoch): _Epoch;
  (value, epoch): _Epoch;
}

export class _Epoch {
  value: any;
  epoch: any;

  constructor(value, epoch) {
    if (this instanceof _Epoch) {
      this.value = value;
      this.epoch = epoch;
    } else {
      return new _Epoch(value, epoch);
    }
  }
}

export declare const Exclude: {
  new (value): _Exclude;
  (value): _Exclude;
}

export class _Exclude {
  value: any;

  constructor(value) {
    if (this instanceof _Exclude) {
      this.value = value;
    } else {
      return new _Exclude(value);
    }
  }
}

export const Initial = Symbol('Initial');
export const Observe = Initial;
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
    this._clsProps = Object.keys(this._clsProps).filter(function (key) {
      return CLASS_NATIVE_PROPS.indexOf(key) === - 1;
    }).reduce(function (acc, key) {
      Object.defineProperty(acc, key, Object.getOwnPropertyDescriptor(this._clsProps, key));

      return acc;
    }.bind(this), {});
    this._clsPropsDescriptors = copyScopeDescriptors(cls);
    this._clsProtoPropsDescriptors = copyScopeDescriptors(cls.prototype);
    this._clsProtoScope = copyScope(cls.prototype);
    this._mock = mock;

    if (! props) {
      props = Object.getOwnPropertyNames(cls.prototype);

      props.push('constructor');
    }

    this._props = Array.isArray(props)
      ? props.reduce(function (acc, key) {
        if (key in this._clsProtoPropsDescriptors) {
          var descriptor = this._clsProtoPropsDescriptors[key];

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
      }.bind(this), {})
      : props;

    this._propsMetadata = { extraStaticProps: [], extraProps: [] };
  }

  makeConstructor(cls, useOriginPrototype, explicitInstance) {
    if (typeof cls !== 'function') {
      throw new Error('Class constructor must be function');
    }

    var custom;
    var self = this;
    var rep;

    if (this._props.hasOwnProperty('constructor')) {
      if (self._props.constructor instanceof Custom) {
        custom = self._props.constructor;
      }

      rep = classMakerGetReplacement(
        custom ? custom.value : self._props.constructor,
        'constructor',
        self._cls,
        self._clsProtoScope,
        self._propsMetadata
      );

      cls = spyOnFunction(copyConstructor(rep), Object.assign({
        argsAnnotation: self._cls,
        extra: {
          name: this._clsConstructorName,
          type: 'constructor',
        },
        origin: cls,
        replacement: rep,
        onCall: function (context, state) {
          if (self._mock._history) {
            self._mock._history.push(state);
          }
        },
      }, custom || {}), true);
    } else {
      cls = copyConstructor(cls, explicitInstance);
    }

    Object.keys(self._clsProps).forEach(function (key) {
      Object.defineProperty(cls, key, self._clsPropsDescriptors[key].descriptor);
    });

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

    if (! useOriginPrototype) {
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

    var self = this;

    Object.defineProperty(cls, 'name', {value: this._cls.name, writable: false});

    if (! useOriginPrototype) {
      cls.prototype = copyPrototype(this._cls);
    } else {
      cls.prototype = this._cls.prototype;
    }

    Object.keys(this._props).forEach(function (key) {
      if (key === 'constructor') {
        return;
      }

      var custom = null;
      var customGet = null;
      var customSet = null;
      var rep = null;
      var repDescriptor = null;

      if (self._props[key] instanceof StaticProperty) {
        repDescriptor = {};

        if (self._props[key].descriptor.get) {
          if (self._props[key].descriptor.get instanceof Custom) {
            customGet = self._props[key].descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : self._props[key].descriptor.get,
            key,
            self._cls,
            self._clsProps,
            self._propsMetadata.extraStaticProps
          );

          if (repDescriptor.get === self._cls) {
            repDescriptor.get = self._clsPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = self._mock.fixturePop;
          }
        }

        if (self._props[key].descriptor.set) {
          if (self._props[key].descriptor.set instanceof Custom) {
            customSet = self._props[key].descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : self._props[key].descriptor.set,
            key,
            self._cls,
            self._clsProps,
            self._propsMetadata.extraStaticProps
          );

          if (repDescriptor.set === self._cls) {
            repDescriptor.set = self._clsPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
            repDescriptor.set = self._mock.fixturePop;
          }
        }

        spyOnStaticDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: self._bypassOnBehalfOfInstanceReplacement,
          get: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'staticGetter',
            },
            origin: hasOwnProperty(self._clsPropsDescriptors, key) && self._clsPropsDescriptors[key].descriptor.get,
            replacement: self._props[key].descriptor.get,
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'staticSetter',
            },
            origin: hasOwnProperty(self._clsPropsDescriptors, key) && self._clsPropsDescriptors[key].descriptor.set,
            replacement: self._props[key].descriptor.set,
          }, customSet || {}),
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        });
      } else if (self._props[key] instanceof Property) {
        repDescriptor = {};

        if (self._props[key].descriptor.get) {
          if (self._props[key].descriptor.get instanceof Custom) {
            customGet = self._props[key].descriptor.get;
          }

          repDescriptor.get = classMakerGetReplacement(
            customGet ? customGet.value : self._props[key].descriptor.get,
            key,
            self._cls,
            self._clsProtoScope,
            self._propsMetadata.extraProps
          );

          if (repDescriptor.get === self._cls) {
            repDescriptor.get = self._clsProtoPropsDescriptors[key].descriptor.get;
          }

          if (repDescriptor.get === fixture.Fixture) {
            repDescriptor.get = self._mock.fixturePop;
          }
        }

        if (self._props[key].descriptor.set) {
          if (self._props[key].descriptor.set instanceof Custom) {
            customSet = self._props[key].descriptor.set;
          }

          repDescriptor.set = classMakerGetReplacement(
            customSet ? customSet.value : self._props[key].descriptor.set,
            key,
            self._cls,
            self._clsProtoScope,
            self._propsMetadata.extraProps
          );

          if (repDescriptor.set === self._cls) {
            repDescriptor.set = self._clsProtoPropsDescriptors[key].descriptor.set;
          }

          if (repDescriptor.set === fixture.Fixture) {
            repDescriptor.set = self._mock.fixturePop;
          }
        }

        spyOnDescriptor(cls, key, repDescriptor, {
          bypassOnBehalfOfInstanceReplacement: self._bypassOnBehalfOfInstanceReplacement,
          get: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'getter',
            },
            origin: hasOwnProperty(self._clsProtoPropsDescriptors, key) && self._clsProtoPropsDescriptors[key].descriptor.get,
            replacement: self._props[key].descriptor.get,
          }, customGet || {}),
          set: Object.assign({
            extra: {
              name: self._clsConstructorName + '.' + key,
              type: 'setter',
            },
            origin: hasOwnProperty(self._clsProtoPropsDescriptors, key) && self._clsProtoPropsDescriptors[key].descriptor.set,
            replacement: self._props[key].descriptor.set,
          }, customSet || {}),
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        });
      } else if (self._props[key] instanceof StaticMethod) {
        if (self._props[key].value instanceof Custom) {
          custom = self._props[key].value;
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : self._props[key].value,
          key,
          self._cls,
          self._clsProps,
          self._propsMetadata.extraStaticProps
        );

        if (rep === self._cls) {
          rep = self._clsPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = self._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyOnStaticMethod(cls, key, rep, Object.assign({
          bypassOnBehalfOfInstanceReplacement: self._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: self._clsConstructorName + '.' + key,
            type: 'staticMethod',
          },
          origin: hasOwnProperty(self._clsPropsDescriptors, key) && self._clsPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
            }
          },
        }, custom || {}));
      } else {
        if (self._props[key] instanceof Custom) {
          custom = self._props[key];
        }

        rep = classMakerGetReplacement(
          custom ? custom.value : self._props[key],
          key,
          self._cls,
          self._clsProtoScope,
          self._propsMetadata.extraProps
        );

        if (rep === self._cls) {
          rep = self._clsProtoPropsDescriptors[key].descriptor.value;
        }

        if (rep === fixture.Fixture) {
          rep = self._mock.fixturePop;
        }

        Object.defineProperty(rep, 'name', {value: key, writable: false});

        spyOnMethod(cls, key, rep, Object.assign({
          bypassOnBehalfOfInstanceReplacement: self._bypassOnBehalfOfInstanceReplacement,
          extra: {
            name: self._clsConstructorName + '.' + key,
            type: 'method',
          },
          origin: hasOwnProperty(self._clsProtoPropsDescriptors, key) && self._clsProtoPropsDescriptors[key].descriptor.value,
          replacement: rep,
          onCall: function (context, state) {
            if (self._mock._history) {
              self._mock._history.push(state);
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
    if (! (key in objProps)) {
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
