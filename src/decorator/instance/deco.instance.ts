import {$dev, ClassLike, Dict, Func, Obj} from "@leyyo/common";
import {DecoArguments, DecoInstanceLike} from "./index.types";
import {DecoIdLike} from "../identifier";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {DecoCloneLike} from "../clone";
import {core} from "../../core";
import {DecoKeyword} from "../abstract";
import {Target} from "../literals";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";


export class DecoInstance<V = Dict, M = Dict, P = V> implements DecoInstanceLike<V, M, P> {
    private readonly _isCopied: boolean;
    private readonly _identifier: DecoIdLike<V, M, P>;
    private readonly _clone: DecoCloneLike<V, M, P>;
    private readonly _target: Target;
    private _assigned: CoreReflectionLike;
    private _arguments: DecoArguments;
    private _description: string;
    private _code: string;

    constructor(identifier: DecoIdLike<V, M, P>, clone: DecoCloneLike<V, M, P>, args: Array<unknown>, copied?: DecoInstanceLike<V, M, P>) {
        if (identifier === undefined && clone === undefined && args === undefined && copied instanceof DecoInstance) {
            this._isCopied = true;
            this._identifier = copied._identifier;
            this._clone = copied._clone;
            this._target = copied._target;
        }
        else {
            this._isCopied = false;
            let keyword: DecoKeyword;
            let classFn: ClassLike = null;
            let prototype: Obj = null;
            let memberName: PropertyKey = null;
            let methodFn: Func = null;
            let descriptor: PropertyDescriptor;
            let index: number;
            // let isGetter: boolean;
            // let isSetter: boolean;
            this._identifier = identifier;
            this._clone = clone;
            identifier.instances.push(this);
            const targetObj = args[0] as Obj | Func;
            const type = typeof targetObj;
            if (type === 'function') {
                keyword = 'static';
                classFn = targetObj as ClassLike;
                prototype = classFn.prototype as Obj;
            } else if (type === 'object' && targetObj && targetObj.constructor) {
                keyword = 'instance';
                classFn = targetObj.constructor as ClassLike;
                prototype = targetObj as Obj;
            } else {
                throw $dev.invalidError({
                    issue: 'not.evaluated.target',
                    where: 'leyyo.decorator.DecoInstance',
                    type: type,
                    value: targetObj
                });
            }
            let forField: boolean;
            // if (typeof FNC !== 'function') {throw new Error('UnknownTargetError');}

            // console.info(decoratorName, args);
            if (!args[1]) {
                this._target = 'class';
                if (!(clone ?? identifier).hasTarget('class')) {
                    throw $dev.developerError({
                        issue: 'not.allowed.target',
                        where: 'leyyo.decorator.DecoInstance',
                        target: this._target,
                        clazz: classFn?.name
                    });
                }
                this._arguments = [targetObj];
            } else {
                memberName = args[1] as PropertyKey;
                if (!memberName) {
                    throw $dev.invalidError({
                        issue: 'member.name.empty',
                        where: 'leyyo.decorator.DecoInstance',
                        target: this._target,
                        clazz: classFn?.name,
                        member: args[1],
                        index: args[2]
                    });
                }
                if (typeof args[2] === 'number') { // if 3rd argument is number then its index so its parameter decorator
                    index = args[2];
                    this._target = 'parameter';
                    if (!(clone ?? identifier).hasTarget('parameter')) {
                        throw $dev.developerError({
                            issue: 'not.allowed.target',
                            where: 'leyyo.decorator.DecoInstance',
                            target: this._target,
                            clazz: classFn?.name,
                            member: memberName,
                            index
                        });
                    }
                    this._arguments = [targetObj, memberName, index];
                } else if (args[2]) {
                    descriptor = args[2] as TypedPropertyDescriptor<any>;
                    if (typeof descriptor.value === 'function') { // method decorator
                        this._target = 'method';
                        methodFn = (args[2] as PropertyDescriptor).value; // method function
                        if (!(clone ?? identifier).hasTarget('method')) {
                            throw $dev.developerError({
                                issue: 'not.allowed.target',
                                where: 'leyyo.decorator.DecoInstance',
                                target: this._target,
                                clazz: classFn?.name,
                                member: args[1]
                            });
                        }
                        this._arguments = [targetObj, memberName, descriptor];
                    } else {
                        forField = true;
                        // if (typeof descriptor.get === 'function') {
                        //     isGetter = true;
                        // }
                        // if (typeof descriptor.set === 'function') {
                        //     isSetter = true;
                        // }
                    }
                } else { // field decorator, it can be 3rd arg is undefined
                    forField = true;
                }
            }
            if (forField) {
                if (!(clone ?? identifier).hasTarget('field')) {
                    throw $dev.developerError({
                        issue: 'not.allowed.target',
                        where: 'leyyo.decorator.DecoInstance',
                        target: this._target,
                        clazz: classFn?.name,
                        member: args[1]
                    });
                }
                // if (!descriptor) {
                //     if (keyword === 'static') {
                //         descriptor = Object.getOwnPropertyDescriptor(classFn, keyword);
                //     } else {
                //         descriptor = Object.getOwnPropertyDescriptor(prototype, keyword);
                //     }
                // }
                // if (typeof descriptor?.get === 'function') {
                //     isGetter = true;
                // }
                // if (typeof descriptor?.set === 'function') {
                //     isSetter = true;
                // }
                this._target = 'field';
                this._arguments = [targetObj, memberName];

            }
            // todo system class
            if ((['method', 'field'] as Array<Target>).includes(this._target)) {
                if (keyword === 'static' && identifier.hasRule('no-static')) {
                    throw $dev.developerError({
                        issue: 'not.used.for.static.member',
                        where: 'leyyo.decorator.DecoInstance',
                        target: this._target,
                        clazz: classFn?.name,
                        member: args[1]
                    });
                } else if (keyword === 'instance' && identifier.hasRule('no-instance')) {
                    throw $dev.developerError({
                        issue: 'not.used.for.instance.member',
                        where: 'leyyo.decorator.DecoInstance',
                        target: this._target,
                        clazz: classFn?.name,
                        member: args[1]
                    });
                }
            }

            const assigned = core.reflectionPool.registerClass(classFn, prototype);
            switch (this._target) {
                case 'class':
                    this._assigned = assigned;
                    break;
                case 'method':
                    this._assigned = assigned.$secure.$registerProperty(memberName, keyword, 'method', methodFn);
                    break;
                case 'field':
                    this._assigned = assigned.$secure.$registerProperty(memberName, keyword, 'field');
                    break;
                case 'parameter':
                    this._assigned = assigned.$secure.$registerProperty(memberName, keyword, 'method', methodFn).getParameter(index);
                    break;
            }

            if (identifier.hasRule('no-multiple')) {
                const found = this._assigned.docsAll().filter(doc => doc.ins.identifier === identifier);
                if (found.length > 0) {
                    throw $dev.developerError2(FQN_PCK, 120, {issue: 'Decorator does not allow multiple value for same target', desc: this.description});
                }
            }
        }
    }

