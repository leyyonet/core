import {DeveloperException, Func, is} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike} from "../identifier";
import {FQN_PCK} from "../internal";
import {DecoInstanceLike} from "../instance";

// console.log(__filename);


interface Opt {
    decorators: Array<Func>;
    all: boolean;
}

const _run = (ins: DecoInstanceLike<Opt>, functions: Array<Func> | true) => {
    const decorators = [] as Array<Func>;
    let all = false;
    if (functions === true) {
        all = true;
    } else if (is.array(functions) && functions.length > 0) {
        const invalid = functions.filter(f => !is.func(f));
        if (invalid.length > 0) {
            throw new DeveloperException('deco:is.not.func', {
                deco: ins.description,
                functions: invalid.map(f => core.fqn.get(f)).join(', ')
            });
        }
        decorators.push(...functions);
    } else {
        throw new DeveloperException('deco:invalid.functions', {functions});
    }
    ins.set({decorators, all})
}

const _init = () => {
    if (!decoClearProto) {
        core.fqn.decorator(ClearProto, FQN_PCK);
        decoClearProto = core.decorator.addIdentifier<Opt>(ClearProto, ['class', 'method', 'field']);
    }
}

/**
 * Clear inherited decorators
 *
 * For class: clears extended class's decorators
 * For Property: clears extended class's same property decorators
 */
export function ClearProto(all: true): MethodDecorator;
export function ClearProto(all: true): PropertyDecorator;
export function ClearProto(all: true): ClassDecorator;

export function ClearProto(functions: Array<Func> | true): MethodDecorator;
export function ClearProto(functions: Array<Func> | true): PropertyDecorator;
export function ClearProto(functions: Array<Func> | true): ClassDecorator;

export function ClearProto(functions: Array<Func> | true): ClassDecorator | MethodDecorator | PropertyDecorator {
    _init();
    return (clazz: Func, property?: string, descriptor?: TypedPropertyDescriptor<any>) => {
        _run(decoClearProto.fork(clazz, property, descriptor), functions);
    };
}

let decoClearProto: DecoIdLike<Opt>;

