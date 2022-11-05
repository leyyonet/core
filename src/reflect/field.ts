import {DecoLike} from "../deco";
import {$ly} from "../core";
import {Description} from "./description";

export function Field(description?: string): PropertyDecorator {
    return ((clazz, property) => {
        const described = $ly.reflect.described(_deco, clazz, property);
        description = $ly.primitive.check(this,'description', description, $ly.primitive.text, {target: described.description});
        _deco.assign(described, {});
        if (description) {
            $ly.deco.getDecorator(Description).assign(described, {description});
        }
    });
}
let _deco: DecoLike;
$ly.addDeco(Field, () => {
    _deco = $ly.deco.addDecorator(Field, {field: true});
});
