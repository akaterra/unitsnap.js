/**
 * Taken from https://github.com/stacktracejs
 */

const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const CWD = typeof process !== 'undefined' ? process.cwd() : '';

export function getV8StackFrames(error?) {
  if (!error) {
    error = new Error();
  }

  const filtered = error.stack.split('\n').filter((line) => !!line.match(CHROME_IE_STACK_REGEXP));

  return filtered.map((line) => {
    if (line.indexOf('(eval ') > -1) {
        line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
    }

    let sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').replace(/^.*?\s+/, '');
    let location = sanitizedLine.match(/ (\(.+\)$)/);
    sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;
    let locationParts = extractLocation(location ? location[1] : sanitizedLine);
    let functionName = location && sanitizedLine || undefined;
    let fileName = [ 'eval', '<anonymous>' ].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

    const frame = {
      functionName: functionName,
      fileName: fileName && fileName.startsWith('file://') ? fileName.slice(7) : fileName,
      lineNumber: parseInt(locationParts[1]),
      columnNumber: parseInt(locationParts[2]),
    };

    if (frame.fileName && frame.fileName.slice(0, CWD.length) === CWD) {
      frame.fileName = `.${frame.fileName.slice(CWD.length)}`;
    }

    return frame;
  });
}

function extractLocation(urlLike) {
  if (urlLike.indexOf(':') === -1) {
      return [urlLike];
  }

  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[()]/g, ''));

  return [parts[1], parts[2] || undefined, parts[3] || undefined];
}
