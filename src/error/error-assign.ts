import {DecoLike} from "../deco";
import {FuncLike} from "../common";
import {$ly} from "../core";

/**
 * Adds an exception to pool
 * todo: actions
 * */
export function ErrorAssign(): ClassDecorator {
    return (clazz: FuncLike) => {
        const described = $ly.reflect.described(_deco, clazz);
        $ly.error.add(clazz);
        _deco.assign(described, {});
    };
}
let _deco: DecoLike;
$ly.addDeco(ErrorAssign, () => {
    _deco = $ly.deco.addDecorator(ErrorAssign, {clazz: true});
});