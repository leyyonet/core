import {DecoLike} from "../deco";
import {ReflectKeyword} from "../reflect";
import {$ly} from "../core";

export function CastAssign(keyword: ReflectKeyword = 'static'): ClassDecorator {
    return function (clazz) {
        // todo keyword
        const described = $ly.reflect.described(_deco, clazz);
        $ly.cast.$addFromDeco(_deco, described, keyword);
    }
}
let _deco: DecoLike;
$ly.addDeco(CastAssign, () => {
    _deco = $ly.deco.addDecorator(CastAssign, {clazz: true});
});
