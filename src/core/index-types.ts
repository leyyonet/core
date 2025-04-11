import {Func, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoratorPoolLike} from "../decorator";
import {ReflectionPoolLike} from "../reflection";
import {FqnPoolLike} from "../fqn";
import {InjectionPoolLike} from "../injection";
import {FootprintLike} from "../footprint";
import {RulerPoolLike} from "../ruler";
import {CallbackPoolLike} from "../callback";
import {EnumPoolLike} from "../enum";
import {CoreProxyLike} from "../proxy";
import {CoreBindLike} from "../bind";

export interface CoreLike extends ShiftSecure<CoreSecure> {
    get decorator(): DecoratorPoolLike;

    get footprint(): FootprintLike;

    get fqn(): FqnPoolLike;

    get injection(): InjectionPoolLike;

    get reflection(): ReflectionPoolLike;

    get ruler(): RulerPoolLike;

    get callback(): CallbackPoolLike;
    get enumeration(): EnumPoolLike;
    get proxy(): CoreProxyLike;
    get bind(): CoreBindLike;
}

export interface CoreSecure extends ShiftMain<CoreLike> {
    $setDecorator(ins: DecoratorPoolLike): CoreSecure;

    $setFootprint(ins: FootprintLike): CoreSecure;

    $setFqn(ins: FqnPoolLike): CoreSecure;

    $setInjection(ins: InjectionPoolLike): CoreSecure;

    $setReflection(ins: ReflectionPoolLike): CoreSecure;

    $setRuler(ins: RulerPoolLike): CoreSecure;

    $setCallback(ins: CallbackPoolLike): CoreSecure;
    $setEnumeration(ins: EnumPoolLike): CoreSecure;
    $setProxy(ins: CoreProxyLike): CoreSecure;
    $setBind(ins: CoreBindLike): CoreSecure;
}

export interface CoreResourceItems {
    path: string;
    classes?: Array<Func>;
    functions?: Array<Func>;
    decorators?: Array<Func>;
    enums?: Array<[string, Obj]>;
    literals?: Readonly<Array<[string, Obj]>>;
}