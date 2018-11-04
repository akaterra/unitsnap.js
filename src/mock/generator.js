function Generator(fn, onValue, onException) {
  return function *() {
    var generator = fn.apply(this, arguments);
    var received = void 0;

    try {
      while (true) {
        var generatorValue = generator.next(received);

        if (onValue) {
          onValue(generatorValue, received);
        }

        if (generatorValue.done) {
          return;
        }

        received = yield generatorValue.value;
      }
    } catch (e) {
      if (onException) {
        onException(e);
      }

      throw e;
    }
  };
}

module.exports = {
  Generator: Generator,
};
