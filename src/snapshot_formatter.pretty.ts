import { _Snapshot } from './snapshot';
import {StateReportType} from './spy';

const INDENT = '    ';

export function formatPrettySnapshotEntries(shapshot: _Snapshot): string {
  const processor = shapshot.env.processor;
  const mapper = shapshot.env.mapper;

  let output = '';

  function addLines(param, entry, value, lineIndent) {
    const strValue = serialize(value).trim();
    const lines = strValue.split('\n');

    if (param === 'name') {
      if (entry.reportType == StateReportType.CALL_ARGS) {
        output += `${lineIndent}--> ${lines[0].slice(1, -1)}\n`;
      } else {
        output += `${lineIndent}<-- ${lines[0].slice(1, -1)}\n`;
      }
    } else if (param === 'args') {
      output += `${lineIndent}--> ${lines[0]}\n`;
    } else if (param === 'result') {
      output += `${lineIndent}<-- ${lines[0]}\n`;
    } else {
      output += `${lineIndent}${param} = ${lines[0]}\n`;
    }

    for (const line of lines.slice(1)) {
      output += `${lineIndent}${lineIndent}${line}\n`;
    }
  }

  shapshot.entries.forEach((entry, ind) => {
    const lineIndent = entry.level > 0 ? INDENT.repeat(entry.level) : '';
    const e = processor.serialize(
      mapper(shapshot, entry),
      `[${ind}]`,
    );

    output += '\n';

    for (const [ param, value ] of Object.entries(e)) {
      addLines(
        param,
        entry,
        value,
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
  }

  if (circular.has(value)) {
    return '[[ Circular! ]]\n';
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
    case value instanceof Uint32Array:
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
      value = `[[ Error : ${value.name ?? '?'}, ${value.message ?? '?'} ]]`;
      return `${value}\n`;
    case value instanceof Map:
      pre = '[[ Map : ';
      post = ' ]]';
      value = Object.fromEntries(value.entries());
      break;
    case value instanceof RegExp:
      value = `[[ RegExp : ${value.source ?? '?'} ]]`;
      return `${value}\n`;
    case value instanceof Set:
      pre = '[[ Set : ';
      post = ' ]]';
      value = Array.from(value.values());
      break;
    case typeof value === 'function':
      value = `[[ Function : ${value.name ?? '?'} ]]`;
      return `${value}\n`;
    case typeof value === 'string':
      value = `"${value.replace(/"/g, '\\"')}"`;
      return `${value}\n`;
    default:
      if (value && typeof value === 'object') {
        const constructor = Object.getPrototypeOf(value).constructor;

        if (constructor !== Object && constructor !== Array) {
          pre = `[[ ${constructor.name} : `;
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
    value.forEach((val) => {
      output += `${indent}${INDENT}${serialize(val, indent + INDENT, '', circular)}`;
    });
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
    Object.entries(value).forEach(([ key, val ], ind) => {
      output += `${indent}${INDENT}${key} = ${serialize(val, indent + INDENT, '', circular)}`;
    });
    output += `${indent}}${post}\n`;

    circular.delete(value);

    return output;
  }

  return `${pre}${value}${post}\n`;
}
