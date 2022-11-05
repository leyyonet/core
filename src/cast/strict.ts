import {DecoLike} from "../deco";
import {CastAnyIdentifier} from "./types";
import {$ly} from "../core";

export function Strict(identifier: CastAnyIdentifier): any {
    return (clazz, property: string, index?: number) => {
        // todo
        const described = $ly.reflect.described(_deco, clazz, property, index);
        _deco.assign(described, {identifier}).asProperty;
    };
}
let _deco: DecoLike;
$ly.addDeco(Strict, () => {
    _deco = $ly.deco.addDecorator(Strict, {field: true, parameter: true});
});