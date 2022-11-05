import {DecoAliasLike} from "../deco";
import {$ly} from "../core";
import {Autowired} from "./autowired";

export function DI(identifier: string): ParameterDecorator;
export function DI(identifier: string, name: string): ParameterDecorator;
export function DI(identifier?: string, name?: string): ParameterDecorator {
    return (clazz, property: string, index) => {
        const described = $ly.reflect.described(_deco, clazz, property, index);
        $ly.primitive.check(this, 'identifier', identifier, $ly.primitive.text, {target: described.description});
        const assigned = _deco.assign(described, {identifier}).asParameter;
        assigned.$setName(name);
        $ly.injector.$addToStagingMember(_deco, assigned);
    }
}
let _deco: DecoAliasLike;
$ly.addDeco(DI, () => {
    _deco = $ly.deco.addAlias(DI, Autowired, {parameter: true});
});
