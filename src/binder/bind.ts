import {DecoLike} from "../deco";
import {BinderType} from "./types";
import {$ly} from "../core";

/**
 * Binds class or instance methods
 *
 * - Binds instance methods when type in {@tutorial instance} and {@tutorial both} and it wraps constructor
 * - Binds class methods when type in {@tutorial static} and {@tutorial both}
 * @param {BinderType} keyword
 * */
export function Bind(keyword: BinderType = 'both'): ClassDecorator {
    return (clazz) => {
        // todo for instance, keyword
        const described = $ly.reflect.described(_deco, clazz);
        $ly.binder.bindAll(clazz);
        _deco.assign(described, {keyword});
    };
}
let _deco: DecoLike;
$ly.addDeco(Bind, () => {
    _deco = $ly.deco.addDecorator(Bind, {clazz: true});
});