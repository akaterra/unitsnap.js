import { _Snapshot } from './snapshot';

const INDENT = '  ';

export function formatPrettySnapshotEntries(shapshot: _Snapshot): string {
  const processor = shapshot.env.processor;
  const mapper = shapshot.env.mapper;

  let output = '';

  function addLines(param, lines, lineIndent) {
    output += `${lineIndent}${param} = ${lines[0]}\n`;

    for (const line of lines.slice(1)) {
      output += `${lineIndent}${lineIndent}${line}\n`;
    }
  }

  shapshot.entries.forEach((entry, ind) => {
    const lineIndent = entry.level ? INDENT.repeat(entry.level) : '';
    const e = processor.serialize(
      mapper(shapshot, entry),
      `[${ind}]`,
    );

    for (const [ param, value ] of Object.entries(e)) {
      addLines(param, JSON.stringify(value, undefined, INDENT.length).split('\n'), lineIndent);
    }
  });

  return output;
}
