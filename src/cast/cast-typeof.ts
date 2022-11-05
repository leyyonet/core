import {DecoLike} from "../deco";
import {CastOption, CastTypeofClassMap} from "./types";
import {$ly} from "../core";

export function CastTypeof(classMap: CastTypeofClassMap, opt?: CastOption): any {
    return (clazz, property, index) => {
        if (index === undefined) {
            const described = $ly.reflect.described(_deco, clazz, property);
            _deco.assign(described, {classMap, opt}).asProperty;
            $ly.cast.$typeof(described, classMap, opt);
        } else {
            const described = $ly.reflect.described(_deco, clazz, property, index);
            _deco.assign(described, {classMap, opt}).asProperty;
            $ly.cast.$typeof(described, classMap, opt);
        }
    };
}
let _deco: DecoLike;
$ly.addDeco(CastTypeof, () => {
    _deco = $ly.deco.addDecorator(CastTypeof, {field: true, parameter: true});
});