    // region getters
    get isCopied(): boolean {
        return this._isCopied;
    }
    copy(assigned: CoreReflectionLike, args: DecoArguments): DecoInstanceLike<V, M, P> {
        const copied = new DecoInstance<V, M, P>(undefined, undefined, undefined, this);
        copied._assigned = assigned;
        copied._arguments = args;
        return copied;
    }
    get description(): string {
        if (!this._description) {
            if (this._clone) {
                this._description = `${this._clone.description} on ${this._assigned.description}`;
            } else {
                this._description = `${this._identifier.description} on ${this._assigned.description}`;
            }
        }
        return this._description;
    }

    get identifier(): DecoIdLike<V, M, P> {
        return this._identifier;
    }

    get clone(): DecoCloneLike<V, M, P> {
        return this._clone;
    }

    get name(): string {
        return this._identifier.name;
    }

    get code(): string {
        if (!this._code) {
            if (this._clone) {
                this._code = `${this._clone.name}/${this._assigned.code}`;
            } else {
                this._code = `${this._identifier.name}/${this._assigned.code}`;
            }
        }
        return this._code;
    }

    get target(): Target {
        return this._target;
    }

    get assigned(): CoreReflectionLike {
        return this._assigned;
    }

    get arguments(): DecoArguments {
        return this._arguments;
    }

