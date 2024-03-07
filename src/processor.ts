import {
  _ClassOf,
  _InstanceOf,
  _AnyType,
  _BooleanType,
  Continue,
  _DateType,
  _DateValue,
  Ignore,
  IType,
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
  NullType
} from './type_helpers';
import { ClassDef, Fn } from './utils';

export type ProcessorBaseTypes = typeof Boolean |
  typeof Date |
  typeof Number |
  typeof String |
  null |
  typeof undefined |
  IType |
  typeof _AnyType |
  typeof _BooleanType |
  typeof _DateType |
  typeof _DateValue |
  typeof Ignore |
  typeof _NumberType |
  typeof _StringType |
  typeof _UndefinedType;
export type ProcessorChecker = ((value?: unknown, path?: string) => boolean | void) | ProcessorBaseTypes;
export type ProcessorSerializer = ((value?: unknown) => unknown) | ProcessorBaseTypes;

export class _Processor {
  private _processors: { checker: Fn, serializer: Fn }[] = [];

  get processors() {
    return this._processors;
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

  classOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    const helper = new _ClassOf(cls);

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  instanceOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    const helper = new _InstanceOf(cls);

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  path(path: string, serializer: ProcessorSerializer) {
    const rgx = RegExp('^' + path
      .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/_/g, '.') + '$'
    );

    return this.add((value, path) => rgx.test(path), serializer);
  }

  null(serializer?: ProcessorSerializer) {
    const helper = new _NullType();

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  regexPath(regex: string | RegExp, serializer: ProcessorSerializer) {
    const rgx = regex instanceof RegExp ? regex : RegExp(regex);

    return this.add((value, path) => rgx.test(path), serializer);
  }

  undefined(serializer?: ProcessorSerializer) {
    const helper = new _UndefinedType();

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  serialize(value, path?: string) {
    return this.serializeInternal(value, path ?? '');
  }

  private serializeInternal(value, path, primitiveOnly?, circular?) {
    this._processors.some((p) => {
      if (p.checker(value, path)) {
        value = p.serializer(value);
  
        if (!(value instanceof Continue) && value !== Continue) {
          return true;
        }
  
        value = (value as any).value;
      }
    });
  
    if (!circular) {
      circular = [];
    }
  
    let serialized;
  
    if (!primitiveOnly && Array.isArray(value)) {
      if (circular.indexOf(value) !== - 1) {
        return '[[ Circular ! ]]'
      }
  
      circular.push(value);
  
      serialized = value.map((val, ind) => {
        return this.serializeInternal(val, path + '[' + ind + ']', false, circular);
      }).filter((val) => {
        return val !== Ignore;
      });
  
      circular.pop();
  
      return serialized;
    }
  
    if (!primitiveOnly && value && typeof value === 'object') {
      if (circular.indexOf(value) !== - 1) {
        return '[[ Circular ! ]]'
      }
  
      circular.push(value);
  
      serialized = Object.keys(value).reduce((acc, key) => {
        const serialized = this.serializeInternal(value[key], path ? path + '.' + key : key, false, circular);
  
        if (serialized !== Ignore) {
          acc[key] = serialized;
        }
  
        return acc;
      }, {});
  
      circular.pop();
  
      return serialized;
    }
  
    return value;
  }
}

export function Processor() {
  return new _Processor();
}

const basicTypes: [ any, IType ][] = [
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
