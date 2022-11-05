import {DecoLike} from "../deco";
import {FuncLike} from "../common";
import {$ly} from "../core";

export function CastAlias(alias: FuncLike): ClassDecorator {
    return function (clazz) {
        const described = $ly.reflect.described(_deco, clazz);
        alias = $ly.primitive.check(this, 'alias', alias, $ly.primitive.funcFilled, {target: described.description});
        try {
            $ly.cast.addAlias(alias, clazz);
        } catch (e) {
            throw $ly.error.build(e)
                .with(this)
                .causedBy(e)
                .patch({target: described.description});
        }
        _deco.assign(described, {alias});
    }
}
let _deco: DecoLike;
$ly.addDeco(CastAlias, () => {
    _deco = $ly.deco.addDecorator(CastAlias, {clazz: true});
});
