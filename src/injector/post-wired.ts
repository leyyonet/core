import {DecoLike} from "../deco";
import {$ly} from "../core";
import {ReflectMethodDescribed} from "../reflect";

export function PostWired(identifier?: string): any {
    return (clazz, property, descriptor?) => {
        const described = $ly.reflect.described(_deco, clazz, property, descriptor);
        $ly.primitive.check(this, 'identifier', identifier, $ly.primitive.text, {target: described.description});
        const assigned = _deco.assign(described, {identifier}).asProperty;
        $ly.injector.$addToStagingMember(_deco, assigned);
    }
}
let _deco: DecoLike;
$ly.addDeco(PostWired, () => {
    _deco = $ly.deco.addDecorator(PostWired, {field: true, method: true});
    $ly.addTrigger('injector', () => {
        $ly.injector.$setPostWired(PostWired);
    });
});
