import "reflect-metadata";
import {$assert, $dev, $repo, Dict, Func} from "@leyyo/common";
import {AbstractReflection} from "../abstract";
import {ParameterReflection, ParameterReflectionLike} from "../parameter";
import {
    PropertyReflectionLike,
    PropertyReflectionSecure
} from "./index.types";
import {ClassReflectionLike} from "../class";
import {
    DecoArgumentField,
    DecoArgumentMethod,
    DecoDoc,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoKeyword,
    DecoKind
} from "../../decorator";
import {core} from "../../core";
import {FootprintInspected} from "../../footprint";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";


// noinspection Annotator
export class PropertyReflection extends AbstractReflection implements PropertyReflectionLike, PropertyReflectionSecure {
    // region properties
    protected readonly _clazz: ClassReflectionLike;
    protected _callable: Func;
    protected readonly _parameters: Array<ParameterReflectionLike>;
    protected readonly _keyword: DecoKeyword;
    protected readonly _kind: DecoKind;
    protected readonly _proto: PropertyReflectionLike;
    protected _inspected: FootprintInspected;
    protected _description: string;
    // endregion properties
    // region methods
    constructor(clazz: ClassReflectionLike, name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func, clone?: boolean) {
        super(clazz.code, name, keyword, kind);
        this._clazz = clazz;
        this._name = name as string;
        this._keyword = keyword;
        if (kind === 'method') {
            this._parameters = $repo.newArray(FQN_PCK, this._code, 'parameters');
            this._kind = kind;
            this._callable = typeof callable === 'function' ? callable : null;
            this._target = 'method';
            let paramsListed = false;
            if (this._clazz.body) {
                if (!this._callable) {
                    this._callable = this._clazz.body[this._name];
                }
                this._type = Reflect.getMetadata('design:returntype', this._clazz.body, this._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', this._clazz.body, this._name as string) as Array<Func>;
                if (Array.isArray(params)) {
                    paramsListed = true;
                    params.forEach((param, i) => {
                        this._parameters.push(new ParameterReflection(this, i, param));
                    });
                }
            } else if (this._clazz.creator[this._name]) {
                if (!this._callable) {
                    this._callable = this._clazz.creator[this._name];
                }
                this._type = Reflect.getMetadata('design:returntype', this._clazz.creator, this._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', this._clazz.creator, this._name as string) as Array<Func>;
                if (Array.isArray(params)) {
                    paramsListed = true;
                    params.forEach((param, i) => {
                        this._parameters.push(new ParameterReflection(this, i, param));
                    });
                }
            }
            if (!paramsListed && this._callable) {
                for (let i = 0; i < this._callable.length; i++) {
                    this._parameters.push(new ParameterReflection(this, i, null));
                }
            }
        } else {
            this._kind = 'field';
            this._callable = null;
            this._target = 'field';
            if (this._clazz.body) {
                this._type = Reflect.getMetadata('design:type', this._clazz.body, this._name as string) as Func;
            } else {
                this._type = Reflect.getMetadata('design:type', this._clazz.creator, this._name as string) as Func;
            }
        }
        if (this._clazz?.parent) {
            this._proto = (this._keyword === 'instance') ? this._clazz.parent.getInstanceProperty(name) : this._clazz.parent.getStaticProperty(name);
            if (this._proto) {
                const oldDocs = this._proto.docsAll();
                if (oldDocs.length > 0) {
                    if (clone) {
                        oldDocs.forEach(doc => {
                            const newDeco = {value: doc.value} as DecoDoc;
                            if (this._kind === 'field') {
                                const fieldArgs = doc.ins.arguments as DecoArgumentField;
                                newDeco.ins = doc.ins.copy(this, [fieldArgs[0], this._name]);
                            } else {
                                const methodArgs = doc.ins.arguments as DecoArgumentMethod;
                                newDeco.ins = doc.ins.copy(this, [methodArgs[0], this._name, methodArgs[2]]);
                            }
                            this.setValue(newDeco.ins, newDeco);
                        });
                    } else {
                        oldDocs.forEach(doc => {
                            this.setValue(doc.ins, doc);
                        });
                    }
                }
            }
        }
    }

    // endregion methods
    // region getters
    info(detailed?: boolean): Dict {
        let rec = {
            name: this._name,
            description: this.description,
            clazz: {'$ref': this._clazz.description}
        } as Dict;
        if (detailed) {
            rec = {
                ...rec,
                ...super.info(true),
                type: core.fqnHandler.detail(this._type),
                keyword: this._keyword,
                kind: this._kind
            };
        }
        if (detailed && this._kind === "method") {
            rec['callable'] = core.fqnHandler.detail(this._callable);
            rec['parameters'] = this._parameters ? this._parameters.map(p => p.info(detailed)) : [];
        }
        if (this._proto) {
            rec['proto'] = {'$ref': this._proto.description};
        }
        return rec;
    }

    get description(): string {
        if (!this._description) {
            this._description = `<${this._kind}>${this._clazz.name}.${this._name as string} [${this._keyword}]`;
        }
        return this._description;
    }

    get clazz(): ClassReflectionLike {
        return this._clazz;
    }

    get proto(): PropertyReflectionLike {
        return this._proto;
    }

    get hasProto(): boolean {
        return !!this._proto;
    }

    get callable(): Func {
        return this._callable;
    }

    get keyword(): DecoKeyword {
        return this._keyword;
    }

    get kind(): DecoKind {
        return this._kind;
    }

    get isMethod(): boolean {
        return this._kind === 'method';
    }

    get isInstance(): boolean {
        return this._keyword === 'instance';
    }

    get inspected(): FootprintInspected {
        if (this._kind === 'field') {
            return undefined;
        }
        if (this._inspected === undefined) {
            if (typeof this._callable === 'function') {
                this._inspected = core.footprint.inspect(this._callable);
            }
            else if (this._keyword === 'static' && typeof this._clazz.creator[this._name] === 'function') {
                    this._inspected = core.footprint.inspect(this._clazz.creator[this._name]);
                }
            else if (this._keyword === 'instance' && this._clazz.body && typeof this._clazz.body[this._name] === 'function') {
                this._inspected = core.footprint.inspect(this._clazz.body[this._name]);
            }
            else {
                this._inspected = null;
            }
        }
        return this._inspected === null ? undefined : this._inspected;
    }

    // endregion getters
    // region parameters
    listParameters(): Array<ParameterReflectionLike> {
        return this._parameters ? [...this._parameters] : [];
    }

    hasParameter(index: number): boolean {
        return this._parameters ? this._parameters[index] !== undefined : false;
    }

    getParameter(index: number): ParameterReflectionLike {
        return this._parameters ? this._parameters[index] : undefined;
    }

    parametersBy(decorator: Func | string): Array<ParameterReflectionLike> {
        const id = core.decoratorPool.get(decorator, false);
        if (!id) {
            return [];
        }
        return this._parameters ? [...this._parameters.filter(param => param.filterByBelongs(id.fn))] : [];
    }

    // endregion parameters
    // region filter-by
    filterByKeyword(filter?: DecoFilterKeyword): boolean {
        switch (filter?.keyword) {
            case "instance":
                return this._keyword === "instance";
            case "static":
                return this._keyword === "static";
            default:
                return true;
        }
    }

    filterByKind(filter?: DecoFilterKind): boolean {
        switch (filter?.kind) {
            case "field":
                return this._kind === 'field';
            case "method":
                return this._kind === 'method';
            default:
                return true;
        }
    }

    // endregion filter-by

    copyDecorators(source: PropertyReflectionLike, args: DecoArgumentField | DecoArgumentMethod): void {
        if (source.keyword !== this._keyword) {
            throw $dev.developerError({
                issue: 'keywords should be same',
                source: source.description,
                target: this.description,
                expected: this._keyword,
                current: source.keyword,
                where: 'leyyo.reflection.PropertyReflection'
            });
        }
        if (source.kind !== this._kind) {
            throw $dev.developerError({
                issue: 'Kinds should be same',
                source: source.description,
                target: this.description,
                expected: this._kind,
                current: source.kind,
                where: 'leyyo.reflection.PropertyReflection'
            });
        }
        this._copyDecorators(source, this, args);
    }

    // region secure
    get $secure(): PropertyReflectionSecure {
        return this;
    }

    get $back(): PropertyReflectionLike {
        return this;
    }

    $setType(type: Func): this {
        $assert.func(type, () => $dev.opt({
            name: this.description,
            field: 'type',
            method: '$setType',
            where: 'leyyo.reflection.PropertyReflection'
        }));
        if (this._type && this._type !== type) {
            let index = 0;
            while (this.hasMetaKey(`$type-${index}`)) {
                index++;
            }
            this.setMetaKey(`$type-${index}`, this._type);
        }
        this._type = type;
        return this;
    }

    $setCallable(callable: Func): this {
        $assert.func(callable, () => $dev.opt({
            name: this.description,
            field: 'callable',
            method: '$setCallable',
            where: 'leyyo.reflection.PropertyReflection'
        }));
        if (this._target !== 'method') {
            throw $dev.developerError({
                issue: 'field.callable.can.not.be.changed',
                target: this._target,
                method: '$setCallable',
                where: 'leyyo.reflection.PropertyReflection'
            });
        }
        if (this._callable && this._callable !== callable) {
            let index = 0;
            while (this.hasMetaKey(`$callable-${index}`)) {
                index++;
            }
            this.setMetaKey(`$callable-${index}`, this._callable);
        }
        if (this._inspected) {
            delete this._inspected;
        }
        this._callable = callable;
        return this;
    }
    // endregion secure

    toJSON(simple?: boolean) {
        if (simple) {
            if (this._kind === 'method') {
                return {
                    ...{
                        name: this._name,
                        kind: this._kind,
                        keyword: this._keyword,
                        returnType: this._type?.name,
                        parameters: this._parameters ?? [],
                    }, ...super.toJSON()
                };
            }
            return {
                ...{
                    name: this._name,
                    kind: this._kind,
                    keyword: this._keyword,
                    type: this._type?.name,
                }, ...super.toJSON()
            };
        }
        if (this._kind === 'method') {
            return {
                ...{
                    __: PropertyReflection.name,
                    clazz: this._clazz.name,
                    name: this._name,
                    kind: this._kind,
                    keyword: this._keyword,
                    returnType: this._type?.name,
                    parameters: this._parameters ?? [],
                }, ...super.toJSON()
            };
        }
        return {
            ...{
                __: PropertyReflection.name,
                clazz: this._clazz.name,
                name: this._name,
                kind: this._kind,
                keyword: this._keyword,
                type: this._type?.name,
            }, ...super.toJSON()
        };
    }

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(PropertyReflection, FQN_PCK);
});
