# UnitSnap.js

The library allows to use the taken or saved snapshot of the units observed during an execution flow as an assertion in unit tests.
The principle of this stands on the concept of the pure function which always has the same result of execution (may be partially for individual purposes).
Then this result can be saved as a snapshot and compared with a snapshot of the same execution flow.

### Example of snapshot generation

```javascript
const observer = require('unitsnap.js').default; // default pre-created UnitSnap observer

class A {
    a(a, b, c) {
        return a + b + c;
    }
}

A = observer.by(A); // mock A class observing on all methods ("a")

const a = new A();

observer.begin(); // start observing

a.a(1, 2, 3);

observer.end();

const snapshot = observer.snapshot(); // take snapshot
```

Serialized snapshot (snapshot.serialize()):

```json
[
    {
        "args": {
            "*": [],
            "a": 1,
            "b": 2,
            "c": 3
        }
    },
    {
        "result": 6
    }
]
```

Save taken snapshot:

```javascript
snapshot.setFsProvider(__dirname).save('snapshot');
```

### Example of snapshot assertion

```javascript
const observer = require('unitsnap.js').default; // default pre-created UnitSnap observer

class A {
    a(a, b, c) {
        return a + b + c;
    }
}

A = observer.by(A); // mock A class observing on all methods ("a")

const a = new A();

observer.begin(); // start observing

a.a(1, 1, 1); // differs from a.a(1, 2, 3) that has been saved before

observer.end();

const snapshot = observer.snapshot(); // take snapshot
```

Serialized snapshot (snapshot.serialize()):

```json
[
    {
        "args": {
            "*": [],
            "a": 1,
            "b": 1,
            "c": 1
        }
    },
    {
        "result": 3
    }
]
```

Assert saved snapshot:

```javascript
const checkResult = snapshot.setFsProvider(__dirname).assertSaved('snapshot'); // "[0].args.b" as path of mismatched value
```

### Observer

```javascript
const Observer = require('unitsnap.js').Observer;
```

Observer provides a isolated context within which the History, Mock, Fixture and Snapshot (see description below) modules will be created and within which their intercommunication will be organized.
For example, the Mock will be linked to the History, or the Snapshot constructed with the **snapshot** will be configured by the basic Snapshot of the Observer's context.

For ease of use, Observer also implements a set of methods that are proxy methods for the corresponding module linked to the context.

* **config()** - returns a config object with the History, Mock, Fixture and Snapshot of the Observer.

  ```javascript
  observer.config().snapshot.setFsProvider(__dirname);
  
  observer.snapshot(); // a new Snapshot automatically configured to use the filesystem provider
  ```

* **push(...values)** - Fixture.push, pushes values into a Fixture container.

* **begin(epoch, comment)** - History.begin, begins a historical epoch.

* **end()** - History.end, ends a historical epoch.

  The method also restores overridden by **override** classes within the epoch.

* **by(class, props)** - Mock.by, constructs mock by the class with optional custom props.

* **from(props)** - Mock.from, constructs mock from the custom props.

* **override(class, props)** - Mock.override, overrides props of the class.

  The overridden class will be linked to the current epoch so that the class will be automatically restored on its end.

* **spy(function)** - Mock.spy, spies on the function.

* **filter()** - creates Filter over the historical entries.

* **snapshot()** - creates Snapshot over the historical entries.

### History

```javascript
const History = require('unitsnap.js').History;
```

History chronologically collects the entries with results of execution of each single observed function of the execution flow.

The general structure of the entry:

```javascript
args: {
    '*': [ // rest of arguments
        <value>,..
    ],
    <arg 1 name>: <value>,.. // value of named argument
},
callsCount: <number>, // total calls count
comment: <string>, // comment of the current historical epoch
context: this, // context of call
epoch: <string>, // current historical epoch
exception: <value>, // exception
exceptionsCount: <number>, // total exceptions count
isAsync: <boolean>, // async (Promise) result was returned
isAsyncPending: <boolean>, // async (Promise) result is still not resolved or rejected
isException: <boolean>, // is call thrown exception
name: <string>, // name of single function ("func") or function of class ("class.func")
origin: <function>, // observed function
replacement: <function>, // observer function
result: <value>, // return result
tags: [ // custom tags
    <value>,..
],
time: <Date>,
type: <string>, // type, "single", "constructor" or "method"
```

A some single called function is commonly will generate two entries:

1) with the **args** field on the function call
2) with the **result** and **exception** fields on the end of the function execution

```javascript
function a(a, b, c) {
    return 1;
}

a(1, 2, 3);
```

generates entries containing the next fields:

```javascript
[
    {
        args: {
            '*': [],
            a: 1,
            b: 2,
            c: 3
        }
    },
    {
        result: 1
    }
]
```

