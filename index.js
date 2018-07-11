module.exports = require('./src/observer');
module.exports.extendJasmine = function () {
  jasmine.addMatchers({
    toMatchSnapshot: function toMatchSnapshot(util) {
      var toEqual = jasmine.matchers.toEqual(util).compare;

      return {
        compare: function (actual, expected) {
          if (actual instanceof module.exports.Filter) {
            actual = actual.snapshot();
          } else if (actual instanceof module.exports.Observer) {
            actual = actual.snapshot();
          }

          if (actual instanceof module.exports.Snapshot) {
            if (process && (('SAVE_SNAPSHOT' in process.env && process.env.SAVE_SNAPSHOT !== '0') || process.argv.find(function (argv) {
              return argv === '--saveSnapshot' || argv === '--sn';
            }))) {
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

          if (expected instanceof module.exports.Snapshot) {
            expected = expected.serialize();
          }

          return toEqual.call(this, actual, expected);
        }
      }
    },
  });
};
