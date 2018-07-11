const unitsnap = require('..');

describe('some suite', () => {
  const observer = unitsnap.default;

  observer.config().snapshot.setFsProvider(__dirname);

  beforeAll(() => unitsnap.extendJasmine());
  beforeEach(() => observer.begin());
  afterEach(() => observer.end());

  it('some spec 1', () => {
    class A {
      b(x) {
        return 1;
      }
    }

    const Mock = observer.by(A);
    const mock = new Mock();

    mock.b(111);

    if (process) {
      process.env.SAVE_SNAPSHOT = '1';
    }

    expect(observer).toMatchSnapshot('some spec 1'); // saves the snapshot <__dirname>/some_spec.snapshot.json

    if (process) {
      process.env.SAVE_SNAPSHOT = '0';
    }

    expect(observer).toMatchSnapshot('some spec 1'); // asserts the snapshot <__dirname>/some_spec.snapshot.json
  });
});

describe('some suite', () => {
  const observer = unitsnap.default;

  observer.config().snapshot.setFsProvider(__dirname);

  beforeAll(() => unitsnap.extendJasmine());
  beforeEach(() => observer.begin());
  afterEach(() => observer.end());

  it('some spec 2', () => {
    class A {
      b(x) {
        return 1;
      }
    }

    const Mock = observer.by(A);
    const mock = new Mock();

    mock.b(111);

    if (process) {
      process.env.SAVE_SNAPSHOT = '1';
    }

    expect(observer).toMatchSnapshot('some spec 2'); // saves the snapshot <__dirname>/some_spec.snapshot.json

    if (process) {
      process.env.SAVE_SNAPSHOT = '0';
    }

    expect(observer).toMatchSnapshot('some spec 2'); // asserts the snapshot <__dirname>/some_spec.snapshot.json
  });
});
