import {Arr} from "@leyyo/common";
import {AbstractReflection} from "./abstract";
import {ReflectionOption} from "./option";
import {ParameterReflection} from "./parameter";
import {PropertyReflection} from "./property";
import {ClassReflection} from "./class";
import {ReflectionPool} from "./pool";
import {
    _Class,
    _Field,
    _Method,
    _Param,
    Description,
    FinalClass,
    NotInstantiable,
    Singleton,
    StaticClass
} from "./decorators";

export const $$coreReflectionInternal: Arr = [
    AbstractReflection, ReflectionOption, ParameterReflection, PropertyReflection, ClassReflection, ReflectionPool,
    _Class, _Field, _Method, _Param, Description, FinalClass, NotInstantiable, StaticClass, Singleton
];
