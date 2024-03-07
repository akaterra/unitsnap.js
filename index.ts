declare global {
  export module jasmine {
    interface Matchers<T> {
      toMatchSnapshot(expected: any, expectationFailOutput?: any): boolean;
    }
  }
}

export * from './src/filter';
export * from './src/fixture';
export * from './src/history';
export * from './src/instance';
export * from './src/mock';
export * from './src/observer';
export * from './src/snapshot';
export * from './src/spy';
export * from './src/type_helpers';

import { _Filter } from './src/filter';
import { _Observer } from './src/observer';
import { _Snapshot } from './src/snapshot';

export function extendJasmine() {
  if (typeof jasmine !== 'undefined') {
    (jasmine as any).addMatchers({
      toMatchSnapshot: function toMatchSnapshot(util) {
        const toEqual = (jasmine as any).matchers.toEqual(util).compare;

        return {
          compare: function (actual, expected) {
            if (actual instanceof _Filter) {
              actual = actual.snapshot();
            } else if (actual instanceof _Observer) {
              actual = actual.snapshot();
            }

            if (actual instanceof _Snapshot) {
              let saveSnapshot = false;

              if (typeof process !== 'undefined') {
                saveSnapshot = 'SAVE_SNAPSHOT' in process.env && process.env.SAVE_SNAPSHOT !== '0';

                if (!saveSnapshot) {
                  saveSnapshot = !!process.argv.find(function (argv) {
                    return argv === '--saveSnapshot';
                  });
                }
              }

              if (typeof window !== 'undefined' && !saveSnapshot) {
                saveSnapshot = typeof window !== 'undefined' && (window as any).SAVE_SNAPSHOT === true;
              }

              if (!saveSnapshot) {
                saveSnapshot = !actual.exists(typeof expected === 'string' ? expected : void 0);
              }

              if (saveSnapshot) {
                actual.save(typeof expected === 'string' ? expected : void 0);

                return {
                  message: 'saved',
                  pass: true
                };
              }

              if (typeof expected === 'string') {
                expected = actual.loadCopy(expected);
              }

              actual = actual.serialize();
            }

            if (expected instanceof _Snapshot) {
              expected = expected.serialize();
            }

            return toEqual.call(this, actual, expected);
          }
        }
      },
    });
  } else {
    throw new Error('Jasmine is not installed');
  }
};

export default new _Observer();
