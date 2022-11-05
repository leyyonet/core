import {DecoLike} from "../deco";
import {CastKeyofClassMap, CastOption} from "./types";
import {$ly} from "../core";

export function CastKeyof(key: string, classMap: CastKeyofClassMap, opt?: CastOption): any {
    return (clazz, property, index) => {
        if (index === undefined) {
            const described = $ly.reflect.described(_deco, clazz, property);
            _deco.assign(described, {classMap, key, opt}).asProperty;
            $ly.cast.$keyof(described, key, classMap, opt);
        } else {
            const described = $ly.reflect.described(_deco, clazz, property, index);
            _deco.assign(described, {classMap, key, opt}).asProperty;
            $ly.cast.$keyof(described, key, classMap, opt);
        }
    };
}
let _deco: DecoLike;
$ly.addDeco(CastKeyof, () => {
    _deco = $ly.deco.addDecorator(CastKeyof, {field: true, parameter: true});
});
