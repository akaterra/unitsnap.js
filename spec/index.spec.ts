import unitsnap from '..';

const filter = require('../src/filter');
const fixture = require('../src/fixture');
const history = require('../src/history');
const mock = require('../src/mock');
const observer = require('../src/observer');
const snapshot = require('../src/snapshot');
const typeHelpers = require('../src/type_helpers');

describe('index', () => {
  function expectImport(imp) {
    Object.keys(imp).forEach((key) => {
      expect(unitsnap[key]).toBe(imp[key], key);
    });
  }

  it('should export Filter', () => {
    expectImport(filter);
  });

  it('should export Fixture', () => {
    expectImport(fixture);
  });

  it('should export History', () => {
    expectImport(history);
  });

  it('should export Mock', () => {
    expectImport(mock);
  });

  it('should export Observer', () => {
    expectImport(observer);
  });

  it('should export Snapshot', () => {
    expectImport(snapshot);
  });

  it('should export type helpers', () => {
    expectImport(typeHelpers);
  });

  it('should export "create"', () => {
    expect(unitsnap.create instanceof Function).toBeTruthy();
  });

  it('should export jasmine extender', () => {
    expect(unitsnap.extendJasmine instanceof Function).toBeTruthy();
  });
});