```javascript
function a(a, b, c) {
    throw 1;
}

a(1, 2, 3);
```

generates entries containing the next fields:

```javascript
[
    {
        args: {
            '*': [],
            a: 1,
            b: 2,
            c: 3
        }
    },
    {
        exception: 1
    }
]
```

Asynchronous functions returning a Promise will additionally generate an entry with the result of the promise resolving (as "result") or with the error of the promise rejection (as "exception").

Collected entries can be assigned to an epochs and will be filtered after by the necessary epoch. 
Epochs can be nested.

* **getCurrentEpoch()** - returns the current epoch descriptor or null if the history is not yet begun.

* **addOnEndCallback(function)** - adds a callback to the current epoch.

  This callback will be triggered on the epoch end.

* **begin(epoch, comment)** - begins a historical epoch.

* **end()** - ends a historical epoch.

* **filter()** - creates Filter over the collected historical entries.

* **flush()** - flushes epochs and collected historical entries.

* **push(entry)** - pushes the historical entry.

### Mock

```javascript
const Mock = require('unitsnap.js').Mock;
```

The Mock builds a mock that commonly is a fake representation of the initial entity and can be used instead of original entity.
Besides, this mock can optionally be linked to the history so that the state of the call observed by the mock will be stored in the history.

* **from(props)** - constructs mock from the props

    Single mock:

    ```javascript
    const mock = new Mock(history);

    const Mocked = mock.from({
        a: function () { return 1; }, // custom function
        b: Function, // stub function
        c: 123, // function returning 123
        d: new Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // exception - can be linked to observer Fixture only in context of observer
    });

    const mocked = new Mocked();

    mocked.a(); // returns 1
    mocked.b(); // returns undefined
    mocked.c(); // returns 123
    mocked.d(); // returns 1
    mocked.e(); // not been created
    ```

    Mock in context of observer:

    ```javascript
    var observer = new Observer();

    var Mocked = observer.from({
        a: function () { return 1; }, // custom function
        b: Function, // stub function
        c: 123, // function returning 123
        d: new Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // linked to observer.Fixture.pop
    });

    const mocked = new Mocked();

    mocked.a(); // returns 1
    mocked.b(); // returns undefined
    mocked.c(); // returns 123
    mocked.d(); // returns 1
    mocked.e(); // returns popped value from observer Fixture similar to call of "d"
    ```

* **by(class, props)** - constructs mock by the class with the custom props

    ```javascript
    class A {
        a(a, b, c) {
            return a + b + c;
        }
        b() {
            return 'b';
        }
        c() {
            return 'c';
        }
        d() {
            return 'd';
        }
        e() {
            return 'e';
        }
    }
    ```

    Mock by entire class:

    ```javascript
    const mock = new Mock(history);

    const Mocked = mock.by(A);
    
    const mocked = new Mocked();

    mock.a(1, 2, 3); // returns 6
    mock.b(); // returns 'b'
    mock.c(); // returns 'c'
    mock.d(); // returns 'd'
    mock.e(); // returns 'e'
    ```

    Single mock with a custom props:

    ```javascript
    const mock = new Mock(history);

    const Mocked = mock.by(A, {
        constructor: 123, // generates constructor returning "123"
        a: function () { return 1; }, // custom function
        b: A, // A.prototype.b
        c: 123, // function returning 123
        d: new Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // exception - can be linked to observer Fixture only in context of observer
    });

    const mocked = new Mocked();

    mocked.a(); // returns 1
    mocked.b(); // returns 'b'
    mocked.c(); // returns 123
    mocked.d(); // returns 1
    mocked.e(); // not been created
    ```

    Mock with a custom props in the Observer's context:

    ```javascript
    const observer = new Observer();

    const Mocked = observer.by(A, {
        constructor: 123, // generates constructor returning "123"
        a: function () { return 1; }, // custom function
        b: A, // A.prototype.b
        c: 123, // function returning "123"
        d: new Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // linked to observer.Fixture.pop
    });

    const mocked = new Mocked();

    mocked.a(); // returns 1
    mocked.b(); // returns 'b'
    mocked.c(); // returns 123
    mocked.d(); // returns 1
    mocked.e(); // returns popped value from observer Fixture similar to call of "d"
    ```

* **override(class, props)** - overrides props of the class

    Generally can be used same as the **by** but instead of creation of a new class it overrides props of the provided class.
    The overridden props can be restored after by calling **RESTORE**:

    ```javascript
    const mock = new Mock(history);

    mock.override(A, {
        constructor: 123, // does nothing, the original constructor can't be overridden
        a: function () {
            return 'a';
        }
    });

    A.RESTORE(); // A.prototype.a is been restored
    ```

