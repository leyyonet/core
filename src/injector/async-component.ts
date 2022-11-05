import {$ly} from "../core";
import {DecoAliasLike} from "../deco";
import {Component} from "./component";

export function AsyncComponent(): ClassDecorator {
    return (clazz) => {
        const described = $ly.reflect.described(_deco, clazz);
        const assigned = _deco.assign(described, {}).asClass;
        $ly.injector.$addToStagingClass(_deco, assigned);
    }
}
let _deco: DecoAliasLike;
$ly.addDeco(AsyncComponent, () => {
    _deco = $ly.deco.addAlias(AsyncComponent, Component, {clazz: true, isFinal: true});
});
