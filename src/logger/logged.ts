import {DecoLike} from "../deco";
import {$ly} from "../core";
import {FuncLike} from "../common";

/**
 * Prints logging for method
 */
export function Logged(): MethodDecorator;
export function Logged(input: FuncLike, output: FuncLike): MethodDecorator;
export function Logged(input: FuncLike, output: boolean): MethodDecorator;
export function Logged(input: boolean, output: FuncLike): MethodDecorator;
export function Logged(input: boolean, output: boolean): MethodDecorator;
export function Logged(input: FuncLike|boolean = true, output: FuncLike|boolean = true): MethodDecorator {
    return (clazz, property, body) => {
        // todo
        const described = $ly.reflect.described(_deco, clazz, property, body);
        _deco.assign(described);
    };
}
let _deco: DecoLike;
$ly.addDeco(Logged, () => {
    _deco = $ly.deco.addDecorator(Logged, {method: true});
});