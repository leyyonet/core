import {to} from "@leyyo/common";
import {core} from "../../core";
import {DecoCloneLike, DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {assertion} from "@leyyo/common";

// console.log(__filename);

interface Opt {
    description: string;
}

const _run = (ins: DecoInstanceLike<Opt>, description: string) => {
    assertion.notEmpty(description, () => {return {deco: ins.description, field: 'description'}});
    assertion.text(description, () => {return {deco: ins.description, field: 'description'}});
    ins.set({description: to.text(description, {deco: ins.description})});
}

const _init = () => {
    if (!decoDescription) {
        core.fqn.decorator(Description, FQN_PCK);
        decoDescription = core.decorator.addIdentifier<Opt>(Description, ['class', 'method', 'field', 'parameter', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(C, FQN_PCK);
        decoClass = core.decorator.addClone<Opt>(C, Description, ['class']);

        core.fqn.decorator(M, FQN_PCK);
        core.decorator.addClone<Opt>(M, Description, ['method']);

        core.fqn.decorator(F, FQN_PCK);
        core.decorator.addClone<Opt>(F, Description, ['field']);

        core.fqn.decorator(P, FQN_PCK);
        core.decorator.addClone<Opt>(P, Description, ['parameter']);
    }
}

/**
 * Decorates target with description
 */
export function Description(description: string): ClassDecorator;
export function Description(description: string): MethodDecorator;
export function Description(description: string): PropertyDecorator;
export function Description(description: string): ParameterDecorator;
export function Description(description: string): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator {
    _init();
    return (target: unknown, property: string, v3: TypedPropertyDescriptor<any>|number) => {
        _run(decoDescription.fork(target, property, v3), description);
    };
}
export let decoDescription: DecoIdLike<Opt>;

export function C(description?: string): ClassDecorator {
    _init();
    return (target => {
        _run(decoClass.fork(target), description);
    });
}
let decoClass: DecoCloneLike<Opt>;

export function M(description?: string): MethodDecorator {
    _init();
    return ((target, propertyKey, descriptor) => {
        _run(decoMethod.fork(target, propertyKey, descriptor), description);
    });
}
let decoMethod: DecoCloneLike<Opt>;

export function F(description?: string): PropertyDecorator {
    _init();
    return ((target, propertyKey) => {
        _run(decoField.fork(target, propertyKey), description);
    });
}
let decoField: DecoCloneLike<Opt>;

export function P(description?: string): PropertyDecorator {
    _init();
    return ((target, propertyKey) => {
        _run(decoParameter.fork(target, propertyKey), description);
    });
}
let decoParameter: DecoCloneLike<Opt>;