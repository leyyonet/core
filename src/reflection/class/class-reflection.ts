import {$descriptor, $dev, $repo, $sys, ClassLike, Dict, Fnc, Func, Obj} from "@leyyo/common";
import {AbstractReflection} from "../abstract";
import {PropertyReflection, PropertyReflectionLike} from "../property";
import {DecoArgumentClass, DecoFilter, DecoFilterKind, DecoKeyword, DecoKind} from "../../decorator";
import {ClassReflectionCopyLambda, ClassReflectionLike, ClassReflectionSecure} from "./index.types";
import {core} from "../../core";
import {FootprintInspected} from "../../footprint";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";


// noinspection Annotator
export class ClassReflection extends AbstractReflection implements ClassReflectionLike, ClassReflectionSecure {
    // region properties

    private readonly _parent: ClassReflectionLike;
    private readonly _creator: ClassLike;
    private readonly _instanceMap: Map<PropertyKey, PropertyReflectionLike>;
    private readonly _staticMap: Map<PropertyKey, PropertyReflectionLike>;
    private readonly _body: Obj;
    private _inspected: FootprintInspected;
    private _propCache: Map<PropertyKey, Array<PropertyReflectionLike>>;
    private static _functionProperties = [] as Array<string>;
    // endregion properties
    // region methods
    constructor(creator: ClassLike, prototype?: Obj, instances?: ClassReflectionCopyLambda, statics?: ClassReflectionCopyLambda) {
        super(creator.name);
        this._target = 'class';
        this._instanceMap = $repo.newMap(FQN_PCK, this._code, 'instance');
        this._staticMap = $repo.newMap(FQN_PCK, this._code, 'static');
        this._creator = creator;
        this._type = creator as Func;
        this._body = prototype ?? creator.prototype;
        const prototypeOf = Object.getPrototypeOf(creator);
        if (prototypeOf && prototypeOf.name && !$sys.isSysClass(prototypeOf.name)) {
            this._parent = core.reflectionPool.registerClass(prototypeOf);
            const oldDocs = this._parent.docsAll();
            if (oldDocs.length > 0) {
                oldDocs.forEach(doc => {
                    this.setValue(doc.ins, doc);
                });
            }
        }
        if (!core.fqnHandler.exists(this._creator)) {
            core.fqnHandler.onReady(this._creator, (name: string) => {
                this._name = name;
            });
        }

        // region instance-members
        if (typeof instances === 'function') {
            instances(this);
        }
        else {
            Object.getOwnPropertyNames(creator.prototype).forEach(key => {
                const desc = $descriptor.get(creator.prototype, key);
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
        }
        // endregion instance-members

        // region static-members
        if (typeof statics === 'function') {
            statics(this);
        }
        else {
            const ignoredKeys = ClassReflection.functionProperties;
            Object.getOwnPropertyNames(creator).forEach(key => {
                if (!ignoredKeys.includes(key)) {
                    const desc = $descriptor.get(creator, key);
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
        }
        // endregion static-members

    }

    static get functionProperties(): Array<string> {
        if (ClassReflection._functionProperties.length < 1) {
            function test() {}
            Object.getOwnPropertyNames(test).forEach(key => {
                ClassReflection._functionProperties.push(key);
            });
        }
        return ClassReflection._functionProperties;
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
        if (!this._propCache) {
            this._propCache = $repo.newMap(FQN_PCK, this._code, 'cache');
        }
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
                creator: core.fqnHandler.detail(this._creator),
                body: detailed ? core.fqnHandler.detail(this._body) : undefined,
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
            this._name = core.fqnHandler.get(this._creator);
        }
        return this._name;
    }

    get code(): string {
        return this.name;
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
        if (!this._inspected) {
            this._inspected = core.footprint.inspect(this._creator);
        }
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
    listAnyProperties(filter?: DecoFilter, decorator?: Func | string): Array<PropertyReflectionLike> {
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

    copyDecorators(source: ClassReflectionLike, args: DecoArgumentClass): void {
        this._copyDecorators(source, this, args);
    }
    // region secure

    get $back(): ClassReflectionLike {
        return this;
    }

    get $secure(): ClassReflectionSecure {
        return this;
    }

    $registerProperty(name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func, clone?: boolean): PropertyReflectionLike {
        switch (keyword) {
            case "instance":
                if (!this._instanceMap.has(name)) {
                    const ins = new PropertyReflection(this, name, keyword, kind, callable, clone);
                    this._instanceMap.set(name, ins);
                }
                return this._instanceMap.get(name);
            case "static":
                if (!this._staticMap.has(name)) {
                    const ins = new PropertyReflection(this, name, keyword, kind, callable, clone);
                    this._staticMap.set(name, ins);
                }
                return this._staticMap.get(name);
            default:
                throw $dev.developerError({
                    issue: 'invalid.keyword',
                    where: 'leyyo.reflection.ClassReflection',
                    keyword,
                    clazz: this.name,
                    property: name
                });
        }
    }

    // endregion secure

    toJSON(simple?: boolean) {
        if (simple) {
            return {
                ...{
                    parent: this._parent?.description,
                    creator: this._creator?.name,
                    instanceMembers: Array.from(this._instanceMap.values()).map(c => c.toJSON(true)),
                    staticMembers: Array.from(this._staticMap.values()).map(c => c.toJSON(true))
                }, ...super.toJSON()
            };
        }
        return {
            ...{
                __: ClassReflection.name,
                parent: this._parent?.description,
                creator: this._creator?.name,
                inspected: this.inspected,

                instanceMembers: Array.from(this._instanceMap.values()),
                staticMembers: Array.from(this._staticMap.values()),
            }, ...super.toJSON()
        };
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(ClassReflection, FQN_PCK);
});
