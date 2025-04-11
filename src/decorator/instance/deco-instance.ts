import {
    DecoArgument, DecoInstanceLike
} from "./index-types";
import {DecoIdLike} from "../identifier";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {ClassLike, DeveloperException, Dict, Func, Obj} from "@leyyo/common";
import {DecoCloneLike} from "../clone";
import {core} from "../../core";
import {DecoKeyword} from "../abstract";
import {Target} from "../literals";

// console.log(__filename);

export class DecoInstance<V extends Dict = Dict> implements DecoInstanceLike<V> {
    private readonly _identifier: DecoIdLike;
    private readonly _clone: DecoCloneLike;
    private readonly _target: Target;
    private readonly _assigned: CoreReflectionLike;
    private readonly _arguments: DecoArgument;
    private _description: string;

    info(detailed?: boolean): Dict {
        return this._identifier.info(detailed);
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


    constructor(identifier: DecoIdLike<V>, clone: DecoCloneLike<V>, args: Array<unknown>) {
        let KEYWORD: DecoKeyword = 'instance';
        let FNC: ClassLike = null;
        let BODY: Obj = null;
        let MEMBER_NAME: string = null;
        let METHOD_BODY: Func = null;
        let INDEX: number;
        this._identifier = identifier;
        this._clone = clone;
        identifier.instances.push(this);
        const targetObj = args[0] as Obj | Func;
        const type = typeof targetObj;
        if (type === 'function') {
            KEYWORD = 'static';
            FNC = targetObj as ClassLike;
        } else if (type === 'object' && targetObj && targetObj.constructor) {
            FNC = targetObj.constructor as ClassLike;
            BODY = targetObj as Obj;
        } else {
            throw new Error(`NotEvaluatedTargetObjectError: ${typeof type} ${targetObj}`);
        }
        // if (typeof FNC !== 'function') {throw new Error('UnknownTargetError');}

        // console.info(decoratorName, args);
        if (!args[1]) {
            this._target = 'class';
            if (!(clone ?? identifier).hasTarget('class')) {
                throw new DeveloperException('not.allowed.target', {target: this._target, clazz: FNC.name}).with(this);
            }
            this._arguments = {clazz: targetObj};
        } else {
            if (typeof args[2] === 'number') { // if 3rd argument is number then its index so its parameter decorator
                this._target = 'parameter';
                if (!(clone ?? identifier).hasTarget('parameter')) {
                    throw new DeveloperException('not.allowed.target', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
                MEMBER_NAME = args[1] as string;
                INDEX = args[2];
                this._arguments = {clazz: targetObj, property: MEMBER_NAME, index: INDEX};
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
            } else if (args[2] && typeof (args[2] as PropertyDescriptor).value === 'function') { // method decorator
                this._target = 'method';
                if (!(clone ?? identifier).hasTarget('method')) {
                    throw new DeveloperException('not.allowed.target', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
                MEMBER_NAME = args[1] as string;
                METHOD_BODY = (args[2] as PropertyDescriptor).value;
                this._arguments = {clazz: targetObj, property: MEMBER_NAME, descriptor: args[2] as PropertyDescriptor};
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
                if (typeof METHOD_BODY !== 'function') {
                    throw new DeveloperException('method.body.empty', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
            } else { // field decorator, it can be 3rd arg is undefined
                this._target = 'field';
                if (!(clone ?? identifier).hasTarget('field')) {
                    throw new DeveloperException('not.allowed.target', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
                MEMBER_NAME = args[1] as string;
                this._arguments = {clazz: targetObj, property: MEMBER_NAME};
                if (!MEMBER_NAME) {
                    throw new DeveloperException('property.name.empty', {
                        target: this._target,
                        clazz: FNC.name
                    }).with(this);
                }
            }
        }
        // todo system class
        if ((['method', 'field'] as Array<Target>).includes(this._target)) {
            if (KEYWORD === 'static' && identifier.isForbidden('no-static')) {
                throw new DeveloperException('not.used.for.static.member', {
                    target: this._target,
                    clazz: FNC.name
                }).with(this);
            } else if (KEYWORD === 'instance' && identifier.isForbidden('no-instance')) {
                throw new DeveloperException('not.used.for.instance.member', {
                    target: this._target,
                    clazz: FNC.name
                }).with(this);
            }
        }

        const assigned = core.reflection.registerClass(FNC, BODY, this);
        switch (this._target) {
            case 'class':
                this._assigned = assigned;
                break;
            case 'method':
                this._assigned = assigned.$secure.$registerProperty(MEMBER_NAME, KEYWORD, 'method', METHOD_BODY);
                break;
            case 'field':
                this._assigned = assigned.$secure.$registerProperty(MEMBER_NAME, KEYWORD, 'field');
                break;
            case 'parameter':
                this._assigned = assigned.$secure.$registerProperty(MEMBER_NAME, KEYWORD, 'method', METHOD_BODY).getParameter(INDEX);
                break;
        }
    }

    // region getters
    get identifier(): DecoIdLike {
        return this._identifier;
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
    get arguments(): DecoArgument {
        return {...this._arguments, target: this._target};
    }


    set(value?: V): CoreReflectionLike {
        (this._assigned as ClassReflectionLike).$secure.$setForCurrentDecorator(value);
        return this._assigned;
    }

    // endregion getters
    // region is
    isOfClass(): boolean {
        return this._target === 'class';
    }

    isOfMethod(): boolean {
        return this._target === 'method';
    }

    isOfField(): boolean {
        return this._target === 'field';
    }

    isOfParameter(): boolean {
        return this._target === 'parameter';
    }

    // endregion is
    // region as
    asClass(): ClassReflectionLike {
        if (!this.isOfClass()) {
            throw new DeveloperException('invalid.target', {
                target: this._target,
                expected: 'class' as Target,
                description: this._assigned.description
            }).with(this);
        }
        return (this._assigned as ClassReflectionLike).$secure.$setCurrentInstance(this).$back;
    }

    asMethod(): PropertyReflectionLike {
        if (!this.isOfMethod()) {
            throw new DeveloperException('invalid.target', {
                target: this._target,
                expected: 'method' as Target,
                description: this._assigned.description
            }).with(this);
        }
        return (this._assigned as PropertyReflectionLike).$secure.$setCurrentInstance(this).$back;
    }

    asField(): PropertyReflectionLike {
        if (!this.isOfField()) {
            throw new DeveloperException('invalid.target', {
                target: this._target,
                expected: 'field' as Target,
                description: this._assigned.description
            }).with(this);
        }
        return (this._assigned as PropertyReflectionLike).$secure.$setCurrentInstance(this).$back;
    }

    asParameter(): ParameterReflectionLike {
        if (!this.isOfParameter()) {
            throw new DeveloperException('invalid.target', {
                target: this._target,
                expected: 'parameter' as Target,
                description: this._assigned.description
            }).with(this);
        }
        return (this._assigned as ParameterReflectionLike).$secure.$setCurrentInstance(this).$back;
    }

    // endregion as

}