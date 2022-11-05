import {$ly} from "../core";
import {DecoLike} from "../deco";
import {Description} from "./description";

export function Parameter(name: string, description?: string): ParameterDecorator {
    return ((clazz, property, index) => {
        const described = $ly.reflect.described(_deco, clazz, property, index);
        name = $ly.primitive.check(this,'name', name, $ly.primitive.textFilled, {target: described.description});
        description = $ly.primitive.check(this,'description', description, $ly.primitive.text, {target: described.description});
        const pRef = _deco.assign(described, {}).asParameter;
        pRef.$setName(name);
        if (description) {
            $ly.deco.getDecorator(Description).assign(described, {description});
        }
    });
}
let _deco: DecoLike;
$ly.addDeco(Parameter, () => {
    _deco = $ly.deco.addDecorator(Parameter, {parameter: true});
});
