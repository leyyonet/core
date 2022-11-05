import {DecoLike} from "../deco";
import {CastOneClass, CastOption} from "./types";
import {$ly} from "../core";
import {DeveloperException} from "../error";
import {$devCast} from "./index.dev";

export function Cast(identifier?: CastOneClass, opt?: CastOption): any {
    return (clazz, property, index) => {
        if (index === undefined) {
            const described = $ly.reflect.described(_deco, clazz, property);
            const assigned = _deco.assign(described, {identifier, opt}).asProperty;
            if ($ly.not(identifier)) {
                if (!assigned.typeFn) {
                    throw new DeveloperException($devCast.class_invalid)
                        .with(this)
                        .patch({target: described.description});
                }
                $ly.cast.$one(described, assigned.typeFn, opt);
            } else {
                $ly.cast.$one(described, identifier, opt);
            }
        } else {
            const described = $ly.reflect.described(_deco, clazz, property, index);
            const assigned = _deco.assign(described, {identifier, opt}).asParameter;
            if ($ly.not(identifier)) {
                if (!assigned.typeFn) {
                    throw new DeveloperException($devCast.class_invalid)
                        .with(this)
                        .patch({target: described.description});
                }
                $ly.cast.$one(described, assigned.typeFn, opt);
            } else {
                $ly.cast.$one(described, identifier, opt);
            }
        }
    };
}
let _deco: DecoLike;
$ly.addDeco(Cast, () => {
    _deco = $ly.deco.addDecorator(Cast, {field: true, parameter: true});
});
