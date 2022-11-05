import {DecoLike} from "../deco";
import {$ly} from "../core";

export function Component(): ClassDecorator {
    return (clazz) => {
        const described = $ly.reflect.described(_deco, clazz);
        const assigned = _deco.assign(described, {}).asClass;
        $ly.injector.$addToStagingClass(_deco, assigned);
    }
}
let _deco: DecoLike;
$ly.addDeco(Component, () => {
    _deco = $ly.deco.addDecorator(Component, {clazz: true, isFinal: true});
});
