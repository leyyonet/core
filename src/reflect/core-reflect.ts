// x_console.log(`## ${__filename}`, {i: 'loading'});


import {
    ClassReflectLike,
    CoreReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectClassDescribed,
    ReflectDescribed,
    ReflectFilterType, ReflectLike,
    ReflectOptionLike
} from "./types";
import {TargetEnum} from "./enums";
import {LY_INT_FQN} from "../internal";
import {ReflectWrapper} from "./reflect-wrapper";
import {ClassReflect} from "./class-reflect";
import {DecoAliasLike, DecoFilter, DecoLike} from "../deco";
import {PointerLike} from "../pointer";
import {$ly} from "../core";
import {FuncLike, ObjectLike, RecLike} from "../common";
import {DeveloperException} from "../error";
import {PointerInstance} from "../pointer/pointer-instance";


/**
 * @core
 * */
export class CoreReflect implements CoreReflectLike {
    // region properties
    protected LOG = $ly.preLog;
    private _constructorParams: Map<FuncLike, Array<FuncLike>>;
    private _classPointer: PointerLike<ClassReflectLike>;
    private _LITERALS: Record<ReflectFilterType, Array<string>>;
    private _option: ReflectOptionLike;
    private _finalDeco: DecoLike;

    // endregion properties
    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('enum', () => {$ly.enum.addMultiple({TargetEnum}, ...LY_INT_FQN)});
        $ly.addTrigger('pointer', () => {
            this._classPointer = new PointerInstance('class', {}, (v) => v instanceof ClassReflect);
        });
        $ly.addTrigger('repo', () => {
            this._constructorParams = $ly.repo.newMap(this, '_constructorParams');
        });
    }
    static {
        $ly.addDependency('reflect', () => new CoreReflect());
    }

    // region private
    protected $init() {
        this._option = new ReflectWrapper();
        this._LITERALS = {
            belongs: ['self', 'parent'],
            scope: ['owned', 'inherited'],
            kind: ['field', 'method'],
            keyword: ['static', 'instance'],
        };
    }
    // endregion private
    $setFinalDeco(deco: DecoLike): void {
        if (this._finalDeco) {
            throw new DeveloperException('reflect:already.set', {name: 'Final', given: deco.name});
        }
        this._finalDeco = deco;
    }
    get $finalDeco(): DecoLike {
        return this._finalDeco;
    }
    $findConstructorParams(clazz: FuncLike, next?: boolean): Array<FuncLike> {
        if (this._constructorParams.has(clazz)) {
            return this._constructorParams.get(clazz);
        }
        let params: Array<FuncLike>;
        if (clazz.length < 1) {
            return [];
        }
        const original = $ly.symbol.getReferenced(clazz);
        if (!original) {
            params = Reflect.getMetadata('design:paramtypes', clazz);
            if (params && Array.isArray(params)) {
                this._constructorParams.set(clazz, params);
                if (this.hasClass(clazz)) {
                    const mRef = this.getProperty(clazz, 'constructor', {kind: 'method'});
                    if (mRef) {
                        if (mRef.listParameters().length === params.length) {
                            mRef.listParameters().forEach((p, i) => {
                                if (!p.typeFn && params[i]) {
                                    p.$setTypeFn(params[i]);
                                }
                            })
                        }
                    }
                }
                this.LOG.warn(`Params found ${clazz.name}`, {clazz: $ly.fqn.get(clazz), params: params.map(param => param?.name)});
                return params;
            }
            return undefined;
        }
        if (next) {
            return undefined;
        }
        return this.$findConstructorParams(original, true);
    }



    // region self
    get description(): string {
        return `<reflect>`;
    }
    info(detailed?: boolean): RecLike {
        return {
            classes: this._classPointer.listValues().map(clazz => clazz.info(detailed)),
        };
    }
    get option(): ReflectOptionLike {
        return this._option;
    }
    // endregion self

    // region class
    classes(): Array<ClassReflectLike> {
        return this._classPointer.listValues();
    }
    $findClass(clazz: FuncLike, body?: ObjectLike): ClassReflectLike {
        if (!clazz) {
            throw new DeveloperException('reflect:empty.class.function');
        }
        let ref = this._classPointer.findValue(clazz, false);
        if (!ref) {
            ref = new ClassReflect(clazz, body);
            this._classPointer.addPrimary(clazz, ref);
            this.LOG.debug(`Class added`, {clazz: ref.name});
        }
        return ref;
    }

    getClass(identifier: FuncLike | string, throwable?: boolean): ClassReflectLike {
        return this._classPointer.findValue(identifier as FuncLike, throwable);
    }

    hasClass(identifier: FuncLike | string): boolean {
        return this._classPointer.isPrimary(identifier as FuncLike);
    }
    protected _hasAnyDeco(ref: ReflectLike, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean {
        if (!$ly.primitive.isArrayFilled(decoList)) {
            return false;
        }
        if (!ref) {
            return false;
        }
        filter = filter ?? {};
        const fnList = decoList
            .map(deco => $ly.deco.getDecorator(deco as FuncLike, false))
            .filter(fn => !!fn)
            .map(deco => deco.fn);
        if (fnList.length < 1) {
            return false;
        }
        for (const fn of ref.decorators(filter)) {
            if (fnList.includes(fn)) {
                return true;
            }
        }
        return false;
    }
    classHasAnyDeco(clazz: FuncLike|string, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean {
        return this._hasAnyDeco(this.getClass(clazz, false), decoList, filter)
    }
    propertyHasAnyDeco(clazz: FuncLike|string, property: string, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean {
        return this._hasAnyDeco(this.getProperty(clazz, property, filter), decoList, filter);
    }
    paramHasAnyDeco(clazz: FuncLike|string, property: string, index: number, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean {
        return this._hasAnyDeco(this.getParam(clazz, property, index, filter), decoList, filter);

    }
    classesBy(identifier: DecoLike|DecoAliasLike|FuncLike|string, filter?: DecoFilter): Array<ClassReflectLike> {
        const deco = $ly.deco.getDecorator(identifier as FuncLike, false);
        if (!deco) {
            return [];
        }
        return this._classPointer.listValues().filter(cRef => cRef.hasDecorator(deco, filter));
    }
    // endregion class

    // region parameter
    getParam(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): ParameterReflectLike {
        const fRef = this.getProperty(identifier, property);
        if (!fRef) {
            return undefined;
        }
        return fRef.getParameter(index, filter);
    }

    hasParam(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): boolean {
        const fRef = this.getProperty(identifier, property);
        if (!fRef) {
            return false;
        }
        return fRef.hasParameter(index, filter);
    }
    // endregion parameter

    // region property
    hasProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): boolean {
        const cRef = this.getClass(identifier, false);
        if (!cRef) {
            return false;
        }
        const fRef = cRef.getAnyProperty(property, filter);
        return !!fRef;
    }
    getProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): PropertyReflectLike {
        const cRef = this.getClass(identifier, false);
        if (!cRef) {
            return undefined;
        }
        return cRef.getAnyProperty(property, filter);
    }
    // endregion property

    // region sync
    described<D extends ReflectClassDescribed = ReflectDescribed>(deco: DecoLike, ...descriptors: Array<unknown>): D {
        const name = deco.name;
        const described = {
            deco,
            target: undefined,
            keyword: undefined,
            classFn: undefined,
            classProto: undefined,
            error: undefined,
            description: `on ${name}`,
            shortDescription: `on ${name}`,
        } as ReflectDescribed;
        const target = descriptors[0] as ObjectLike|FuncLike;
        const typeOf = typeof target;
        if (typeOf === 'function') {
            described.keyword = 'static';
            described.classFn = target as FuncLike;
            described.classProto = described.classFn.prototype;
        } else if (typeOf === 'object' && target && target.constructor) {
            described.keyword = 'instance';
            described.classFn = target.constructor as FuncLike;
            described.classProto = target as ObjectLike;
        } else {
            described.error = new DeveloperException('reflect:invalid.class.descriptor')
                .patch({typeOf, target: described.description})
                .with(this);
            return described as D;
        }
        // class decorator
        if (!descriptors[1]) {
            described.target = 'class';
            described.description = `<class>${$ly.fqn.get(described.classFn)} on ${name}`;
            described.shortDescription = `<C>${described.classFn.name} on ${name}`;
            return described as D;
        }
        const sign = (described.keyword === 'instance') ? '->' : '::';
        // if 3rd argument is number than its index so its parameter decorator
        if (typeof descriptors[2] === 'number') {
            described.target = 'parameter';
            described.property = $ly.primitive.text(descriptors[1]);
            described.index = descriptors[2] as number;
            described.description = `<parameter>${$ly.fqn.get(described.classFn)}${sign}${described.property}#${described.index} on ${name}`;
            described.shortDescription = `<P>${described.classFn.name}${sign}${described.property}#${described.index} on ${name}`;
            if (!described.property) {
                described.error = new DeveloperException('reflect:invalid.parameter.descriptor')
                    .patch({clazz: $ly.fqn.get(described.classFn), keyword: described.keyword, property: descriptors[1]})
                    .with(this);
            }
            return described as D;
        }
        // method decorator
        if (descriptors[2] && typeof (descriptors[2] as PropertyDescriptor).value === 'function') {
            described.target = 'method';
            described.property = $ly.primitive.text(descriptors[1]);
            described.methodDescriptor = descriptors[2];
            described.methodFn = described.methodDescriptor.value;
            described.description = `<method>${$ly.fqn.get(described.classFn)}${sign}${described.property} on ${name}`;
            described.shortDescription = `<M>${described.classFn.name}${sign}${described.property} on ${name}`;
            if (!described.property) {
                described.error = new DeveloperException('reflect:invalid.method.descriptor')
                    .patch({clazz: $ly.fqn.get(described.classFn), keyword: described.keyword, property: descriptors[1]})
                    .with(this);
            } else if (typeof described.methodFn !== 'function') {
                described.error = new DeveloperException('reflect:invalid.method.function')
                    .patch({clazz: $ly.fqn.get(described.classFn), keyword: described.keyword, property: descriptors[1]})
                    .with(this);
            }
            return described as D;
        }
        // field decorator, it can be 3rd arg is undefined
        described.target = 'field';
        described.property = $ly.primitive.text(descriptors[1]);
        described.description = `<field>${$ly.fqn.get(described.classFn)}${sign}${described.property} on ${name}`;
        described.shortDescription = `<F>${described.classFn.name}${sign}${described.property} on ${name}`;
        if (!described.property) {
            described.error = new DeveloperException('reflect:invalid.field.descriptor')
                .patch({clazz: $ly.fqn.get(described.classFn), keyword: described.keyword, property: descriptors[1]})
                .with(this);
        }
        return described as D;
    }
    // endregion sync
}
