declare module UnitSnap {
    export interface Filter {
        link(observer: Observer): this;
        unlink(): this;
        context(context: any): this;
        ctx(context: any): this;
        custom(fn: (...args) => boolean): this;
        epoch(epoch: string): this;
        fn(fn: (...args) => any): this;
        notPromiseResult(): this;
        tags(...tags): this;
        not(): this;
        snapshot(): Snapshot;
    }

    export interface Fixture {
        setName(name: string): this;
        setStrategy(strategy: FixtureCallbackStrategy|FixtureQueueStrategy): this;
        setCallbackStrategy(cb: (...args) => any): this;
    }

    export interface FixtureCallbackStrategy {

    }

    export interface FixtureQueueStrategy {

    }

    export interface Mock {
        by<T=object>(cls: { new(): T }, props?: (string[]|{ [key: string]: any })): { new(): T };
        from<T=object>(props: { [key: string]: any }): { new(): T };
        override<T=object>(cls: { new(): T }, props?: (string[]|{ [key: string]: any })): { new(): T };
        spy(fn: (...args) => any): (...args) => any;
    }
    export interface PropertyDescriptor {
        get: any;
        set: any;
        value: any;
    }
    export interface CustomProp {
        value: any;
        argsAnnotation(argsAnnotation: ((...args) => any)|string[]): this;
        exclude(): this;
    }
    export interface PropertyProp {
        descriptor: Partial<PropertyDescriptor>;
        get(getter: any): this;
        set(setter: any): this;
    }
    export interface MethodProp {
        value: any;
    }
    export function ArgsAnnotation(argsAnnotation: ((...args) => any)|string[]): CustomProp;
    export function Custom(value?: any): CustomProp;
    export function Exclude(): CustomProp;
    export function Initial(): void;
    export function Property(descriptor: Partial<PropertyDescriptor>): PropertyProp;
    export function StaticProperty(descriptor: Partial<PropertyDescriptor>): PropertyProp;
    export function StaticMethod(value?: any): MethodProp;

    export interface Observer {

    }

    export interface Snapshot {

    }
}