import * as unitsnap from '..';

describe('some suite 1', () => {
  const observer = unitsnap.default;

  observer.env.snapshot.setFsProvider(__dirname + '/spec/snapshots').includeName();

  beforeAll(() => unitsnap.extendJasmine('pretty'));
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

    process.env.SAVE_SNAPSHOT = '1';

    expect(observer).toMatchSnapshot('some spec 1'); // saves the snapshot <__dirname>/some_spec.snapshot.json

    process.env.SAVE_SNAPSHOT = '0';

    expect(observer).toMatchSnapshot('some spec 1'); // asserts the snapshot <__dirname>/some_spec.snapshot.json
  });
});

describe('some suite 2', () => {
  const observer = unitsnap.default;

  observer.env.snapshot.setFsProvider(__dirname + '/spec/snapshots');

  beforeAll(() => unitsnap.extendJasmine('pretty'));
  beforeEach(() => {
    observer.begin()
    observer.env.snapshot.remove('some spec 2');
  });
  afterEach(() => observer.end());

  it('some spec 2', () => {
    class A {
      c(x) {
        return 1;
      }
    }

    const Mock = observer.by(A);
    const mock = new Mock();

    mock.c(222);

    expect(observer).toMatchSnapshot('some spec 2'); // auto saves the snapshot __dirname/some_spec.snapshot.json

    expect(observer).toMatchSnapshot('some spec 2'); // asserts the snapshot __dirname/some_spec.snapshot.json
  });
});
