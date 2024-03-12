import { CIRCULAR, UNSERIALIZABLE } from './const';
import { _Snapshot } from './snapshot';
import { StateReportType } from './spy';
import { Wrapped } from './type_helpers';

const INDENT = '    ';
const PARAMS = [ 'name', 'args', 'result', 'exception', 'epoch', 'callsCount', 'exceptionsCount', 'tags', 'time' ];

export function formatCompactSnapshotEntries(snapshot: _Snapshot): string {
  const processor = snapshot.env.processor;
  const mapper = snapshot.env.mapper;

  let output = '';

  function addLines(
    param,
    entry,
    serializedEntry,
    value,
    lineIndent,
  ) {
    const strValue = serialize(value).trim();
    const lines = strValue.split('\n');
    const serializedEntryHasName = !!serializedEntry.name;

    if (param === 'name') {
      const fnName = lines[0].slice(1, -1);

      if (entry.reportType == StateReportType.CALL_ARGS) {
        output += `${lineIndent}--> ${fnName} `;
      } else {
        if (entry.isException) {
          output += `${lineIndent}!!! ${fnName} `;
        } else {
          output += `${lineIndent}<-- ${fnName} `;
        }
      }
    } else if (param === 'args') {
      output += `${serializedEntryHasName ? '' : lineIndent}--> ${lines[0]}\n`;
    } else if (param === 'result') {
      output += `${serializedEntryHasName ? '' : lineIndent}<-- ${lines[0]}\n`;
    } else if (param === 'exception') {
      output += `${serializedEntryHasName ? '' : lineIndent}!!! ${lines[0]}\n`;
    } else {
      output += `${lineIndent}${INDENT}${param} = ${lines[0]}\n`;
    }

    for (const line of lines.slice(1)) {
      output += `${lineIndent}${INDENT}${line}\n`;
    }
  }

  if (!Array.isArray(snapshot.entries)) {
    return snapshot.entries;
  }

  snapshot.entries.forEach((entry, ind) => {
    const lineIndent = entry.level > 0 ? INDENT.repeat(entry.level) : '';
    const serializedEntry = processor.serialize(
      mapper(snapshot, entry),
      `[${ind}]`,
    );

    output += '\n';

    for (const param of PARAMS) {
      if (!serializedEntry.hasOwnProperty(param)) {
        continue;
      }

      addLines(
        param,
        entry,
        serializedEntry,
        serializedEntry[param],
        lineIndent,
      );
    }
  });

  return output;
}

function serialize(value, indent?, output?, circular?) {
  if (typeof indent === 'undefined') {
    indent = '';
  }

  if (typeof output === 'undefined') {
    output = '';
  }

  if (typeof circular === 'undefined') {
    circular = new Set<unknown>();
  } else if (circular.has(value)) {
    value = new Wrapped(CIRCULAR);
  }

  let pre = '';
  let post = '';

  switch (true) {
    case value instanceof ArrayBuffer:
      pre = '[[ ArrayBuffer : ';
      post = ' ]]';
      value = Array.from(new Uint8Array(value));
      break;
    case value instanceof Buffer:
    case value instanceof Float32Array:
    case value instanceof Float64Array:
    case value instanceof Int8Array:
    case value instanceof Int16Array:
    case value instanceof Int32Array:
    case value instanceof Uint8Array:
    case value instanceof Uint16Array:
    case value instanceof Uint32Array:
      pre = `[[ ${Object.getPrototypeOf(value).constructor.name} : `;
      post = ' ]]';
      value = Array.from(value);
      break;
    case value instanceof Date:
      value = `[[ Date : ${value.toISOString()} ]]`;
      return `${value}\n`;
    case value instanceof Error:
      value = `[[ Error : ${value.name || '<no name>'}, ${value.message || '<no message>'} ]]`;
      return `${value}\n`;
    case value instanceof Map:
      pre = '[[ Map : ';
      post = ' ]]';
      value = Object.fromEntries(value.entries());
      break;
    case value instanceof RegExp:
      value = `[[ RegExp : ${value.source || '<no source>'} ]]`;
      return `${value}\n`;
    case value instanceof Set:
      pre = '[[ Set : ';
      post = ' ]]';
      value = Array.from(value.values());
      break;
    case value instanceof Wrapped:
      value = value.value;
      break;
    case typeof value === 'bigint':
      value = `[[ BigInt : ${value.valueOf()} ]]`;
      return `${value}\n`;
    case typeof value === 'function':
      value = `[[ Function : ${value.name || '<anonymous>'} ]]`;
      return `${value}\n`;
    case typeof value === 'string':
      value = `"${value.replace(/"/g, '\\"')}"`;
      return `${value}\n`;
    case typeof value === 'symbol':
      value = `[[ Symbol : ${value.toString().slice(7, -1)} ]]`;
      return `${value}\n`;
    default:
      if (value && typeof value === 'object') {
        const constructor = Object.getPrototypeOf(value).constructor;

        if (constructor !== Object && constructor !== Array) {
          pre = `[[ ${constructor.name || '<anonymous>'} : `;
          post = ' ]]';
        }
      }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${pre}[]${post}\n`;
    }

    circular.add(value);

    output += `${pre}[\n`;

    try {
      value.forEach((val) => {
        try {
          output += `${indent}${INDENT}${serialize(val, indent + INDENT, '', circular)}`;
        } catch (err) {
          output += `${indent}${INDENT}${UNSERIALIZABLE}`;
        }
      });
    } catch (err) {
      output += `${indent}${INDENT}${UNSERIALIZABLE}\n`;
    }

    output += `${indent}]${post}\n`;

    circular.delete(value);

    return output;
  }

  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 0) {
      return `${pre}{}${post}\n`;
    }

    circular.add(value);

    output += `${pre}{\n`;

    try {
      Object.entries(value).forEach(([ key, val ], ind) => {
        try {
          output += `${indent}${INDENT}${key} = ${serialize(val, indent + INDENT, '', circular)}`;
        } catch (err) {
          output += `${indent}${INDENT}${key} = ${UNSERIALIZABLE}`;
        }
      });
    } catch (err) {
      output += `${indent}${INDENT}${UNSERIALIZABLE}\n`;
    }

    output += `${indent}}${post}\n`;

    circular.delete(value);

    return output;

  }

  return `${pre}${value}${post}\n`;
}
