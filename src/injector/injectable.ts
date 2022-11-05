import {$ly} from "../core";
import {DecoAliasLike} from "../deco";
import {Component} from "./component";

export function Injectable(): ClassDecorator {
    return (clazz) => {
        const described = $ly.reflect.described(_deco, clazz);
        const assigned = _deco.assign(described, {}).asClass;
        $ly.injector.$addToStagingClass(_deco, assigned);
    }
}
let _deco: DecoAliasLike;
$ly.addDeco(Injectable, () => {
    _deco = $ly.deco.addAlias(Injectable, Component, {clazz: true, isFinal: true});
});
