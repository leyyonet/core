import {DecoLike} from "../deco";
import {$ly} from "../core";

export function Nickname(...nicknames: Array<string>): ClassDecorator {
    return function (clazz) {
        const described = $ly.reflect.described(_deco, clazz);
        nicknames = $ly.primitive.check(this, 'nicknames', nicknames, (v) => $ly.primitive.arrayFilled(v, $ly.primitive.textFilled));
        $ly.pointer.appendNicknames(clazz, nicknames);
        _deco.assign(described, {nicknames});
    }
}
let _deco: DecoLike;
$ly.addDeco(Nickname, () => {
    _deco = $ly.deco.addDecorator(Nickname, {clazz: true});
});