* **spy(function)** - spies on a single function

### Fixture

```javascript
const Fixture = require('unitsnap.js').Fixture;
```

Fixture provides a fake data to be used as a result of the function call.

* **pop** - pops a value from the container.

* **push(...values)** - pushes values to the container.

* **throwOnCallback(function)** - checks the popped value via callback and throws values as an error.

* **throwOnClassOf(class)** - checks the popped value to be strict instance of class and throws values as an error.

* **throwOnInstanceOf(class)** - checks the popped value to be instance of class and throws values as an error.

##### FixtureCallbackStrategy

Callback strategy allows to use a custom callback as a generator for the popped value.

```
fixture.setCallbackStrategy(() => 1);

fixture.push(1, 2, 3); // calls the callback with 1, 2, 3

fixture.pop(); // 1
```

##### FixtureQueueStrategy

Queue strategy allows to use a queued values.

```
fixture.setQueueStrategy();

fixture.push(1, 2, 3); // [1, 2, 3]

fixture.pop(); // 1 - popped from the beginning of the queue; [2, 3] is a rest
```

##### FixtureFsProvider (for Queue strategy)

Filesystem provider allows to load values from the file.

```
fixture.setName('test'); // set fixture name that will be used as a part of filename

fixture.setQueueStrategy();

fixture.setFsProvider(<fixtures dir>); // values from the <fixtures dir>/test.fixture.json will be loaded
```

##### FixtureMemoryProvider (for Queue strategy)

Filesystem provider allows to load values from the memory.

```
fixture.setName('test'); // set fixture name that will be a key in the dictionary of values

fixture.setQueueStrategy();

fixture.setFsProvider({test: [1, 2, 3]}); // values by dictionary key "test" will be loaded
```

### Filter

Filter allows to filter the collected historical entries and create a new snapshot over them.

If some subset of the collected historical entries is required, first of all the filtering conditions must be defined.
Then the snapshot over this subset of the historical entries can be created.

* **context(obj)** - adds "filter by context", all entries belonging to the **obj** will be taken.

* **custom(function)** - adds "filter by custom handler", all entries will be checked by the handler.

* **epoch(epoch)** - adds "filter by epoch", all entries belonging to the **epoch** will be taken.

* **fn(function)** - adds "filter by function", all entries having the **function** as an observed function will be taken.

* **tags(...tags)** - adds "filter by tags", all entries having the tags will be taken.

* **not()** - enables "negative" filter once so that the next filter will perform a negative comparison:
  ```javascript
  filter.not().epoch('excluded epoch'); // excludes all entries with "epoch" fields = "excluded epoch"
  ```

* **snapshot()** - create snapshot over the filtered historical entries.

### Snapshot

Snapshot contains the entire or the filtered subset of the historical entries.
These entries can be serialized and asserted with the some other snapshot.
Also it is possible to create a new Filter over the entries of the snapshot, then filter and create an additional snapshot over them.

* **assert(snapshot)** - asserts other snapshot.

* **assertSaved(name)** - asserts the saved snapshot.

* **filter()** - creates a new Filter over the snapshot entries.

* **includeArgs()** - "args" section of the entry will be included to the serialized representation.

* **includeCallsCount()** - "callCount" section of the entry will be included to the serialized representation.

* **includeEpoch()** - "epoch" section of the entry will be included to the serialized representation.

* **includeException()** - "exception" section of the entry will be included to the serialized representation.

* **includeExceptionsCount()** - "exceptionCount" section of the entry will be included to the serialized representation.

* **includeIsAsync()** - "isAsync" section of the entry will be included to the serialized representation.

* **includeName()** - "name" section of the entry will be included to the serialized representation.

* **includeType()** - "type" section of the entry will be included to the serialized representation.

* **load(name)** - loads serialized representation of the snapshot.

* **loadCopy(name)** - loads serialized representation of the snapshot as a new Snapshot.

* **save(name)** - saves a serialized representation of the snapshot.

* **serialize()** - creates a serialized representation of the snapshot.

##### Value processors

The specific value of some entry can be serialized with the custom serializer.
It can be convenient in cases when the some generalized representation of the value required.
For example, assertion of type "instance of class" can be applied to the value serialized in form of "class name" of the value instead of its initial value.

Note, that each added processor will be inserted into beginning of the processors chain so that it will be applied first.

* **addProcessor(checker, serializer)** -  adds custom checker and serializer.

  **checker** is a function that checks if the value should be serialized, **serializer** performs value serialization.

* **addClassOfProcessor(class, serializer)** - adds "class of" processor, the value will be serialized as:
  ```javascript
  {
    $$data: <class name>,
    $$type: 'classOf'
  }
  ```

