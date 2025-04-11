import {AbstractReflection} from "../abstract";
import {PropertyReflection, PropertyReflectionLike} from "../property";
import {
    DecoFilter,
    DecoFilterBelongs,
    DecoFilterKind,
    DecoInstanceLike,
    DecoKeyword,
    DecoKind,
    DecoLike
} from "../../decorator";
import {ClassLike, DeveloperException, Dict, Func, Obj, system} from "@leyyo/common";
import {ClassReflectionLike, ClassReflectionSecure} from "./index-types";
import {core} from "../../core";
import {FootprintInspected} from "../../footprint";

// console.log(__filename);

// noinspection Annotator
export class ClassReflection extends AbstractReflection implements ClassReflectionLike, ClassReflectionSecure {
    // region properties

    private readonly _parent: ClassReflectionLike;
    private readonly _body: Obj;
    private readonly _creator: ClassLike;
    private readonly _inspected: FootprintInspected;
    private readonly _instanceMap: Map<PropertyKey, PropertyReflectionLike>;
    private readonly _staticMap: Map<PropertyKey, PropertyReflectionLike>;
    private readonly _propCache: Map<PropertyKey, Array<PropertyReflectionLike>>;
    // endregion properties
    // region methods
    constructor(creator: ClassLike, body?: Obj, currentInstance?: DecoInstanceLike) {
        super(currentInstance);
        this._target = 'class';
        this._instanceMap = new Map<PropertyKey, PropertyReflectionLike>();
        this._staticMap = new Map<PropertyKey, PropertyReflectionLike>();
        this._propCache = new Map<PropertyKey, Array<PropertyReflectionLike>>();
        this._creator = creator;
        this._type = creator as Func;
        this._body = body;
        this._inspected = core.footprint.inspect(creator);
        const prototypeOf = Object.getPrototypeOf(creator);
        // console.log(`${creator.name}.prototypeOf => ${typeof prototypeOf}`);
        if (prototypeOf && prototypeOf.name && !system.isSysClass(prototypeOf.name)) {
            this._parent = core.reflection.registerClass(prototypeOf);
        }
        // region instance-members
        Object.getOwnPropertyNames(creator.prototype).forEach(key => {
            const desc = core.footprint.getDescriptor(creator.prototype, key);
            if (desc) {
                let kind: DecoKind;
                let callable: Func;
                if (typeof desc.value === 'function') {
                    kind = 'method';
                    callable = desc.value;
                } else {
                    kind = 'field';
                    callable = undefined;
                }
                this.$registerProperty(key, 'instance', kind, callable);
            }
        });
        // endregion instance-members
        // region static-members
        Object.getOwnPropertyNames(creator).forEach(key => {
            if (!['length', 'name'].includes(key)) {
                const desc = core.footprint.getDescriptor(creator, key);
                if (desc) {
                    let kind: DecoKind;
                    let callable: Func;
                    if (typeof desc.value === 'function') {
                        kind = 'method';
                        callable = desc.value;
                    } else {
                        kind = 'field';
                        callable = undefined;
                    }
                    this.$registerProperty(key, 'static', kind, callable);
                }
            }
        });
        // endregion static-members

    }

    create<C>(...params: Array<unknown>): C {
        return new this._creator(...params) as C;
    }

    // endregion methods
    // region private
    protected _listProperties(keyword: DecoKeyword, filter?: DecoFilterKind): Array<PropertyReflectionLike> {
        let props: Array<PropertyReflectionLike>;
        filter = this._filter(filter, 'kind');
        const key = `${this.name}~${keyword}~${filter.kind ?? ''}`;
        if (this._propCache.has(key)) {
            return this._propCache.get(key);
        }
        const ins = (keyword === "instance");
        // 'listInstanceProperties', '_instanceMap'
        props = Array.from((ins ? this._instanceMap : this._staticMap).values());
        if (filter.kind) {
            props = props.filter(prop => prop.filterByKind(filter));
        }
        this._propCache.set(key, props);
        return props;
    }

