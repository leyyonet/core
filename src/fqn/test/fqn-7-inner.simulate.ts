// noinspection JSUnusedGlobalSymbols

// region class
import {leyyo} from "../../index";

export class AbstractClass {
    static staticMethod1 (): number {return 1;}
    instanceMethod1 (): number {return 1;}
    static staticArrow1 = () => 1;
    instanceArrow1 = () => 1;
    static get staticGet1(): number {return 1;}
    get instanceGet1(): number {return 1;}

    static staticMethod2 (): number {return 2;}
    instanceMethod2 (): number {return 2;}
    static staticArrow2 = () => 2;
    instanceArrow2 = () => 2;
    static get staticGet2(): number {return 2;}
    get instanceGet2(): number {return 2;}
}
export class BaseClass extends AbstractClass {
    static staticMethod2 (): number {return 2;}
    instanceMethod2 (): number {return 2;}
    static staticArrow2 = () => 2;
    instanceArrow2 = () => 2;
    static get staticGet2(): number {return 2;}
    get instanceGet2(): number {return 2;}

    static staticMethod3 (): number {return 3;}
    instanceMethod3 (): number {return 3;}
    static staticArrow3 = () => 3;
    instanceArrow3 = () => 3;
    static get staticGet3(): number {return 3;}
    get instanceGet3(): number {return 3;}
}
export class InheritedClass extends BaseClass {
    static staticMethod3 (): number {return 3;}
    instanceMethod3 (): number {return 3;}
    static staticArrow3 = () => 3;
    instanceArrow3 = () => 3;
    static get staticGet3(): number {return 3;}
    get instanceGet3(): number {return 3;}

    static staticMethod4 (): number {return 4;}
    instanceMethod4 (): number {return 4;}
    static staticArrow4 = () => 4;
    instanceArrow4 = () => 4;
    static get staticGet4(): number {return 4;}
    get instanceGet4(): number {return 4;}
}
export const AnonymousClass = class {
    constructor() {leyyo.emptyFn();}
    static staticMethod5 (): number {return 5;}
    instanceMethod5 (): number {return 5;}
    static staticArrow5 = () => 5;
    instanceArrow5 = () => 5;
    static get staticGet5(): number {return 5;}
    get instanceGet5(): number {return 5;}
};
export const inheritedClass = new InheritedClass();
// endregion class
// region function
export function func1() {
    leyyo.emptyFn();
}
export const func2 = () => {
    leyyo.emptyFn();
}
export function *func3(i) {
    yield i;
    yield i + 10;
}
export function Func4() {
    this.property = 'foo bar';
}
export const func4 = new Func4();
// endregion function
// region enum
export enum Enum1 {
    KEY1 = 'key1'
}
export const possibleEnum2 = {
    key1: 1,
    key2: 2,
}
// endregion enum
// region object
export const obj = {
    fnc1() {
        leyyo.emptyFn();
    },
    property: 5,
    arr: [],
}
export const arr = [1,2,3];
export const map = new Map();
export const set = new Set();
export const weakSet = new WeakSet();
export const weakMap = new WeakMap();
// endregion object
