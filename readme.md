# UnitSnap

The library allows to use a captured or saved snapshot of the units observed during an execution flow as an assertion in unit tests.
The principle of this stands on the concept of the pure function which always has the same execution result and execution order (may be partially for individual purposes).
Then this result can be saved as a snapshot and compared with a snapshot of the same execution flow.

### Contents

- [UnitSnap](#unitsnap)
    - [Contents](#contents)
    - [Installation](#installation)
    - [Example of snapshot generation](#example-of-snapshot-generation)
    - [Example of snapshot assertion](#example-of-snapshot-assertion)
    - [Observer](#observer)
    - [History](#history)
    - [Mock](#mock)
        - [Customization](#customization)
    - [Fixture](#fixture)
        - [FixtureCallbackStrategy](#fixturecallbackstrategy)
        - [FixtureQueueStrategy](#fixturequeuestrategy)
        - [FixtureFsProvider (for Queue strategy)](#fixturefsprovider-for-queue-strategy)
        - [FixtureMemoryProvider (for Queue strategy)](#fixturememoryprovider-for-queue-strategy)
    - [Filter](#filter)
    - [Snapshot](#snapshot)
        - [Value processors](#value-processors)
        - [Type helpers](#type-helpers)
        - [SnapshotFsProvider](#snapshotfsprovider)
        - [SnapshotMemoryProvider](#snapshotmemoryprovider)
    - [Jasmine matcher](#jasmine-matcher)
    - [Using with typescript-ioc](#using-with-typescript-ioc)

### Installation

```bash
npm i @akaterra.co/unitsnap
```

### Example of snapshot generation

```typescript
import observer from '@akaterra.co/unitsnap'; // default pre-created UnitSnap observer

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

```typescript
snapshot.setFsProvider(__dirname).save('snapshot'); // saved as snapshot.snapshot.json in current directory
```

### Example of snapshot assertion

```typescript
import observer from '@akaterra.co/unitsnap'; // default pre-created UnitSnap observer

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

```typescript
const checkResult = snapshot.setFsProvider(__dirname).assertSaved('snapshot'); // "[0].args.b" as path of mismatched value
```

### Observer

```typescript
import { Observer } from '@akaterra/unitsnap';

const observer = Observer();
```

Observer provides a isolated context within which the History, Mock, Fixture and Snapshot (see description below) modules will be created and within which their intercommunication will be organized.
For example, the Mock will be linked to the History, or the Snapshot constructed with the **snapshot** will be configured by the basic Snapshot of the Observer's context.

For ease of use, Observer also implements a set of methods that are proxy methods for the corresponding module linked to the context.

* **env** - returns a context with the History, Mock, Fixture and Snapshot of the Observer.

  ```typescript
  observer.env.snapshot.setFsProvider(__dirname);
  
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

```typescript
import { History } from '@akaterra/unitsnap';

const history = History();
```

History chronologically collects the entries with results of execution of each single observed function of the execution flow.

The general structure of the entry:

```typescript
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

```typescript
function a(a, b, c) {
    return 1;
}

a(1, 2, 3);
```

generates entries containing the next fields:

```typescript
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

```typescript
function a(a, b, c) {
    throw 1;
}

a(1, 2, 3);
```

generates entries containing the next fields:

```typescript
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

Collected entries can be assigned to an epochs and can be filtered then by the necessary epoch.
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

```typescript
import { Mock } from '@akaterra/unitsnap';

const mock = Mock();
```

Mock commonly builds a fake representation of the initial entity which can be used instead of original entity.
Static methods, instance properties and static properties of the initial entity can be mocked with the special modifiers **StaticMethod**, **Property** and **StaticProperty**.
Besides, this mock can optionally be linked to the history so that the state of the call observed by the mock will be stored in the history.

* **from(props)** - constructs mock from the props

    Single mock:

    ```typescript
    import {
      Mock,
      Property,
      StaticMethod,
      StaticProperty,
      Undefined,
      This
    } from '@akaterra/unitsnap';

    const mock = Mock(history);

    const Mocked = mock.from({
        a: function () { return 1; }, // custom function
        b: Undefined, // stub function
        c: 123, // function returning 123
        d: Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // exception - can be linked to observer Fixture only in context of observer
        f: StaticMethod(Undefined), // custom static method
        g: Property().get(1).set(Undefined), // custom property returning "1" on get and does nothing on set
        h: StaticProperty().get(1).set(Undefined), // custom static property returning "1" on get and does nothing on set
        i: This, // stub function returning this
    });

    const mocked = new Mocked();

    mocked.a(); // returns 1
    mocked.b(); // returns undefined
    mocked.c(); // returns 123
    mocked.d(); // returns 1
    mocked.e(); // not been created
    mocked.f(); // returns undefined
    mocked.g; // returns 1
    mocked.g = 2;
    mocked.h; // returns 1
    mocked.h = 2;
    mocked.i(); // return this
    ```

    Mock in context of observer:

    ```typescript
    import {
      Observer,
      Property,
      StaticMethod,
      StaticProperty,
      Undefined,
      This
    } from '@akaterra/unitsnap';

    const observer = Observer();

    const Mocked = observer.from({
        a: function () { return 1; }, // custom function
        b: Undefined, // stub function
        c: 123, // function returning 123
        d: Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // linked to observer.Fixture.pop
        f: StaticMethod(2), // custom static method returning "2"
        g: Property().get(1).set(Undefined), // custom property returning "1" on get and does nothing on set
        h: StaticProperty().get(1).set(Undefined), // custom static property returning "1" on get and does nothing on set
        i: This, // stub function returning this
    });

    const mocked = new Mocked();

    mocked.a(); // returns "1"
    mocked.b(); // returns "undefined"
    mocked.c(); // returns "123"
    mocked.d(); // returns "1"
    mocked.e(); // returns popped value from observer Fixture similar to call of "d"
    mocked.f(); // returns "2"
    mocked.g; // returns "1"
    mocked.g = 2;
    mocked.h; // returns "1"
    mocked.h = 2;
    mocked.i(); // return this
    ```

* **by(class, props)** - constructs mock by the class with the custom props

    ```typescript
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

    ```typescript
    import {
      Mock,
      Property,
      StaticMethod,
      StaticProperty
    } from '@akaterra/unitsnap';

    const mock = Mock(history);

    const Mocked = mock.by(A);
    
    const mocked = new Mocked();

    mock.a(1, 2, 3); // returns "6"
    mock.b(); // returns "b"
    mock.c(); // returns "c"
    mock.d(); // returns "d"
    mock.e(); // returns "e"
    ```

    Single mock with a custom props:

    ```typescript
    import {
      Mock,
      Property,
      StaticMethod,
      StaticProperty,
      Undefined,
      This
    } from '@akaterra/unitsnap';

    const mock = Mock(history);

    const Mocked = mock.by(A, {
        constructor: 123, // generates constructor returning "123"
        a: function () { return 1; }, // custom function
        b: A, // A.prototype.b
        c: 123, // function returning 123
        d: Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // exception - can be linked to observer Fixture only in context of observer
        f: StaticMethod(2), // custom static method returning "2"
        g: Property().get(1).set(Undefined), // custom property returning "1" on get and does nothing on set
        h: StaticProperty().get(1).set(Undefined), // custom static property returning "1" on get and does nothing on set
        i: This, // stub function returning this
    });

    const mocked = new Mocked();

    mocked.a(); // returns "1"
    mocked.b(); // returns "b"
    mocked.c(); // returns "123"
    mocked.d(); // returns "1"
    mocked.e(); // not been created
    mocked.f(); // returns "2"
    mocked.g; // returns "1"
    mocked.g = 2;
    mocked.h; // returns "1"
    mocked.h = 2;
    mocked.i(); // return this
    ```

    Mock with a custom props in the Observer's context:

    ```typescript
    import {
      Observer,
      Property,
      StaticMethod,
      StaticProperty,
      Undefined,
      This
    } from '@akaterra/unitsnap';

    const observer = Observer();

    const Mocked = observer.by(A, {
        constructor: 123, // generates constructor returning "123"
        a: function () { return 1; }, // custom function
        b: A, // A.prototype.b
        c: 123, // function returning "123"
        d: Fixture().push(1, 2, 3), // linked to provided Fixture.pop
        e: Fixture, // linked to observer.Fixture.pop
        f: StaticMethod(2), // custom static method returning "2"
        g: Property().get(1).set(Undefined), // custom property returning "1" on get and does nothing on set
        h: StaticProperty().get(1).set(Undefined), // custom static property returning "1" on get and does nothing on set
        i: This, // stub function returning this
   });

    const mocked = new Mocked();

    mocked.a(); // returns "1"
    mocked.b(); // returns "b"
    mocked.c(); // returns "123"
    mocked.d(); // returns "1"
    mocked.e(); // returns popped value from observer Fixture similar to call of "d"
    mocked.f(); // returns "2"
    mocked.g; // returns "1"
    mocked.g = 2;
    mocked.h; // returns "1"
    mocked.h = 2;
    mocked.i(); // return this
    ```

* **override(class, props)** - overrides props of the class

    Generally can be used same as the **by** but instead of creation of a new class it overrides props of the provided class.
    The overridden props can be restored after by calling **RESTORE**:

    ```typescript
    import { Mock } from '@akaterra/unitsnap';

    const mock = Mock(history);

    mock.override(A, {
        constructor: 123, // does nothing, the original constructor can't be overridden
        a: function () {
            return 'a';
        }
    });

    A.RESTORE(); // A.prototype.a is been restored
    ```

* **spy(function)** - spies on a single function

Note, that the mocked method will be dynamically replaced by its copy on the first call of this method.
This made for the ability to collect call statistic on behalf of the instance but not its prototype.
```typescript
import { Mock } from '@akaterra/unitsnap';

const mock = Mock(history);

const MockA = mock.by(A, {
    x: 1
});

const a = new MockA();

a.x(); // statistics available now by "a.x", not by "a.prototype.x"
```

To leave statistics collection on behalf of prototype:
```typescript
import { Mock } from '@akaterra/unitsnap';

const mock = Mock(history);

const MockA = mock.by(A, {
    x: 1
}, true);

const a = new MockA();

a.x(); // statistics available by "a.prototype.x"
```

Same is for the "from" and the "override".

##### Customization

Mock properties can be customized with the **Custom** entity.

```typescript
import {
  ArgsAnnotation,
  Custom,
  Exclude,
  Mock,
  Undefined
} from '@akaterra/unitsnap';

const mock = Mock(history);

const Mocked = mock.by(A, {
    a: Custom(Undefined).argsAnnotation(['x', 'y', 'z']), // callee arguments with be named as "x", "y" and "z"
    b: Custom(Undefined).exclude(), // will be excluded from history
    c: ArgsAnnotation(['x', 'y', 'z'], Undefined), // same as "a" field
    d: Exclude(Undefined), // same as "b" field
});
```

### Fixture

```typescript
import { Fixture } from '@akaterra/unitsnap';

const fixture = Fixture();
```

Fixture provides a channel with fake data to be used as a result of the function call.

* **pop** - pops a value from the container.

* **push(...values)** - pushes values to the container.

* **throwOnCallback(function)** - checks the popped value via callback and throws values as an error.

* **throwOnClassOf(class)** - checks the popped value to be strict instance of class and throws values as an error.

* **throwOnInstanceOf(class)** - checks the popped value to be instance of class and throws values as an error.

##### FixtureCallbackStrategy

Callback strategy allows to use a custom callback as a generator for the popped value.

```typescript
fixture.setCallbackStrategy((...args: number[]) => 1);

fixture.push(1, 2, 3); // calls the callback with fake entries 1, 2, 3

fixture.pop(); // 1
fixture.pop(2); // [1, 1]
```

##### FixtureQueueStrategy

Queue strategy allows to use a queued values.

```typescript
fixture.setQueueStrategy();

fixture.push(1, 2, 3); // pushes fake entries 1, 2, 3

fixture.pop(); // 1 - popped from the beginning of the queue; [2, 3] is a rest
fixture.pop(2); // [2, 3]
```

##### FixtureFsProvider (for Queue strategy)

Filesystem provider allows to load values from the file.

```typescript
fixture.setName('test'); // set fixture name that will be used as a part of filename
fixture.setQueueStrategy();
fixture.setFsProvider(__dirname); // values from the __dirname/test.fixture.json will be loaded
```

##### FixtureMemoryProvider (for Queue strategy)

Memory provider allows to load values from the memory.

```typescript
fixture.setName('test'); // set fixture name that will be a key in the dictionary of values
fixture.setQueueStrategy();
fixture.setMemoryProvider({test: [1, 2, 3]}); // values by dictionary key "test" will be loaded
```

### Filter

```typescript
import { Filter } from '@akaterra/unitsnap';

const filter = Filter();
```

Filter allows to filter the collected historical entries and create a new snapshot over them.

If some subset of the collected historical entries is required, first of all the filtering conditions must be defined.
Then the snapshot over this subset of the historical entries can be created.

* **context(obj)** - adds "filter by context", all entries belonging to the **obj** will be taken.

* **custom(function)** - adds "filter by custom handler", all entries will be checked by the handler.

* **epoch(epoch)** - adds "filter by epoch", all entries belonging to the **epoch** will be taken.

* **fn(function)** - adds "filter by function", all entries having the **function** as an observed function will be taken.

* **tags(...tags)** - adds "filter by tags", all entries having the tags will be taken.

* **not()** - enables "negative" filter once so that the next filter will perform a negative comparison:
  ```typescript
  filter.not().epoch('excluded epoch'); // excludes all entries with "epoch" fields = "excluded epoch"
  ```

* **notPromiseResult()** - adds "filter if result is not Promise", all entries having not Promise result will be taken.

* **snapshot()** - create snapshot over the filtered historical entries.

### Snapshot

```typescript
import { Snapshot } from '@akaterra/unitsnap';

const snapshot = Snapshot();
```

Snapshot contains the entire or the filtered subset of the historical entries.
These entries can be serialized and asserted with the some other snapshot.
Snapshot entries in their turn could be filtered and then create an additional snapshot over them.

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

* **exists(name)** - checks if the snapshot exists. 

* **load(name)** - loads serialized representation of the snapshot.

* **loadCopy(name)** - loads serialized representation of the snapshot as a new Snapshot.

* **remove(name)** - removes saved snapshot.

* **save(name)** - saves a serialized representation of the snapshot.

* **serialize(format="native" | "pretty" | function)** - creates a serialized representation of the snapshot.
  * "native" - returns array of serialized entries
  * "pretty" - returns formatted string
  * function - custom formatter

* **setName(name)** - sets the name of the snapshot, this name will be used as a default name for **exists**, **load**, **loadCopy**, **remove** and **save**.

##### Value processors

The specific value of some entry can be serialized with the custom serializer.
It can be convenient in cases when the some generalized representation of the value required.
For example, assertion of type "instance of class" can be applied to the value serialized in form of "class name" of the value instead of its initial value.

Note, that each added processor will be inserted into beginning of the processors chain so that it will be applied first.

* **addProcessor(checker, serializer)** -  adds custom checker and serializer.

  **checker** is a function that checks if the value should be serialized, **serializer** performs value serialization.

* **addInstanceOfProcessor(class, serializer)** - adds "instance of" processor, the value will be serialized as:
  ```typescript
  {
    '[[ Data ]]': <class name>,
    '[[ Type ]]': 'instanceOf'
  }
  ```

  **serializer** will be called if the value has a instance of the provided class or its inherent.

* **addPathProcessor(path, serializer)** - adds "match to path" processor, the value having **path** will be serialized with **serializer**

  Path can contain an asterisk ("*") as any number of characters and an underscore ("_") as a single character.

* **addRegexPathProcessor(regex, serializer)** - adds "match to regex path" processor, the value with path matched to the **regex** will be serialized with **serializer**.

* **addStrictInstanceOfProcessor(class, serializer)** - adds "strict instance of" processor, the value will be serialized as:
  ```typescript
  {
    '[[ Data ]]': <class name>,
    '[[ Type ]]': 'strictInstanceOf'
  }
  ```

  **serializer** will be called if the value has a strict instance of the provided class.

* **addUndefinedProcessor(serializer)** - adds "undefined value" processor, the value will be serialized as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': 'undefined'
  }
  ```

If matched and serialized value has to be continued with the rest processors use **Continue** type helper.
```typescript
snapshot.addProcessor((value) => value === 5, (value) => new Continue(value));
```

##### Type helpers

The set of special type helpers can be used with value processors that can be useful in some cases.

```typescript
snapshot.addProcessor(Date); // adds checker "instance of Date" and serializer to {'[[ Data ]]': null, '[[ Type ]]': 'date'}
snapshot.serialize();
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
            "[[ Data ]]": null,
            "[[ Type ]]": "date"
        }
    }
]
```

Available helpers:

* **AnyType** - serializes any value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "any"
  }
  ```

* **BooleanType (or JS Boolean type)** - checks the value to be boolean and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "boolean"
  }
  ```

* **ClassOf** - checks the value to be class of and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': "<class name>",
    '[[ Type ]]': "classOf"
  }
  ```

* **Continue** - the value will be continued with the rest processors.

* **Copy** - creates as deep copy of the value using [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone).
  If there is no support of **structuredClone** feature the [polyfill](https://github.com/ungap/structured-clone) can be used instead.

* **DateType (or JS Date type)** - checks the value to be instance of Date and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "date"
  }
  ```

* **DateValue** - checks the value to be instance of Date and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': "<ISO string>",
    '[[ Type ]]': "date"
  }
  ```

* **Ignore** - the value will be omitted in the serialized snapshot.

* **In** - checks the value is contained in provided enum:
  ```typescript
  const value = In(1, 2, 3).serialize(1);

  {
    '[[ Data ]]': '1,2,3',
    '[[ Type ]]': 'in'
  }
  ```

  ```typescript
  const value = In(1, 2, 3).serialize(4);

  {
    '[[ Data ]]': '4 ∉ 1,2,3',
    '[[ Type ]]': 'not:in'
  }
  ```

* **InstanceOf** - checks the value to be instance of Date and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': "<class name>",
    '[[ Type ]]': "instanceOf"
  }
  ```

* **NumberIsCloseTo** - checks the value to be number which is close to some number with a difference and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': '<expected> ±<difference>',
    '[[ Type ]]': 'numberIsCloseTo'
  }
  ```

* **NumberIsPreciseTo** - same as **NumberIsCloseTo** but uses negative exponent to calculate an expected difference:
  ```typescript
  {
    '[[ Data ]]': "<expected> ±<difference>",
    '[[ Type ]]': "numberIsPreciseTo"
  }
  ```

* **NumberType (or JS Number type)** - checks the value to be number and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "number"
  }
  ```

* **Range** - checks the value is in range (numeric, lexicographic or dates) and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': "<min> .. <max>",
    '[[ Type ]]': "range"
  }
  ```

* **StringType (or JS String type)** - checks the value to be string and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "string"
  }
  ```

* **UndefinedType (or undefined)** - checks the value to be undefined value and serializes the value as:
  ```typescript
  {
    '[[ Data ]]': null,
    '[[ Type ]]': "undefined"
  }
  ```

##### SnapshotFsProvider

Filesystem provider allows to load and save snapshots as files.

```typescript
snapshot.setFsProvider(__dirname);

snapshot.save('test'); // __dirname/test.snapshot.json

snapshot.load('test');
```

##### SnapshotMemoryProvider

Memory provider allows to load and save temporary snapshot in the process memory.

```typescript
snapshot.setMemoryProvider();

snapshot.save('test');

snapshot.load('test');
```

### Jasmine matcher

The special Jasmine matcher **toMatchSnapshot** can be used in specs for snapshots saving and assertion.

Example (see full example /spec/jasmine.spec.ts):

```typescript
import observer, { extendJasmine } from '@akaterra/unitsnap';

describe('some suite', () => {
    observer.env.snapshot.setFsProvider(__dirname);

    beforeAll(() => extendJasmine()); // adds matcher to jasmine, this line is important
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

        expect(observer).toMatchSnapshot('some spec'); // saves or asserts the snapshot __dirname/some_spec.snapshot.json
    });
});
```

Run Jasmine with the env variable **SAVE_SNAPSHOT**=1 telling to the matcher to save snapshots.
The snapshot will be saved into the `__dirname/some_spec.snapshot.json` file.

Be sure that the saved snapshot represents valid state of the execution flow.

Run Jasmine usually now to assert the saved snapshot (not existing snapshot will be auto saved instead).
It will throw standard Jasmine **toEqual** error on mismatch.

### Using with typescript-ioc

Next bootstrap code can be useful:

```typescript
import { Container, Scope } from 'typescript-ioc';

export const unitsnapIoC = (observer) => {
    const ioc = {
        mocked: new Array<any>(),

        // builds mock by baseCls or cls and registers it in IoC
        by: (cls, props?, baseCls?) => {
            const newCls = observer.by(baseCls || cls, props);

            ioc.mocked.unshift([cls, Container.getType(cls), newCls]);

            Container.bind(cls).scope(Scope.Singleton).to(newCls);

            return ioc;
        },

        // builds mock by baseCls or cls and registers it in IoC
        override: (cls, props?, baseCls?) => {
            const newCls = observer.override(baseCls || cls, props);

            ioc.mocked.unshift([cls, Container.getType(cls), newCls]);

            Container.bind(cls).scope(Scope.Singleton).to(newCls);

            return ioc;
        },

        // restores original association
        restore: () => {
            for (const cls of ioc.mocked) {
                Container.bind(cls[0]).scope(Scope.Singleton).to(cls[1] || cls[0]);
            }

            ioc.mocked = [];

            return ioc;
        }
    };

    return ioc;
};
```
