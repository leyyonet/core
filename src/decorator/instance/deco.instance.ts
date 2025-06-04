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
import {CONSTRUCTOR} from "../../reflection/internal";


export class DecoInstance<V = Dict, M = Dict, P = V> implements DecoInstanceLike<V, M, P> {
    private _isCopied: boolean;
    private _identifier: DecoIdLike<V, M, P>;
    private _clone: DecoCloneLike<V, M, P>;
    private _target: Target;
    private _assigned: CoreReflectionLike;
    private _arguments: DecoArguments;
    private _description: string;

    protected constructor() {

    }
    static copy<V = Dict, M = Dict, P = V>(source: DecoInstance<V, M, P>, assigned: CoreReflectionLike): DecoInstance<V, M, P> {
        const ins = new DecoInstance<V, M, P>();
        ins._isCopied = true;
        ins._identifier = source.identifier;
        ins._clone = source.clone;
        ins._target = source.target;
        ins._arguments = source.arguments;
        ins._assigned = assigned;
        return ins;
    }

    static create<V = Dict, M = Dict, P = V>(identifier: DecoIdLike<V, M, P>, clone: DecoCloneLike<V, M, P>, args: Array<unknown>): DecoInstance<V, M, P> {
        const ins = new DecoInstance<V, M, P>();
        ins._identifier = identifier;
        ins._clone = clone;
        identifier.addInstance(ins as DecoInstanceLike);


        let keyword: DecoKeyword;
        let classFn: ClassLike = null;
        let prototype: Obj = null;
        let memberName: string = null;
        let methodFn: Func = null;
        let descriptor: PropertyDescriptor;
        let index: number;
        // let isGetter: boolean;
        // let isSetter: boolean;
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

        // constructor parameter
        if (!args[1] && typeof args[2] === 'number') {
            args[1] = CONSTRUCTOR;
            keyword = 'instance';
        }

        // console.info(decoratorName, args);
        if (!args[1]) {
            ins._target = 'class';
            if (!(clone ?? identifier).hasTarget('class')) {
                throw $dev.developerError({
                    issue: 'not.allowed.target-class:' + identifier.name,
                    where: 'leyyo.decorator.DecoInstance',
                    target: ins._target,
                    clazz: classFn?.name
                });
            }
            ins._arguments = [targetObj];
        }
        else {
            memberName = args[1] as string;
            if (!memberName) {
                throw $dev.invalidError({
                    issue: 'member.name.empty',
                    where: 'leyyo.decorator.DecoInstance',
                    target: ins._target,
                    clazz: classFn?.name,
                    member: args[1],
                    index: args[2]
                });
            }
            if (typeof args[2] === 'number') { // if 3rd argument is number then its index so its parameter decorator
                index = args[2];
                ins._target = 'parameter';
                if (!(clone ?? identifier).hasTarget('parameter')) {
                    throw $dev.developerError({
                        issue: 'not.allowed.target-parameter:' + identifier.name,
                        where: 'leyyo.decorator.DecoInstance',
                        target: ins._target,
                        clazz: classFn?.name,
                        member: memberName,
                        index
                    });
                }
                ins._arguments = [targetObj, memberName, index];
            }
            else if (args[2]) {
                descriptor = args[2] as TypedPropertyDescriptor<any>;
                if (typeof descriptor.value === 'function') { // method decorator
                    ins._target = 'method';
                    methodFn = (args[2] as PropertyDescriptor).value; // method function
                    if (!(clone ?? identifier).hasTarget('method')) {
                        throw $dev.developerError({
                            issue: 'not.allowed.target-method:' + identifier.name,
                            where: 'leyyo.decorator.DecoInstance',
                            target: ins._target,
                            clazz: classFn?.name,
                            member: args[1]
                        });
                    }
                    ins._arguments = [targetObj, memberName, descriptor];
                }
                else {
                    forField = true;
                    // if (typeof descriptor.get === 'function') {
                    //     isGetter = true;
                    // }
                    // if (typeof descriptor.set === 'function') {
                    //     isSetter = true;
                    // }
                }
            }
            else { // field decorator, it can be 3rd arg is undefined
                forField = true;
            }
        }
        if (forField) {
            if (!(clone ?? identifier).hasTarget('field')) {
                throw $dev.developerError({
                    issue: 'not.allowed.target-field:' + identifier.name,
                    where: 'leyyo.decorator.DecoInstance',
                    target: ins._target,
                    clazz: classFn?.name,
                    member: args[1]
                });
            }
            ins._target = 'field';
            ins._arguments = [targetObj, memberName];

        }
        // todo system class
        if ((['method', 'field'] as Array<Target>).includes(ins._target)) {
            if (keyword === 'static' && identifier.hasRule('no-static')) {
                throw $dev.developerError({
                    issue: 'not.used.for.static.member',
                    where: 'leyyo.decorator.DecoInstance',
                    target: ins._target,
                    clazz: classFn?.name,
                    member: args[1]
                });
            }
            else if (keyword === 'instance' && identifier.hasRule('no-instance')) {
                throw $dev.developerError({
                    issue: 'not.used.for.instance.member',
                    where: 'leyyo.decorator.DecoInstance',
                    target: ins._target,
                    clazz: classFn?.name,
                    member: args[1]
                });
            }
        }

        const assigned = core.reflectionPool.registerClass(classFn, prototype);
        switch (ins._target) {
            case 'class':
                ins._assigned = assigned;
                break;
            case 'method':
                ins._assigned = assigned.$secure.$createProperty(memberName, keyword, 'method', methodFn);
                break;
            case 'field':
                ins._assigned = assigned.$secure.$createProperty(memberName, keyword, 'field');
                break;
            case 'parameter':
                ins._assigned = assigned.$secure.$createProperty(memberName, keyword, 'method', methodFn).getParameter(index);
                break;
        }

        if (identifier.hasRule('no-multiple')) {
            const found = ins._assigned.docsAll().filter(doc => doc.ins.identifier === identifier);
            if (found.length > 0) {
                throw $dev.developerError2(FQN_PCK, 120, {issue: 'Decorator does not allow multiple value for same target', desc: ins.description});
            }
        }
        return ins;
    }

    // region getters
    get isCopied(): boolean {
        return this._isCopied;
    }

    copySelf(assigned: CoreReflectionLike): DecoInstanceLike<V, M, P> {
        return DecoInstance.copy<V, M, P>(this, assigned);
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
    set(value?: V): CoreReflectionLike {
        this._assigned.setValue(this as DecoInstanceLike, value);
        return this._assigned;
    }
    delete(): void {
        this._assigned.clearValue(this as DecoInstanceLike);
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
        const rec = {};
        if (simple) {
            if (this._clone) {
                rec['decorator'] = this._clone.toJSON(true);
            }
            else {
                rec['decorator'] = this._identifier.toJSON(true);
            }
            rec['description'] = this._description;
            return rec;
        }
        if (this._clone) {
            rec['deco'] = this._clone.toJSON(true);
        }
        else {
            rec['id'] = this._identifier.toJSON(true);
        }
        rec['target'] = this._target;
        rec['assigned'] = this._assigned.toJSON(true);
        rec['description'] = this._description;
        return rec;
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(DecoInstance, FQN_PCK);
});
