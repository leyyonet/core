import "reflect-metadata";
import {$assert, $dev, Dict, Func} from "@leyyo/common";
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
    private _clazz: ClassReflectionLike;
    private _callable: Func;
    private _parameters: Array<ParameterReflectionLike> = [];
    private _keyword: DecoKeyword;
    private _kind: DecoKind;
    private _proto: PropertyReflectionLike;
    private _clones: Array<PropertyReflectionLike>;
    private _inspected: FootprintInspected;
    private _description: string;
    // endregion properties
    // region methods
    static create(clazz: ClassReflectionLike, name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func): PropertyReflection {
        const ins = new PropertyReflection(clazz.code, name as string, keyword, kind);
        ins._clazz = clazz;
        ins._name = name as string;
        ins._keyword = keyword;
        if (kind === 'method') {
            ins._parameters = [];
            ins._kind = kind;
            ins._callable = typeof callable === 'function' ? callable : null;
            ins._target = 'method';
            let paramsListed = false;
            if (ins._clazz.body) {
                if (!ins._callable) {
                    ins._callable = ins._clazz.body[ins._name];
                }
                ins._type = Reflect.getMetadata('design:returntype', ins._clazz.body, ins._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', ins._clazz.body, ins._name as string) as Array<Func>;
                if (Array.isArray(params)) {
                    paramsListed = true;
                    params.forEach((type, i) => {
                        ins.$secure.$createParameter(i,  type);
                    });
                }
            }
            else if (ins._clazz.creator[ins._name]) {
                if (!ins._callable) {
                    ins._callable = ins._clazz.creator[ins._name];
                }
                ins._type = Reflect.getMetadata('design:returntype', ins._clazz.creator, ins._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', ins._clazz.creator, ins._name as string) as Array<Func>;
                if (Array.isArray(params)) {
                    paramsListed = true;
                    params.forEach((type, i) => {
                        ins.$secure.$createParameter(i,  type);
                    });
                }
            }
            if (!paramsListed && ins._callable) {
                for (let i = 0; i < ins._callable.length; i++) {
                    ins.$secure.$createParameter(i,  undefined);
                }
            }
        }
        else {
            ins._kind = 'field';
            ins._callable = undefined;
            ins._target = 'field';
            if (ins._clazz.body) {
                ins._type = Reflect.getMetadata('design:type', ins._clazz.body, ins._name as string) as Func;
            } else {
                ins._type = Reflect.getMetadata('design:type', ins._clazz.creator, ins._name as string) as Func;
            }
        }
        if (ins._clazz?.parent) {
            ins._proto = (ins._keyword === 'instance') ? ins._clazz.parent.getInstanceProperty(name) : ins._clazz.parent.getStaticProperty(name);
            if (ins._proto) {
                const oldDocs = ins._proto.docsAll();
                if (oldDocs.length > 0) {
                    oldDocs.forEach(doc => {
                        ins.setValue(doc.ins, doc);
                    });
                }
            }
        }
        return ins;
    }
    static copy(clazz: ClassReflectionLike, source: PropertyReflectionLike): PropertyReflection {
        const ins = new PropertyReflection(clazz.code, source.name, source.keyword, source.kind);
        ins._clazz = clazz;
        ins._name = source.name;
        ins._keyword = source.keyword;
        ins._kind = source.kind;
        ins._callable = source.callable;
        ins._target = source.target;
        ins._type = source.type;
        ins._proto = source.proto;
        if (ins._kind === 'method') {
            ins._parameters = [];
            source.listParameters().forEach(param => {
                ins._parameters.push(ParameterReflection.copy(ins, param));
            });
        }
        ins.copyDecorators(source);
        source.$secure.$appendCopied(ins);
        return ins;
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
    get clones(): Array<PropertyReflectionLike> {
        return this._clones ? [...this._clones] : [];
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

    copyDecorators(source: PropertyReflectionLike): void {
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
        this._copyDecorators(source, this);
    }

    // region secure
    get $secure(): PropertyReflectionSecure {
        return this;
    }

    get $back(): PropertyReflectionLike {
        return this;
    }

    $copyParameter(source: ParameterReflectionLike): ParameterReflectionLike {
        const param = ParameterReflection.copy(this, source);
        this._parameters.push(param);
        return param;
    }
    $createParameter(index: number, type: Func): ParameterReflectionLike {
        const param = ParameterReflection.create(this, index, type);
        this._parameters.push(param);
        return param;
    }
    $setProto(proto: PropertyReflectionLike): this {
        $assert.instanceOf(proto, PropertyReflection, () => $dev.opt({
            name: this.description,
            field: 'proto',
            method: '$setProto',
            where: 'leyyo.reflection.PropertyReflection'
        }));
        if (proto === this) {
            $dev.developerError2(FQN_PCK, 100, {
                message: 'Circular proto assignment',
                name: this.description
            });
        }
        if (this._proto && this._proto !== proto) {
            let index = 0;
            while (this.hasMetaKey(`$proto-${index}`)) {
                index++;
            }
            this.setMetaKey(`$proto-${index}`, this._proto);
        }
        this._proto = proto;
        return this;
    }
    $appendCopied(child: PropertyReflectionLike): void {
        if (!this._clones) {
            this._clones = [];
        }
        this._clones.push(child);
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
