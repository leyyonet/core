import {DecoLike} from "../deco";
import {$ly} from "../core";
import {Description} from "./description";

export function Clazz(description?: string): ClassDecorator {
    return (clazz => {
        const described = $ly.reflect.described(_deco, clazz);
        description = $ly.primitive.check(this,'description', description, $ly.primitive.text, {target: described.description});
        _deco.assign(described, {});
        if (description) {
            $ly.deco.getDecorator(Description).assign(described, {description});
        }
    });
}
let _deco: DecoLike;
$ly.addDeco(Clazz, () => {
    _deco = $ly.deco.addDecorator(Clazz, {clazz: true});
});
