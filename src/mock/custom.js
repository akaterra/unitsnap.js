function Custom(value) {
  if (this instanceof Custom) {
    this.value = value;
  } else {
    return new Custom(value || Function);
  }
}

Custom.prototype = {
  argsAnnotation: function (argsAnnotation) {
    this.argsAnnotation = argsAnnotation;

    return this;
  },
  comment: function (comment) {
    this.comment = comment;

    return this;
  },
  exclude: function () {
    this.exclude = true;

    return this;
  },
};

function ArgsAnnotation(value, argsAnnotation) {
  if (value instanceof Custom) {
    value = value.value;
  }

  return Custom(value).argsAnnotation(argsAnnotation);
}

function Comment(value, comment) {
  if (value instanceof Custom) {
    value = value.value;
  }

  return Custom(value).comment(comment);
}

function Exclude(value) {
  if (value instanceof Custom) {
    value = value.value;
  }

  return Custom(value).exclude();
}

module.exports = {
  ArgsAnnotation: ArgsAnnotation,
  Comment: Comment,
  Custom: Custom,
  Exclude: Exclude,
};
