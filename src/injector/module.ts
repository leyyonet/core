import {DecoLike} from "../deco";
import {ClassLike, FuncLike, NewableClass, ObjectLike, Primitive, RecKey, RecLike} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";

type T = FuncLike | ObjectLike | Array<Primitive>;
// todo there is only one root, appModule should be root
export function Module(isRoot: true, ...classes: Array<T>): ClassDecorator;
export function Module(...classes: Array<T>): ClassDecorator
export function Module(...a: Array<unknown>): ClassDecorator {
    return (clazz) => {
        const fn = () => {
            if (a.length < 1) {
                throw new DeveloperException('injector:empty.parameters').with(this);
            }
            let isRoot;
            if (a[0] === true) {
                isRoot = true;
                a.shift();
                if (a.length < 1) {
                    throw new DeveloperException('injector:empty.classes').with(this);
                }
            }
            const classes = a;
            $ly.primitive.check(this, 'classes', a, v => $ly.primitive.array(v, $ly.primitive.funcFilled));
            const described = $ly.reflect.described(_deco, clazz);
            const ref = _deco.assign(described, {classes, isRoot}).asClass;
            $ly.injector.$addToStagingClass(_deco, ref);
            if (isRoot) {
                $ly.injector.$setRootModule(ref);
            }
        }
        if ($ly.processor) {
            fn();
        } else {
            $ly.addTrigger('processor', fn);
        }
    }
}
let _deco: DecoLike;
$ly.addDeco(Module, () => {
    _deco = $ly.deco.addDecorator(Module, {clazz: true, isFinal: true});
});
