import {DecoLike} from "../deco";
import {$ly} from "../core";
import {PropertyReflectLike, ReflectPropertyDescribed} from "../reflect";

export function Autowired(identifier?: string): any {
    return (clazz, property, indexOrBody?) => {
        const described = $ly.reflect.described(_deco, clazz, property, indexOrBody);
        $ly.primitive.check(this, 'identifier', identifier, $ly.primitive.text, {target: described.description});
        const assigned = _deco.assign(described, {identifier});
        $ly.injector.$addToStagingMember(_deco, assigned);
    }
}
let _deco: DecoLike;
$ly.addDeco(Autowired, () => {
    _deco = $ly.deco.addDecorator(Autowired, {field: true, method: true, parameter: true});
    $ly.addTrigger('injector', () => {
        $ly.injector.$setAutowired(Autowired);
    });
});
