import { _Snapshot } from './snapshot';
import {StateReportType} from './spy';

const INDENT = '    ';

export function formatPrettySnapshotEntries(shapshot: _Snapshot): string {
  const processor = shapshot.env.processor;
  const mapper = shapshot.env.mapper;

  let output = '';

  function addLines(param, entry, value, lineIndent) {
    const strValue = serialize(value);
    const lines = strValue.split('\n');

    if (param === 'name') {
      if (entry.reportType == StateReportType.CALL_ARGS) {
        output += `${lineIndent}-->\n`;
        output += `${lineIndent}--> ${lines[0]}\n`;
        output += `${lineIndent}-->\n`;
      } else {
        output += `${lineIndent}<--\n`;
        output += `${lineIndent}<-- ${lines[0]}\n`;
        output += `${lineIndent}<--\n`;
      }
    } else if (param === 'args' || param === 'result') {
      output += `${lineIndent}${lines[0]}\n`;
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
    case value instanceof Buffer:
      value = Array.from(value);
      pre = '[[ Buffer : ';
      post = ' ]]';
      break;
    case value instanceof Date:
      value = `[[ Date : ${value.toISOString()} ]]`;
      return `${value}\n`;
    case value instanceof Map:
      value = Object.fromEntries(value.entries());
      pre = '[[ Map : ';
      post = ' ]]';
      break;
    case value instanceof Set:
      value = Array.from(value.values());
      pre = '[[ Set : ';
      post = ' ]]';
      break;
    case typeof value === 'function':
      value = `[[ Function : ${value.name ?? '?'} ]]`;
      return `${value}\n`;
    case typeof value === 'string':
      value = `"${value.replace(/"/g, '\\"')}"`;
      return `${value}\n`;
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
