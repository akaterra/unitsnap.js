import { CIRCULAR, UNSERIALIZABLE } from './const';
import {
  _StrictInstanceOf,
  _InstanceOf,
  _AnyType,
  _BooleanType,
  _Continue,
  Continue,
  _DateType,
  _DateValue,
  Ignore,
  ITypeHelper,
  _NumberType,
  _StringType,
  _UndefinedType,
  AnyType,
  BooleanType,
  DateType,
  DateValue,
  StringType,
  UndefinedType,
  NumberType,
  _NullType,
  NullType,
  Wrapped,
} from './type_helpers';
import { ClassDef, Fn } from './utils';

export type ProcessorBaseTypes = typeof Boolean |
  typeof Date |
  typeof Number |
  typeof String |
  null |
  typeof undefined |
  ITypeHelper |
  typeof _AnyType |
  typeof _BooleanType |
  typeof _DateType |
  typeof _DateValue |
  typeof Ignore |
  typeof _NumberType |
  typeof _StringType |
  typeof _UndefinedType;
export type ProcessorChecker = ((value?: unknown, path?: string) => boolean | void) | ProcessorBaseTypes;
export type ProcessorSerializer = ((value?: unknown) => unknown) | ProcessorBaseTypes | ITypeHelper;

export class _Processor {
  private _processors: { checker: Fn & { original?: Fn }, serializer: Fn & { original?: Fn } }[] = [];
  private _instancePassThrough = false;

  get processors() {
    return this._processors;
  }

  setInstancePassThrough(value: boolean = true) {
    this._instancePassThrough = value;

    return this;
  }

  add(checker: ProcessorChecker, serializer?: ProcessorSerializer): this {
    const [ ,basicTypeChecker ] = basicTypes.find(([ type ]) => {
      return type === checker;
    }) ?? [];

    const basicTypeCheckerFn = basicTypeChecker
      ? basicTypeChecker.check.bind(basicTypeChecker[1])
      : checker;

    const [ ,basicTypeSerializer ] = basicTypes.find(([ type ]) => {
      return type === (serializer === undefined ? checker : serializer);
    }) ?? [];

    const basicTypeSerializerFn = basicTypeSerializer
      ? basicTypeSerializer.serialize.bind(basicTypeSerializer[1])
      : serializer;

    this._processors.unshift({
      checker: basicTypeCheckerFn,
      serializer: basicTypeSerializerFn,
    });

    return this;
  }

  instanceOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    return this.addCombined(
      new _InstanceOf(cls),
      serializer,
    );
  }

  path(path: string, serializer: ProcessorSerializer) {
    const rgx = RegExp('^' + path
      .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/_/g, '.') + '$'
    );

    return this.regexPath(rgx, serializer);
  }

  regexPath(regex: string | RegExp, serializer: ProcessorSerializer) {
    const rgx = regex instanceof RegExp ? regex : RegExp(regex);

    return this.addCombined(
      { check: (value, path) => rgx.test(path) },
      serializer,
    );
  }

  strictInstanceOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    return this.addCombined(
      new _StrictInstanceOf(cls),
      serializer,
    );
  }

  undefined(serializer?: ProcessorSerializer) {
    return this.addCombined(
      new _UndefinedType(),
      serializer,
    );
  }

  serialize(value, path?: string) {
    return this.serializeInternal(value, path ?? '');
  }

  private addCombined(typeHelper, serializer?) {
    const checkerFn = typeof serializer === 'function' || !serializer
      ? null
      : serializer.check.bind(serializer);
    const serializerFn = typeof serializer === 'function'
      ? serializer
      : serializer ? serializer.serialize.bind(serializer) : typeHelper.serialize.bind(typeHelper);

    return this.add(
      checkerFn
        ? (value, path) => typeHelper.check(value, path) && checkerFn(value, path)
        : typeHelper.check.bind(typeHelper),
      serializerFn,
    );
  }

  private serializeInternal(value, path, primitiveOnly?, circular?) {
    if (!circular) {
      circular = new Set<unknown>();
    } else if (circular.has(value)) {
      return new Wrapped(CIRCULAR);
    }

    this._processors.some((p) => {
      if (p.checker(value, path)) {
        value = p.serializer(value);
  
        if (!(value instanceof _Continue) && value !== _Continue && value !== Continue) {
          return true;
        }
  
        value = (value as any).value;
      }
    });
  
    let serialized;
  
    if (!primitiveOnly && Array.isArray(value)) {
      circular.add(value);
  
      serialized = value.map((val, ind) => {
        try {
          return this.serializeInternal(val, path + '[' + ind + ']', false, circular);
        } catch (err) {
          return new Wrapped(UNSERIALIZABLE);
        }
      }).filter((val) => {
        return val !== Ignore;
      });
  
      circular.delete(value);
  
      return serialized;
    }
  
    if (!primitiveOnly && value && typeof value === 'object') {
      // ignore instances derived not from Object
      // 1. instance of class A {} serialized as-is
      // 2. plain object will be traversed
      if (!this._instancePassThrough && Object.getPrototypeOf(value).constructor !== Object) {
        return value;
      }

      circular.add(value);

      serialized = Object.keys(value).reduce((acc, key) => {
        let serialized;

        try {
          serialized = this.serializeInternal(value[key], path ? path + '.' + key : key, false, circular);
        } catch (err) {
          return new Wrapped(UNSERIALIZABLE);
        }
  
        if (serialized !== Ignore) {
          acc[key] = serialized;
        }
  
        return acc;
      }, {});
  
      circular.delete(value);
  
      return serialized;
    }
  
    return value;
  }
}

export function Processor() {
  return new _Processor();
}

const basicTypes: [ any, ITypeHelper ][] = [
  [ AnyType, new _AnyType() ],
  [ _AnyType, new _AnyType() ],
  [ Boolean, new _BooleanType() ],
  [ BooleanType, new _AnyType() ],
  [ _BooleanType, new _BooleanType() ],
  [ Date, new _DateType() ],
  [ Ignore, new Ignore() ],
  [ DateType, new _DateType() ],
  [ _DateType, new _DateType() ],
  [ DateValue, new _DateValue() ],
  [ _DateValue, new _DateValue() ],
  [ null, new _NullType() ],
  [ NullType, new _NullType() ],
  [ _NullType, new _NullType() ],
  [ Number, new _NumberType() ],
  [ NumberType, new _NumberType() ],
  [ _NumberType, new _NumberType() ],
  [ String, new _StringType() ],
  [ StringType, new _StringType() ],
  [ _StringType, new _StringType() ],
  [ undefined, new _UndefinedType() ],
  [ UndefinedType, new _UndefinedType() ],
  [ _UndefinedType, new _UndefinedType() ],
];
