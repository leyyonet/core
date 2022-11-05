import {DecoAliasLike} from "../deco";
import {$ly} from "../core";
import {Component} from "./component";

export function Singleton(): ClassDecorator {
    return (clazz) => {
        const described = $ly.reflect.described(_deco, clazz);
        const assigned = _deco.assign(described, {}).asClass;
        $ly.injector.$addToStagingClass(_deco, assigned);
    }
}
let _deco: DecoAliasLike;
$ly.addDeco(Singleton, () => {
    _deco = $ly.deco.addAlias(Singleton, Component, {clazz: true, isFinal: true});
});
