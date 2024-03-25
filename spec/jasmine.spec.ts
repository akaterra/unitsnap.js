import * as unitsnap from '..';

describe('some suite 1', () => {
  const observer = unitsnap.default;

  observer.env.snapshot.setFsProvider(__dirname + '/spec/snapshots').includeName();

  beforeAll(() => unitsnap.extendJasmine(unitsnap.SnapshotStorageFormat.COMPACT));
  beforeEach(() => observer.begin());
  afterEach(() => observer.end());

  it('some spec 1', async () => {
    class A {
      get b() {
        return 'b';
      }

      set b(v) {

      }

      get b1() {
        return 'b';
      }

      set b1(v) {

      }

      static get B() {
        return 'B';
      }

      static set B(v) {

      }

      static get B1() {
        return 'B';
      }

      static set B1(v) {

      }

      c(x) {
        return 'c';
      }

      static C(x) {
        return 'C';
      }

      async p() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'p';
      }

      async P() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'P';
      }
    }

    const Mock = observer.by(A, {
      constructor: unitsnap.Observe,
      b: unitsnap.Observe,
      b1: unitsnap.Observe,
      c: unitsnap.Observe,
      p: unitsnap.Observe,
      B: unitsnap.StaticProperty(unitsnap.Observe),
      B1: unitsnap.StaticProperty(unitsnap.Observe),
      C: unitsnap.StaticMethod(unitsnap.Observe),
      P: unitsnap.Observe,
    });
    const mock = new Mock();

    mock.b;
    mock.b;
    mock.b = '2';
    mock.b = '2';
    mock.b1 = '2';
    mock.b1 = '2';
    mock.b1;
    mock.b1;
    mock.c(222);
    mock.c(222);
    Mock.B;
    Mock.B;
    Mock.B = '2';
    Mock.B = '2';
    Mock.B1 = '2';
    Mock.B1 = '2';
    Mock.B1;
    Mock.B1;
    Mock.C(222);
    Mock.C(222);
    await mock.p();
    await mock.p();
    await mock.P();
    await mock.P();

    process.env.SAVE_SNAPSHOT = '1';

    expect(observer).toMatchSnapshot('some spec 1'); // saves the snapshot <__dirname>/some_spec.snapshot.json

    process.env.SAVE_SNAPSHOT = '0';

    expect(observer).toMatchSnapshot('some spec 1'); // asserts the snapshot <__dirname>/some_spec.snapshot.json
  });
});

describe('some suite 2', () => {
  const observer = unitsnap.default;

  observer.env.snapshot.setFsProvider(__dirname + '/spec/snapshots');

  beforeAll(() => unitsnap.extendJasmine(unitsnap.SnapshotStorageFormat.COMPACT));
  beforeEach(() => {
    observer.begin()
    observer.env.snapshot.remove('some spec 2');
  });
  afterEach(() => observer.end());

  it('some spec 2', async () => {
    class A {
      get b() {
        return 'b';
      }

      set b(v) {

      }

      get b1() {
        return 'b';
      }

      set b1(v) {

      }

      static get B() {
        return 'B';
      }

      static set B(v) {

      }

      static get B1() {
        return 'B';
      }

      static set B1(v) {

      }

      c(x) {
        return 'c';
      }

      static C(x) {
        return 'C';
      }

      async p() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'p';
      }

      async P() {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'P';
      }
    }

    const Mock = observer.by(A, {
      constructor: unitsnap.Observe,
      b: unitsnap.Observe,
      b1: unitsnap.Observe,
      c: unitsnap.Observe,
      p: unitsnap.Observe,
      B: unitsnap.StaticProperty(unitsnap.Observe),
      B1: unitsnap.StaticProperty(unitsnap.Observe),
      C: unitsnap.StaticMethod(unitsnap.Observe),
      P: unitsnap.Observe,
    });
    const mock = new Mock();

    mock.b;
    mock.b;
    mock.b = '2';
    mock.b = '2';
    mock.b1 = '2';
    mock.b1 = '2';
    mock.b1;
    mock.b1;
    mock.c(222);
    mock.c(222);
    Mock.B;
    Mock.B;
    Mock.B = '2';
    Mock.B = '2';
    Mock.B1 = '2';
    Mock.B1 = '2';
    Mock.B1;
    Mock.B1;
    Mock.C(222);
    Mock.C(222);
    await mock.p();
    await mock.p();
    await mock.P();
    await mock.P();

    expect(observer).toMatchSnapshot('some spec 2'); // auto saves the snapshot __dirname/some_spec.snapshot.json

    expect(observer).toMatchSnapshot('some spec 2'); // asserts the snapshot __dirname/some_spec.snapshot.json
  });
});
