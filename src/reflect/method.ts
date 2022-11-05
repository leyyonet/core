import {DecoLike} from "../deco";
import {$ly} from "../core";
import {Description} from "./description";

export function Method(description?: string): MethodDecorator {
    return ((clazz, property, body) => {
        const described = $ly.reflect.described(_deco, clazz, property, body);
        description = $ly.primitive.check(this,'description', description, $ly.primitive.text, {target: described.description});
        _deco.assign(described, {});
        if (description) {
            $ly.deco.getDecorator(Description).assign(described, {description});
        }
    });
}
let _deco: DecoLike;
$ly.addDeco(Method, () => {
    _deco = $ly.deco.addDecorator(Method, {method: true});
});
