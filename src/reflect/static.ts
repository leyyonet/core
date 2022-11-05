import {NewableClass} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";
import {DecoLike} from "../deco";

export function Static(): ClassDecorator {
    return (<T extends NewableClass>(clazz: T) => {
        const described = $ly.reflect.described(_deco, clazz);
        const cRef = _deco.assign(described, {}).asClass;
        // noinspection UnnecessaryLocalVariableJS
        const NewClass = class extends clazz {
            // noinspection JSUnusedLocalSymbols
            constructor(...args: any[]) {
                new DeveloperException('injector.static.class.can.not.be.instantiable')
                    .patch({target:cRef.description})
                    .with(Static).raise(true);
                super(...args);
            }
        }
        $ly.binder.setName(NewClass, clazz.name);
        $ly.symbol.setReferenced(NewClass, clazz);
        $ly.symbol.push(clazz, 'proxied', Static);
        return NewClass;
    }) as ClassDecorator;
}
let _deco: DecoLike;
$ly.addDeco(Static, () => {
    _deco = $ly.deco.addDecorator(Static, {clazz: true});
});
