import {
    ClassReflectLike,
    PropertyReflectLike,
    ReflectClassDescribed,
    ReflectDecoratorItem,
    ReflectFieldDescribed,
    ReflectInheritanceFilter,
    ReflectKeyword,
    ReflectMethodDescribed,
    ReflectPropertyDescribed,
    ReflectPropertyFilter,
} from "./types";


import {AbstractReflect} from "./abstract-reflect";
import {FuncLike, ObjectLike, RecLike} from "../common";
import {$ly} from "../core";
import {DecoAliasLike, DecoFilter, DecoLike} from "../deco";
import {PropertyReflect} from "./property-reflect";
import {DeveloperException} from "../error";


let _LOG = $ly.preLog;

/**
 * @instance
 * */
export class ClassReflect extends AbstractReflect implements ClassReflectLike {
    // region properties
    private readonly _parent: ClassReflectLike;
    private readonly _body: ObjectLike;
    private readonly _classFn: FuncLike;
    private readonly _instanceMap: Map<string, PropertyReflectLike>;
    private readonly _staticMap: Map<string, PropertyReflectLike>;
    private readonly _propCache: Map<string, Array<PropertyReflectLike>>;
    // endregion properties
    // region methods

    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    getDescribed(): ReflectClassDescribed {
        return {
            target: 'class',
            keyword: 'static',
            classFn: this._classFn,
            classProto: this._body,
            description: this.description,
            shortDescription: this.shortDescription,
        }
    }
    constructor(classFn: FuncLike, body?: ObjectLike) {
        super();
        this._target = 'class';
        this._instanceMap = new Map<string, PropertyReflectLike>();
        this._staticMap = new Map<string, PropertyReflectLike>();
        this._propCache = new Map<string, Array<PropertyReflectLike>>();
        this._classFn = classFn;
        this._body = body;
        const prototypeOf = Object.getPrototypeOf(classFn);
        if (typeof prototypeOf === 'function' && $ly.system.isCustomClass(prototypeOf.name)) {
            this._parent = $ly.reflect.$findClass(prototypeOf);
            if (this._parent && $ly.reflect.$finalDeco) {
                this.parents.forEach(ref => {
                    if (ref.hasDecorator($ly.reflect.$finalDeco, {belongs: 'self'})) {
                        throw new DeveloperException('reflect:class.is.final', {clazz: classFn, parents: this.parents.map(c => c.name)}).with(this);
                    }
                });
            }
        }
        // region instance-members
        if (classFn.prototype) {
            Object.getOwnPropertyNames(classFn.prototype).forEach(property => {
                let descriptor: PropertyDescriptor;
                try {
                    descriptor = Object.getOwnPropertyDescriptor(classFn.prototype, property);
                } catch (e) {
                    console.log(e.message);
                }
                if (descriptor) {
                    if ((typeof descriptor.value === 'function')) {
                        const described = {...this.getDescribed(), property, target: 'method', keyword: 'instance', methodFn: descriptor.value} as ReflectMethodDescribed;
                        this.$registerProperty(described);
                    } else {
                        const described = {...this.getDescribed(), property, target: 'field', keyword: 'instance'} as ReflectFieldDescribed;
                        this.$registerProperty(described);
                    }
                }
            });
        }
        // endregion instance-members
        // region static-members
        Object.getOwnPropertyNames(classFn).forEach(property => {
            if (!['length', 'name', 'prototype'].includes(property)) {
                let descriptor: PropertyDescriptor;
                try {
                    descriptor = Object.getOwnPropertyDescriptor(classFn, property);
                } catch (e) {
                    console.log(e.message);
                }
                if (descriptor) {
                    if ((typeof descriptor.value === 'function')) {
                        const described = {...this.getDescribed(), property, target: 'method', keyword: 'static', methodFn: descriptor.value} as ReflectMethodDescribed;
                        this.$registerProperty(described);
                    } else {
                        const described = {...this.getDescribed(), property, target: 'field', keyword: 'static'} as ReflectFieldDescribed;
                        this.$registerProperty(described);
                    }
                }
            }
        });
        // endregion static-members

    }
    create<T>(...params: Array<unknown>): T {
        return this._classFn(...params) as T;
    }
    // endregion methods
    // region private
    protected _listProperties(keyword: ReflectKeyword, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<PropertyReflectLike> {
        filter = filter ?? {};
        let properties: Array<PropertyReflectLike>;
        filter = $ly.deco.buildFilter(filter, 'kind', 'scope');
        const key = `${this.name}~${keyword}~${filter.scope ?? ''}~${filter.kind ?? ''}`;
        if (this._propCache.has(key)) {
            return this._propCache.get(key);
        }
        const isInstance = (keyword === "instance");
        // 'listInstanceProperties', '_instanceMap'
        switch (filter.scope) {
            case "owned":
                properties = Array.from((isInstance ? this._instanceMap : this._staticMap).values());
                if (filter.kind) {
                    properties = properties.filter(ref => ref.filterByKind(filter));
                }
                this._propCache.set(key, properties);
                return properties;
            case "inherited":
                if (this._parent) {
                    delete filter.scope;
                    properties = isInstance ? this._parent.listInstanceProperties(filter) : this._parent.listStaticProperties(filter);
                } else {
                    properties = [];
                }
                this._propCache.set(key, properties);
                return properties;
        }
        properties = Array.from((isInstance ? this._instanceMap : this._staticMap).values());
        if (filter.kind) {
            properties = properties.filter(ref => ref.filterByKind(filter));
        }
        if (this._parent) {
            const selfNames = properties.map(ref => ref.name);
            const parentProps = (keyword === "instance") ? this._parent.listInstanceProperties(filter) : this._parent.listStaticProperties(filter);
            if (selfNames.length < 1) {
                properties.push(...parentProps);
            } else {
                parentProps.forEach(ref => {
                    if (!selfNames.includes(ref.name)) {
                        properties.push(ref);
                    }
                });
            }
        }
        this._propCache.set(key, properties);
        return properties;
    }
    // endregion private
    // region getters
    info(detailed?: boolean): RecLike {
        const rec = {...{
                name: this.name,
                classFn: $ly.fqn.getFootprint(this._classFn),
                body: detailed ? $ly.fqn.getFootprint(this._body) : undefined,
                instances: [],
                statics: []
        }, ...super.info(detailed)};
        if (this._parent) {
            rec['parent'] = this._parent.description;
        }
        for (const [, prop] of this._instanceMap.entries()) {
            rec.instances.push(prop.info(detailed));
        }
        for (const [, prop] of this._staticMap.entries()) {
            rec.statics.push(prop.info(detailed));
        }
        return rec;
    }
    get name(): string {
        return $ly.fqn.get(this._classFn);
    }
    get baseName(): string {
        return this._classFn.name;
    }
    get description(): string {
        return `<class>${$ly.fqn.get(this._classFn)}`;
    }
    get shortDescription(): string {
        return `<C>${this.baseName}`;
    }
    get parent(): ClassReflectLike {
        return this._parent;
    }
    get parents(): Array<ClassReflectLike> {
        if (!this._parent) {
            return [];
        }
        return [...this._parent.parents, this._parent];
    }
    get classFn(): FuncLike {
        return this._classFn;
    }
    get body(): ObjectLike {
        return this._body;
    }
    // endregion getters
    // region instance-properties
    listInstancePropertyNames(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<string> {
        return this.listInstanceProperties(filter).map(ref => ref.name as string);
    }
    listInstanceProperties(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<PropertyReflectLike> {
        return this._listProperties("instance", filter);
    }
    getInstanceProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): PropertyReflectLike {
        const props = this.listInstanceProperties(filter).filter(ref => ref.name === property);
        return props.length > 0 ? props[0] : undefined;
    }
    hasInstanceProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): boolean {
        return this.listInstanceProperties(filter).filter(ref => ref.name === property).length > 0;
    }
    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<string> {
        return this.listStaticProperties(filter).map(ref => ref.name as string);
    }
    listStaticProperties(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<PropertyReflectLike> {
        return this._listProperties('static', filter);
    }
    getStaticProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): PropertyReflectLike {
        const props = this.listStaticProperties(filter).filter(ref => ref.name === property);
        return props.length > 0 ? props[0] : undefined;
    }
    hasStaticProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): boolean {
        return this.listStaticProperties(filter).filter(ref => ref.name === property).length > 0;
    }
    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, identifier?: DecoLike | DecoAliasLike | FuncLike | string): Array<PropertyReflectLike> {
        filter = filter ?? {};
        let properties: Array<PropertyReflectLike>;
        switch (filter?.keyword) {
            case "instance":
                properties = this.listInstanceProperties(filter);
                break;
            case "static":
                properties = this.listStaticProperties(filter);
                break;
            default:
                properties = [...this.listInstanceProperties(filter), ...this.listStaticProperties(filter)];
                break;
        }
        if ($ly.filled(identifier)) {
            const deco = $ly.deco.getDecorator(identifier as FuncLike, true);
            if (!deco) {
                return [];
            }
            return properties.filter(pRef => pRef.filterByBelongs(deco, filter))
        }
        return properties;
    }
    getAnyProperty(property: string, filter?: DecoFilter): PropertyReflectLike {
        filter = filter ?? {};
        switch (filter?.keyword) {
            case "instance":
                return this.getInstanceProperty(property, filter);
            case "static":
                return this.getStaticProperty(property, filter);
        }
        return this.getInstanceProperty(property, filter) ?? this.getStaticProperty(property, filter);
    }
    hasAnyProperty(property: string, filter?: DecoFilter): boolean {
        filter = filter ?? {};
        switch (filter?.keyword) {
            case "instance":
                return this.hasInstanceProperty(property, filter);
            case "static":
                return this.hasStaticProperty(property, filter);
        }
        return this.hasInstanceProperty(property, filter) || this.hasStaticProperty(property, filter);
    }
    // endregion any-properties
    // region internal
    $registerProperty(described: ReflectPropertyDescribed): PropertyReflectLike {
        switch (described.keyword) {
            case "instance":
                if (!this._instanceMap.has(described.property)) {
                    const ref = new PropertyReflect(this, described as ReflectMethodDescribed);
                    this._instanceMap.set(described.property, ref);
                }
                return this._instanceMap.get(described.property);
            case "static":
                if (!this._staticMap.has(described.property)) {
                    const ref = new PropertyReflect(this, described as ReflectMethodDescribed);
                    this._staticMap.set(described.property, ref);
                }
                return this._staticMap.get(described.property);
        }
        throw new DeveloperException('reflect:invalid.keyword')
            .patch({target: described.description, keyword: described.keyword})
            .with(this);
    }
    decoratorItems(filter?: DecoFilter): Array<ReflectDecoratorItem> {
        filter = filter ?? {};
        switch (filter?.belongs) {
            case "self":
                return super.decoratorItems(filter);
            case "parent":
                if (this._parent) {
                    delete filter.belongs; // fetches all
                    filter.fromChild = true;
                    return this._parent.decoratorItems(filter);
                } else {
                    return [];
                }
        }
        if (filter?.fromChild) {
            delete filter.fromChild;
        }
        if (!this._parent) {
            return super.decoratorItems(filter);
        }
        const selfData = super.decoratorItems(filter);
        delete filter.belongs; // fetches all
        filter.fromChild = true;
        return [...selfData, ...this._parent.decoratorItems(filter)];
    }
    // endregion internal
}
