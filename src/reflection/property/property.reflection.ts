import "reflect-metadata";
import {$assert, $descriptor, $dev, $repo, Dict, Func, Obj} from "@leyyo/common";
import {AbstractReflection} from "../abstract";
import {ParameterReflection, ParameterReflectionLike} from "../parameter";
import {
    PropertyReflectionLike,
    PropertyReflectionMethod,
    PropertyReflectionMethodCallback,
    PropertyReflectionSecure
} from "./index.types";
import {ClassReflectionLike} from "../class";
import {
    DecoArgumentField, DecoArgumentMethod,
    DecoDoc,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoInstanceLike,
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
    protected readonly _inspected: FootprintInspected;
    protected _description: string;
    protected _methodCallback: PropertyReflectionMethod;
    // endregion properties
    // region methods
    constructor(clazz: ClassReflectionLike, name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func, clone?: boolean) {
        super(clazz.code, name, keyword, kind);
        this._parameters = $repo.newArray(FQN_PCK, this._code, 'parameters');
        this._clazz = clazz;
        this._name = name as string;
        this._keyword = keyword;
        this._proto = null;
        if (kind === 'method') {
            this._kind = kind;
            this._callable = typeof callable === 'function' ? callable : null;
            this._target = 'method';
            let paramsListed = false;
            if (!this._clazz.body) {
                this.clazz.$secure.$usePrototypeAsBody();
            }
            if (this._clazz.body) {
                if (!this._callable) {
                    this._callable = this._clazz.body[this._name];
                }
                this._inspected = core.footprint.inspect(this._callable) ?? core.footprint.inspect(this._clazz.body[this._name]);
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
                this._inspected = core.footprint.inspect(this._callable) ?? core.footprint.inspect(this._clazz.creator[this._name]);
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
                            }
                            else {
                                const methodArgs = doc.ins.arguments as DecoArgumentMethod;
                                newDeco.ins = doc.ins.copy(this, [methodArgs[0], this._name, methodArgs[2]]);
                            }
                            this.setValue(newDeco.ins, newDeco);
                        });
                    }
                    else {
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
            rec['parameters'] = this._parameters.map(p => p.info(detailed));
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
        return this._inspected;
    }

    // endregion getters
    // region parameters
    listParameters(): Array<ParameterReflectionLike> {
        return [...this._parameters]; // cloned
    }

    hasParameter(index: number): boolean {
        return this._parameters[index] !== undefined;
    }

    getParameter(index: number): ParameterReflectionLike {
        return this._parameters[index] ?? null;
    }

    parametersBy(decorator: Func | string): Array<ParameterReflectionLike> {
        const id = core.decoratorPool.get(decorator, false);
        if (!id) {
            return [];
        }
        return [...this._parameters.filter(param => param.filterByBelongs(id.fn))]; //cloned
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
    // region secure
    get $secure(): PropertyReflectionSecure {
        return this;
    }

    get $back(): PropertyReflectionLike {
        return this;
    }

    $setFieldType(type: Func): this {
        $assert.func(type, () => $dev.opt({
            name: this.description,
            field: 'type',
            method: '$setFieldType',
            where: 'leyyo.reflection.PropertyReflection'
        }));
        if (this._target !== 'field') {
            throw $dev.developerError({
                issue: 'method.type.can.not.be.changed',
                target: this._target,
                method: '$setFieldType',
                where: 'leyyo.reflection.PropertyReflection'
            });
        }
        this._type = type;
        return this;
    }

    $setMethodCallable(callable: Func): this {
        $assert.func(callable, () => $dev.opt({
            name: this.description,
            field: 'callable',
            method: '$setMethodCallable',
            where: 'leyyo.reflection.PropertyReflection'
        }));
        if (this._target !== 'method') {
            throw $dev.developerError({
                issue: 'field.callable.can.not.be.changed',
                target: this._target,
                method: '$setMethodCallable',
                where: 'leyyo.reflection.PropertyReflection'
            });
        }
        this._callable = callable;
        return this;
    }

    get $methodCallback(): PropertyReflectionMethod {
        return this._methodCallback;
    }

    $setMethodCallback(fn: PropertyReflectionMethodCallback): this {
        $assert.func(fn, () => $dev.opt({
            field: 'methodCallback',
            desc: this._description,
            where: 'leyyo.reflection.PropertyReflection'
        }));

        this._methodCallback = {fn};
        if (core.footprint.isAsync(fn, true)) {
            this._methodCallback.isAsync = true;
        }
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
                        parameters: this._parameters,
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
                    parameters: this._parameters,
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
