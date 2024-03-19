/**
 * @url https://github.com/stacktracejs
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
      file: alignFile(fileName),
      line: parseInt(locationParts[1]),
      column: parseInt(locationParts[2]),
    };

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

/**
 * @url https://github.com/sindresorhus/callsites
 */
export function getV8StackFramesFromCallsites() {
	const _prepareStackTrace = Error.prepareStackTrace;

  if (_prepareStackTrace === undefined) {
    return [];
  }

  try {
		let result = [];

    Error.prepareStackTrace = (_, callSites) => {
			const callSitesWithoutCurrent = callSites.slice(1);
			result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
		};

		new Error().stack; // eslint-disable-line unicorn/error-message, no-unused-expressions

    return result.filter((cs) => !cs.isNative()).map((cs) => {
      const typeName = cs.getTypeName();
      const methodName = cs.getMethodName();
      const fnName = cs.getFunctionName();
      const functionName = methodName ? `${typeName}.${methodName}` : fnName;

      const frame = {
        functionName,
        file: alignFile(cs.getFileName()),
        line: cs.getLineNumber(),
        column: cs.getColumnNumber(),
      };

      return frame;
    });
	} finally {
		Error.prepareStackTrace = _prepareStackTrace;
	}
}

function alignFile(file?) {
  if (!file) {
    return file;
  }

  if (file.startsWith('file://')) {
    file = file.slice(7);
  }

  if (file.slice(0, CWD.length) === CWD) {
    return `.${file.slice(CWD.length)}`;
  }

  return file;
}
