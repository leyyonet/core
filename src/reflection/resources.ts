import {AbstractReflection} from "./abstract";
import {ClassReflection} from "./class";
import {ReflectionOption} from "./option";
import {ParameterReflection} from "./parameter";
import {PropertyReflection} from "./property";
import {CoreResourceItems} from "../core";
import {FQN_PCK} from "./internal";
import {ReflectionPool} from "./pool";
import {C, M, F, P, Description, FinalClass, NotInstantiable, Singleton, StaticClass} from "./decorators";

export const reflectionResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [AbstractReflection, ReflectionOption, ParameterReflection, PropertyReflection, ClassReflection, ReflectionPool],
    decorators: [F, C, M, P, Description, FinalClass, NotInstantiable, StaticClass, Singleton]
};