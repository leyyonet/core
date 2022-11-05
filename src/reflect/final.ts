import {DecoLike} from "../deco";
import {$ly} from "../core";

export function Final(): ClassDecorator {
    return (clazz) => {
        const described = $ly.reflect.described(_deco, clazz);
        _deco.assign(described, {});
    }
}
let _deco: DecoLike;
$ly.addDeco(Final, () => {
    _deco = $ly.deco.addDecorator(Final, {clazz: true});
    $ly.addTrigger('reflect', () => $ly.reflect.$setFinalDeco(_deco));
});
