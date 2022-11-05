import {AbstractReflect} from "./abstract-reflect";
import {ClassReflect} from "./class-reflect";
import {CoreReflect} from "./core-reflect";
import {ParameterReflect} from "./parameter-reflect";
import {PropertyReflect} from "./property-reflect";
import {ReflectWrapper} from "./reflect-wrapper";
import {Clazz} from "./clazz";
import {Field} from "./field";
import {Property} from "./property";
import {Method} from "./method";
import {Parameter} from "./parameter";
import {Description} from "./description";
import {Final} from "./final";
import {Static} from "./static";


export const $mdl_reflect = [CoreReflect, AbstractReflect, ClassReflect, ParameterReflect, PropertyReflect, ReflectWrapper,
    Clazz, Description, Field, Final, Method, Parameter, Property, Static];