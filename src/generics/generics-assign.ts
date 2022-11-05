import {DecoLike} from "../deco";
import {ReflectKeyword} from "../reflect";
import {$ly} from "../core";
import {GenericsLike} from "./types";
import {CastAssign} from "../cast";

export function GenericsAssign(keyword: ReflectKeyword = 'static'): ClassDecorator {
    return function (clazz) {
        const described = $ly.reflect.described(_deco, clazz);
        const assigned = _deco.assign(described, {keyword});
        let instance: GenericsLike;
        if (keyword === 'static') {
            instance = clazz as unknown as GenericsLike;
        }
        else {
            instance = $ly.injector.$newInstance(clazz, GenericsAssign);
        }
        $ly.generics.add(clazz, instance);
        if (!$ly.cast.isClass(clazz)) {
            $ly.cast.add(clazz, instance);
            assigned.setValue($ly.deco.getDecorator(CastAssign), {keyword});
        }
    }
}
let _deco: DecoLike;
$ly.addDeco(GenericsAssign, () => {
    _deco = $ly.deco.addDecorator(GenericsAssign, {clazz: true});
});