    // endregion getters


    // region methods
    info(detailed?: boolean): Dict {
        return this._identifier.info(detailed);
    }

    set(value?: V): CoreReflectionLike {
        this._assigned.setValue(this, value);
        return this._assigned;
    }
    delete(): void {
        this._assigned.clearValue(this);
    }

    getValue<V2 = V>(): V2 {
        const docs = this._assigned.docsAll<V2>()
            .filter(doc => doc.ins === this as unknown as DecoInstanceLike<V2, Dict, V2>);
        if (docs.length < 1) {
            return undefined;
        }
        return docs[0].value;
    }

    // endregion methods

    // region class
    get isClass(): boolean {
        return this._target === 'class';
    }

    get asClass(): ClassReflectionLike {
        if (!this.isClass) {
            throw $dev.developerError({
                issue: 'target.conflicted',
                where: 'leyyo.decorator.DecoInstance',
                target: this._target,
                expected: 'class' as Target,
                desc: this._assigned.description
            });
        }
        return this._assigned as ClassReflectionLike;
    }

    // endregion class

    // region property
    get isProperty(): boolean {
        return this._target === 'method' || this._target === 'field';
    }

    get asProperty(): PropertyReflectionLike {
        if (!this.isProperty) {
            throw $dev.developerError({
                issue: 'target.conflicted',
                where: 'leyyo.decorator.DecoInstance',
                target: this._target,
                expected: ['method', 'field'],
                desc: this._assigned.description
            });
        }
        return this._assigned as PropertyReflectionLike;
    }

    // endregion property

    // region method
    get isMethod(): boolean {
        return this._target === 'method';
    }

    get asMethod(): PropertyReflectionLike {
        if (!this.isMethod) {
            throw $dev.developerError({
                issue: 'target.conflicted',
                where: 'leyyo.decorator.DecoInstance',
                target: this._target,
                expected: 'method' as Target,
                desc: this._assigned.description
            });
        }
        return this._assigned as PropertyReflectionLike;
    }

    // endregion method

    // region field
    get isField(): boolean {
        return this._target === 'field';
    }

    get asField(): PropertyReflectionLike {
        if (!this.isField) {
            throw $dev.developerError({
                issue: 'target.conflicted',
                where: 'leyyo.decorator.DecoInstance',
                target: this._target,
                expected: 'field' as Target,
                desc: this._assigned.description
            });
        }
        return this._assigned as PropertyReflectionLike;
    }

    // endregion field

    // region parameter
    get isParameter(): boolean {
        return this._target === 'parameter';
    }

    get asParameter(): ParameterReflectionLike {
        if (!this.isParameter) {
            throw $dev.developerError({
                issue: 'target.conflicted',
                where: 'leyyo.decorator.DecoInstance',
                target: this._target,
                expected: 'parameter' as Target,
                desc: this._assigned.description
            });
        }
        return this._assigned as ParameterReflectionLike;
    }

    // endregion parameter

    toJSON(simple?: boolean): any {
        if (simple) {
            return {
                id: this._identifier?.name,
                clone: this._clone?.name,
                target: this._target,
                assigned: this._assigned.description,
                description: this._description,
            };
        }
        return {
            __: DecoInstance.name,
            id: this._identifier?.toJSON(true),
            clone: this._clone?.toJSON(true),
            target: this._target,
            assigned: this._assigned.toJSON(true),
            description: this._description,
        };
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(DecoInstance, FQN_PCK);
});