    // endregion private
    // region getters
    info(detailed?: boolean): Dict {
        const rec = {
            ...{
                name: this.name,
                creator: core.fqn.detail(this._creator),
                body: detailed ? core.fqn.detail(this._body) : undefined,
                instances: [],
                statics: []
            }, ...super.info(detailed)
        };
        if (this._parent) {
            rec['parent'] = {'$ref': this._parent.description};
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
        if (!this._name) {
            this._name = core.fqn.get(this._creator);
        }
        return this._name;
    }

    get description(): string {
        return `<class>${this.name}`;
    }

    get parent(): ClassReflectionLike {
        return this._parent;
    }

    get creator(): ClassLike {
        return this._creator;
    }

    get body(): Obj {
        return this._body;
    }

    get inspected(): FootprintInspected {
        return this._inspected;
    }

    // endregion getters
    // region instance-properties
    listInstancePropertyNames(filter?: DecoFilterKind): Array<string> {
        return this.listInstanceProperties(filter).map(prop => prop.name as string);
    }

    listInstanceProperties(filter?: DecoFilterKind): Array<PropertyReflectionLike> {
        return this._listProperties("instance", filter);
    }

    getInstanceProperty(name: PropertyKey, filter?: DecoFilterKind): PropertyReflectionLike {
        const props = this.listInstanceProperties(filter).filter(prop => prop.name === name);
        return props.length > 0 ? props[0] : null;
    }

    hasInstanceProperty(name: PropertyKey, filter?: DecoFilterKind): boolean {
        return this.listInstanceProperties(filter).filter(prop => prop.name === name).length > 0;
    }

    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: DecoFilterKind): Array<string> {
        return this.listStaticProperties(filter).map(prop => prop.name as string);
    }

    listStaticProperties(filter?: DecoFilterKind): Array<PropertyReflectionLike> {
        return this._listProperties('static', filter);
    }

    getStaticProperty(name: PropertyKey, filter?: DecoFilterKind): PropertyReflectionLike {
        const props = this.listStaticProperties(filter).filter(prop => prop.name === name);
        return props.length > 0 ? props[0] : null;
    }

    hasStaticProperty(name: PropertyKey, filter?: DecoFilterKind): boolean {
        return this.listStaticProperties(filter).filter(prop => prop.name === name).length > 0;
    }

    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, decorator?: Func|string): Array<PropertyReflectionLike> {
        let properties: Array<PropertyReflectionLike>;
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
        if (decorator) {
            return properties.filter(item => item.filterByBelongs(decorator, filter))
        }
        return properties;
    }

    getAnyProperty(name: PropertyKey, filter?: DecoFilter): PropertyReflectionLike {
        switch (filter?.keyword) {
            case "instance":
                return this.getInstanceProperty(name, filter);
            case "static":
                return this.getStaticProperty(name, filter);
            default:
                return this.getInstanceProperty(name, filter) ?? this.getStaticProperty(name, filter);
        }
    }

    hasAnyProperty(name: PropertyKey, filter?: DecoFilter): boolean {
        switch (filter?.keyword) {
            case "instance":
                return this.hasInstanceProperty(name, filter);
            case "static":
                return this.hasStaticProperty(name, filter);
            default:
                return this.hasInstanceProperty(name, filter) || this.hasStaticProperty(name, filter);
        }
    }

    // endregion any-properties
    // region secure

    get $back(): ClassReflectionLike {
        return this;
    }

    get $secure(): ClassReflectionSecure {
        return this;
    }

    $registerProperty(name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func): PropertyReflectionLike {
        switch (keyword) {
            case "instance":
                if (!this._instanceMap.has(name)) {
                    const ins = new PropertyReflection(this, name, keyword, kind, callable);
                    this._instanceMap.set(name, ins);
                }
                return this._instanceMap.get(name);
            case "static":
                if (!this._staticMap.has(name)) {
                    const ins = new PropertyReflection(this, name, keyword, kind, callable);
                    this._staticMap.set(name, ins);
                }
                return this._staticMap.get(name);
            default:
                throw new DeveloperException('invalid.keyword', {clazz: this.name, property: name});
        }
    }

    $filterDecorators(filter?: DecoFilterBelongs): Map<DecoLike, Array<Dict>> {
        switch (filter?.belongs) {
            case "self":
                return this._decoratorMap;
            case "parent":
                if (this._parent) {
                    return this._parent.$secure.$filterDecorators(filter);
                } else {
                    return this._emptyDecoMap;
                }
            default:
                if (this._parent) {
                    return new Map<DecoLike, Array<Dict>>([...this._decoratorMap, ...this._parent.$secure.$filterDecorators(filter)]);
                } else {
                    return this._decoratorMap;
                }
        }
    }

    $setCurrentInstance(currentInstance: DecoInstanceLike): this {
        this._currentInstance = currentInstance;
        return this;
    }

    $setForCurrentDecorator<V extends Dict>(value: V): this {
        return this.setValue(this.currentIdentifier?.fn, value);
    }


    // endregion secure

}