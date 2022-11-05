import {DecoLike} from "../deco";
import {$ly} from "../core";

export function Description(description: string): any {
    return ((clazz, property, indexOrDescriptor) => {
        const described = $ly.reflect.described(_deco, clazz, property, indexOrDescriptor);
        description = $ly.primitive.check(this,'description', description, $ly.primitive.textFilled, {target: described.description});
        _deco.assign(described, {description});
    });
}
let _deco: DecoLike;
$ly.addDeco(Description, () => {
    _deco = $ly.deco.addDecorator(Description, {clazz: true, method: true, field: true, parameter: true});
});
