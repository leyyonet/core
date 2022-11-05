import {DecoLike} from "../deco";
import {$ly} from "../core";

export function LazyWired(identifier?: string): any {
    return (clazz, property, descriptor?) => {
        const described = $ly.reflect.described(_deco, clazz, property, descriptor);
        $ly.primitive.check(this, 'identifier', identifier, $ly.primitive.text, {target: described.description});
        const assigned = _deco.assign(described, {identifier});
        $ly.injector.$addToStagingMember(_deco, assigned);
    }
}
let _deco: DecoLike;
$ly.addDeco(LazyWired, () => {
    _deco = $ly.deco.addDecorator(LazyWired, {field: true, method: true});
    $ly.addTrigger('injector', () => {
        $ly.injector.$setLazyWired(LazyWired);
    });
});
