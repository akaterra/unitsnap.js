import {
  _ClassOf,
  _InstanceOf,
  AnyType,
  BooleanType,
  Continue,
  DateType,
  DateValue,
  Ignore,
  IType,
  NumberType,
  StringType,
  UndefinedType
  } from './type_helpers';
import { ClassDef, Fn } from './utils';

export type ProcessorBaseTypes = typeof Boolean |
  typeof Date |
  typeof Number |
  typeof String |
  typeof undefined |
  IType |
  typeof AnyType |
  typeof BooleanType |
  typeof DateType |
  typeof DateValue |
  typeof Ignore |
  typeof NumberType |
  typeof StringType |
  typeof UndefinedType;
export type ProcessorChecker = ((value?: unknown, path?: string) => boolean | void) | ProcessorBaseTypes;
export type ProcessorSerializer = ((value?: unknown) => unknown) | ProcessorBaseTypes;

export class Processor {
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

  addClassOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    const helper = new _ClassOf(cls);

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  addInstanceOf(cls: ClassDef<unknown>, serializer?: ProcessorSerializer) {
    const helper = new _InstanceOf(cls);

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  addPath(path: string, serializer: ProcessorSerializer) {
    const rgx = RegExp('^' + path
      .replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/_/g, '.') + '$'
    );

    return this.add((value, path) => rgx.test(path), serializer);
  }

  addNull(serializer?: ProcessorSerializer) {
    const helper = new UndefinedType();

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  addRegexPath(regex: string | RegExp, serializer: ProcessorSerializer) {
    const rgx = regex instanceof RegExp ? regex : RegExp(regex);

    return this.add((value, path) => rgx.test(path), serializer);
  }

  addUndefined(serializer?: ProcessorSerializer) {
    const helper = new UndefinedType();

    return this.add(helper.check.bind(helper), serializer || helper.serialize.bind(helper));
  }

  serialize(value, path?: string) {
    return this.serializeInternal(value, path ?? '');
  }

  private serializeInternal(value, path, primitiveOnly?, circular?) {
    this._processors.some((p) => {
      if (p.checker(value, path)) {
        value = p.serializer(value);
  
        if (!(value instanceof Continue)) {
          return true;
        }
  
        value = (value as any).value;
      }
    });
  
    if (! circular) {
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
        const serialized = this.serializeInternal(value[key], path + '.' + key, false, circular);
  
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

const basicTypes: [ any, IType ][] = [
  [ AnyType, new AnyType() ],
  [ Boolean, new BooleanType() ],
  [ BooleanType, new BooleanType() ],
  [ Date, new DateType() ],
  [ Ignore, new Ignore() ],
  [ DateType, new DateType() ],
  [ DateValue, new DateValue() ],
  [ Number, new NumberType() ],
  [ NumberType, new NumberType() ],
  [ String, new StringType() ],
  [ StringType, new StringType() ],
  [ undefined, new UndefinedType() ],
  [ UndefinedType, new UndefinedType() ],
];
