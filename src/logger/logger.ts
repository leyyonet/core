import {DecoLike} from "../deco";
import {$ly} from "../core";

/**
 * Set logger instance
 */
export function Logger(): any {
    return (clazz, property?, index?) => {
        // todo
        const described = $ly.reflect.described(_deco, clazz, property, index);
        _deco.assign(described);
    };
}
let _deco: DecoLike;
$ly.addDeco(Logger, () => {
    _deco = $ly.deco.addDecorator(Logger, {clazz: true, field: true, parameter: true});
});