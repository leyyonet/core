// todo class has not multiple post construct
import {$ly} from "../core";
import {DecoLike} from "../deco";

export function PostConstruct(): MethodDecorator {
    return (clazz, property, descriptor) => {
        const described = $ly.reflect.described(_deco, clazz, property, descriptor);
        _deco.assign(described, {});
    }
}
let _deco: DecoLike;
$ly.addDeco(PostConstruct, () => {
    _deco = $ly.deco.addDecorator(PostConstruct, {clazz: true});
});
