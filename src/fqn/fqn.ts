import {DecoLike} from "../deco";
import {FuncLike} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";

/**
 * Decorates class with optional prefixes
 *
 * Class fqn will be `{prefixes}.{class}`
 */
export function Fqn(...prefixes: Array<string>): ClassDecorator {
    return (clazz: FuncLike) => {
        $ly.fqn.clazz(clazz, ...prefixes);
        const described = $ly.reflect.described(_deco, clazz);
        prefixes = $ly.primitive.check(this, 'prefixes', prefixes,
            (v) => $ly.primitive.array(v, $ly.primitive.text), {target: described.description});
        const ref = $ly.reflect.getClass(clazz, false);
        if (ref && ref.decorators({belongs: "self"})?.length > 0) {
            throw new DeveloperException('fqn:fqn.should.be.first')
                .with(this)
                .patch({target: described.description})
        }
        _deco.assign($ly.reflect.described(_deco, clazz), {prefixes});
    };
}
let _deco: DecoLike;
$ly.addDeco(Fqn, () => {
    _deco = $ly.deco.addDecorator(Fqn, {clazz: true});
});