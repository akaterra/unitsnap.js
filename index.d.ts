// filter
export class Filter {
    new(): Filter;
    link(observer: Observer): this;
    unlink(): this;
    context(context: any): this;
    ctx(context: any): this;
    custom(fn: (...args: any[]) => boolean): this;
    epoch(epoch: string): this;
    fn(fn: (...args: any[]) => any): this;
    notPromiseResult(): this;
    tags(...tags): this;
    not(): this;
    snapshot(): Snapshot;
}
// fixture
export class Fixture {
    new(): Fixture;
    setName(name: string): this;
    setStrategy(strategy: FixtureCallbackStrategy|FixtureQueueStrategy): this;
    setCallbackStrategy(cb: (...args) => any): this;
    setQueueStrategy(values: any[]): this;
    setFsProvider(dirOrProvider: string|FixtureFsProvider): this;
    setMemoryProvider(dirOrProvider: {[key: string]: any[] }|FixtureMemoryProvider): this;
    pop(): any;
    push(...args: any[]): this;
    throwOnCallback(cb: (value: any) => boolean): this;
    throwOnClassOf(cls: {new(...args: any[]): any }): this;
    throwOnInstanceOf(cls: {new(...args: any[]): any }): this;
}
export class FixtureCallbackStrategy {
    new(cb: (...args: any[]) => any): FixtureCallbackStrategy;
    set(cb: (...args: any[]) => any): this;
    pop(): any;
    push(...args: any[]): this;
}
export class FixtureQueueStrategy {
    new(values: any[]): FixtureQueueStrategy;
    set(values: any[]): this;
    pop(): any;
    push(...args: any[]): this;
}
export abstract class FixtureProvider {
    setName(name: string): this;
    load(name: string): this;
}
export class FixtureFsProvider extends FixtureProvider{
    new(dir: string): FixtureFsProvider;
}
export class FixtureMemoryProvider extends FixtureProvider {
    new(values: any[]): FixtureMemoryProvider;
}
// history
export class History {
    new(): History;
    getCurrentEpoch(): null|HistoryEpoch;
    link(observer: Observer): this;
    unlink(): this;
    begin(epoch?: string, comment?: string, callbacks?: (() => any)[]): this;
    end(): this;
    addOnEndCallback(cb: () => any): this;
    flush(): this;
    filter(): Filter;
    push(state: State, tags?: string[]): this;
}
export interface HistoryEpoch {
    callbacks: (() => any)[];
    comment: string;
    epoch: string;
}
// mock
export class Mock {
    new(history?: History): Mock;
    by<T=object>(cls: {new(...args: any[]): T}, props?: (string[]|{[key: string]: any })): {new(...args: any[]): T};
    from<T=object>(props: {[key: string]: any }): {new(...args: any[]): T};
    override<T=object>(cls: {new(...args: any[]): T}, props?: (string[]|{[key: string]: any })): {new(...args: any[]): T};
    spy(fn: (...args) => any): (...args) => any;
}
export interface PropertyDescriptor {
    get: any;
    set: any;
    value: any;
}
export interface MockCustom {
    value: any;
    argsAnnotation(argsAnnotation: ((...args) => any)|string[]): this;
    exclude(): this;
}
export interface MockProperty {
    descriptor: Partial<PropertyDescriptor>;
    get(getter: any): this;
    set(setter: any): this;
}
export interface MockMethod {
    value: any;
}
export function ArgsAnnotation(argsAnnotation: ((...args) => any)|string[]): MockCustom;
export function Custom(value?: any): MockCustom;
export function Exclude(): MockCustom;
export function Initial(): void;
export function Property(descriptor: Partial<PropertyDescriptor>): MockProperty;
export function StaticProperty(descriptor: Partial<PropertyDescriptor>): MockProperty;
export function StaticMethod(value?: any): MockMethod;
// observer
export class Observer {
    new(): Observer;
    setName(name: string): this;
    config(): ObserverConfig;
    begin(epoch?: string, comment?: string): this;
    end(): this;
    by<T=object>(cls: {new(...args: any[]): T}, props?: (string[]|{[key: string]: any })): {new(...args: any[]): T};
    from<T=object>(props: {[key: string]: any }): {new(...args: any[]): T};
    override<T=object>(cls: {new(...args: any[]): T}, props?: (string[]|{[key: string]: any })): {new(...args: any[]): T};
    spy(fn: (...args) => any): (...args) => any;
    push(...args: any[]): this;
    filter(): Filter;
    snapshot(): Snapshot;
}
export interface ObserverConfig {
    fixture: Fixture;
    mock: Mock;
    snapshot: Snapshot;
}
// snapshot
export class Snapshot {
    new(): Snapshot;
    setConfig(config: SnapshotConfig): this;
    setMapper(mapper: (state: State) => any): this;
    setName(name: string): this;
    setProvider(provider: SnapshotProvider): this;
    setFsProvider(dir: string): this;
    setMemoryProvider(dictionary: {[key: string]: Partial<State>[]}): this;
    link(observer: Observer): this;
    unlink(): this;
    addProcessor(checker: (value: any) => boolean, serializer: ((value: any) => any)|{new(): Ignore}): this;
    addClassOfProcessor(cls: {new(...args: any[]): any}, serializer?: ((value: any) => any)|{new(): Ignore}): this;
    addInstanceOfProcessor(cls: {new(...args: any[]): any}, serializer?: ((value: any) => any)|{new(): Ignore}): this;
    addPathProcessor(path: string, serializer: ((value: any) => any)|{new(): Ignore}): this;
    addRegexPathProcessor(regex: RegExp, serializer: ((value: any) => any)|{new(): Ignore}): this;
    addUndefinedProcessor(serializer: ((value: any) => any)|{new(): Ignore}): this;
    addProcessors(processors: {checker: (value: any) => boolean, serializer: ((value: any) => any)|{new(): Ignore}}[]): this;
    assert(snapshot: Partial<State>[]|Snapshot): true|string;
    assertSaved(name: string): true|string;
    exists(name?: string): boolean;
    filter(): Filter;
    includeArgs(flag?: boolean): this;
    includeCallsCount(flag?: boolean): this;
    includeEpoch(flag?: boolean): this;
    includeException(flag?: boolean): this;
    includeExceptionsCount(flag?: boolean): this;
    includeIsAsync(flag?: boolean): this;
    includeName(flag?: boolean): this;
    includeType(flag?: boolean): this;
    isEnabled(flag: string): boolean;
    load(name?: string): Snapshot;
    remove(name?: string): Snapshot;
    save(name?: string): this;
    serialize(): Partial<State>[];
}
export interface SnapshotConfig {
    args: boolean;
    callsCount: boolean;
    exception: boolean;
    exceptionsCount: boolean;
    isAsync: boolean;
    name: boolean;
    result: boolean;
    type: boolean;
}
export abstract class SnapshotProvider {
    exists(name: string): boolean;
    load(name: string): Partial<State>[];
    remove(name: string): this;
    save(name: string, snapshot: Partial<State>[]|Snapshot): this;
}
export class SnapshotFsProvider extends SnapshotProvider {
    new(dir: string): SnapshotFsProvider;
}
export class SnapshotMemoryProvider extends SnapshotProvider {
    new(dictionary: {[key: string]: Partial<State>[]}): SnapshotMemoryProvider;
}
// state
export interface State {
    args: {
        '*': any[];
        [key: string]: any;
    };
    callsCount: number;
    comment: string;
    context: any;
    epoch: string;
    exception: Error;
    exceptionsCount: number;
    isAsync: boolean;
    isAsyncPending: boolean;
    isException: boolean;
    name: string;
    origin: (...args: any[]) => any;
    replacement: (...args: any[]) => any;
    result: any;
    tags: string[];
    time: Date;
    type: 'constructor'|'method'|'getter'|'setter'|'single'|'staticMethod'|'staticGetter'|'staticSetter';
}
// type helpers
export abstract class TypeHelper<T=any> {
    check(value: T): boolean;
    serialize(value: T): boolean;
}
export class AnyType extends TypeHelper {}
export class BooleanType extends TypeHelper {}
export class ClassOfType extends TypeHelper {
    new(value: {new(...args: any[]): any}): ClassOfType;
}
export class DateType extends TypeHelper {}
export class DateValue extends TypeHelper {}
export class Ignore extends TypeHelper {}
export class InstanceOfType extends TypeHelper {
    new(value: {new(...args: any[]): any}): InstanceOfType;
}
export class NumberType extends TypeHelper {}
export class StringType extends TypeHelper {}
export class UndefinedType extends TypeHelper {}
// index
export function create(): Observer;
export function extendJasmine();
