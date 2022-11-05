import {DecoAliasLike} from "../deco";
import {$ly} from "../core";
import {Field} from "./field";
import {Description} from "./description";

export function Property(description?: string): PropertyDecorator {
    return ((clazz, property) => {
        const described = $ly.reflect.described(_deco, clazz, property);
        description = $ly.primitive.check(this,'description', description, $ly.primitive.text, {target: described.description});
        _deco.assign(described, {});
        if (description) {
            $ly.deco.getDecorator(Description).assign(described, {description});
        }
    });
}
let _deco: DecoAliasLike;
$ly.addDeco(Property, () => {
    _deco = $ly.deco.addAlias(Property, Field);
});