* **addInstanceOfProcessor(class, serializer)** - adds "instance of" processor, the value will be serialized as:
  ```javascript
  {
    $$data: <class name of instance>,
    $$type: 'instanceOf'
  }
  ```

* **addPathProcessor(path, serializer)** - adds "match to path" processor, the value having **path** will be serialized with **serializer**

  Path can contain an asterisk ("*") as any number of characters and an underscore ("_") as a single character.

* **addRegexPathProcessor(regex, serializer)** - adds "match to regex path" processor, the value with path matched to the **regex** will be serialized with **serializer**.

* **addUndefinedProcessor(serializer)** - adds "undefined value" processor, the value will be serialized as:
  ```javascript
  {
    $$data: null,
    $$type: 'undefined'
  }
  ```

##### Type helpers

The set of special type helpers can be used with value processors that can be useful in some cases.

```javascript
snapshot.addProcessor(Date); // adds checker "instance of Date" and serializer to {$$data: null, $$type: 'date'}
```

Serialized snapshot:

```json
[
    {
        "args": {
            "*": []
        }
    },
    {
        "result": {
            "$$data": null,
            "$$type": "date"
        }
    }
]
```

Available helpers:

* **AnyType** - serializes any value as:
  ```javascript
  {
    $$data: null,
    $$type: "any"
  }
  ```

* **BooleanType (or JS Boolean type)** - checks the value to be boolean and serializes the value as:
  ```javascript
  {
    $$data: null,
    $$type: "boolean"
  }
  ```

* **ClassOfType** - checks the value to be class of and serializes the value as:
  ```javascript
  {
    $$data: <class name>,
    $$type: "classOf"
  }
  ```

* **DateType (or JS Date type)** - checks the value to be instance of Date and serializes the value as:
  ```javascript
  {
    $$data: null,
    $$type: "date"
  }
  ```

* **DateValue** - checks the value to be instance of Date and serializes the value as:
  ```javascript
  {
    $$data: <ISO string>,
    $$type: "date"
  }
  ```

* **Ignore** - the value will be omitted in the serialized snapshot.

* **InstanceOfType** - checks the value to be instance of Date and serializes the value as:
  ```javascript
  {
    $$data: <class name>,
    $$type: "instanceOf"
  }
  ```

* **NumberType (or JS Number type)** - checks the value to be number and serializes the value as:
  ```javascript
  {
    $$data: null,
    $$type: "number"
  }
  ```

* **StringType (or JS String type)** - checks the value to be string and serializes the value as:
  ```javascript
  {
    $$data: null,
    $$type: "string"
  }
  ```

* **UndefinedType (or undefined)** - checks the value to be undefined value and serializes the value as:
  ```javascript
  {
    $$data: null,
    $$type: "undefined"
  }
  ```

##### SnapshotFsProvider

Filesystem provider allows to load and save snapshots as files.

```javascript
snapshot.setFsProvider(__dirname);

snapshot.save('test'); // __dirname/test.snapshot.json

snapshot.load('test');
```

##### SnapshotMemoryProvider

Memory provider allows to load and save temporary snapshot in memory.

```javascript
snapshot.setMemoryProvider();

snapshot.save('test');

snapshot.load('test');
```

### Jasmine matcher

The special Jasmine matcher **toMatchSnapshot** can be used in specs for snapshots saving and assertion.

Enable the matcher and configure default snapshot, for example, to use the file system provider:

```javascript
var unitsnap = require('unitsnap.js');

unitsnap.extendJasmine();

unitsnap.config().snapshot.setFsProvider(__dirname);
```

Use the matcher in some **it**:

```
it('should do something', function () {
    ...

    expect(observer.snapshot()).toMatchSnapshot('test');
});
```

Run Jasmine with the env variable **SAVE_SNAPSHOT**=1 telling to the matcher to save snapshots.
The snapshot will be saved into the "\<__dirname>/test.snapshot.js" file.

Be sure that the saved snapshot represents valid state of the execution flow.

Run Jasmine usually now to assert the saved snapshot.
It will throw standard Jasmine **toEqual** error on mismatch.

Example (see full example /spec/example.spec.js):

```javascript
const unitsnap = require('unitsnap.js');

describe('some suite', () => {
    const observer = unitsnap.default;

    observer.config().snapshot.setFsProvider(__dirname);

    beforeAll(() => unitsnap.extendJasmine());
    beforeEach(() => observer.begin());
    afterEach(() => observer.end());
    
    it('some spec', () => {
        class A {
            b(x) {
                return 1;
            }
        }
        
        const Mock = observer.by(A);
        const mock = new Mock();
        
        mock.b(111);

        expect(observer).toMatchSnapshot('some spec'); // saves or asserts the snapshot <__dirname>/some_spec.snapshot.json
    });
});
```
