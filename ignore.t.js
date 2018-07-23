class A {
  get b() {

  }
  set b(a) {

  }
  a() {

  }
}

A.prototype.x = 5;

Object.getOwnPropertyNames(A.prototype).forEach(function (k) {
  console.log(Object.getOwnPropertyDescriptor(A.prototype, k));
});