import {DecoLike} from "../deco";
import {FuncLike} from "../common";
import {$ly} from "../core";

export function GenericsAlias(alias: FuncLike): ClassDecorator {
    return function (clazz) {
        const described = $ly.reflect.described(_deco, clazz);
        alias = $ly.primitive.check(this, 'alias', alias, $ly.primitive.funcFilled);
        $ly.generics.addAlias(alias, clazz);
        _deco.assign(described, {alias});
    }
}
let _deco: DecoLike;
$ly.addDeco(GenericsAlias, () => {
    _deco = $ly.deco.addDecorator(GenericsAlias, {clazz: true});
});