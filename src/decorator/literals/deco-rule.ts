// noinspection JSUnusedGlobalSymbols


/**
 * DecoratorPool not allowed items
 * */
export const DecoRuleItems = [
    /*
    * Decorator can be assigned to only static properties (if it's field or method decorator)
    * */
    'no-instance',

    /*
    * Decorator can be assigned to only instance properties (if it's field or method decorator)
    * */
    'no-static',

    /*
    * Decorator can not be cloneable
    * */
    'no-cloneable',

    /*
    * Decorator value won't be cleared after lifecycle
    * */
    'no-volatile',

    /*
    * Inherited decorators will be ignored (class extends and property's proto)
    * */
    'no-inherited',

    /*
    * If a target has already same decorator, the next one will be ignored even if existing is inherited one
    * */
    'ignore-if-exists',

    /*
    * If a target has already same decorator, the next one will override existing
    * */
    'override-if-exists',

    /*
    * If a target has already same decorator, and existing is not inherited than throws an error
    * */
    'no-multiple',

    /*
    * If a target has already same decorator, the next one's value will be appended into existing
    * Note: Value of decorator must be an array
    * */
    'iterable',

    /*
    * Decorator assignment will not be copied for several usage: cast, rule, ...
    * */
    'no-copy',

    /*
    * This kind of decorator changes structure
    * - for class: new proxied class will extend the existing
    * - for method: descriptor (value function) will be changed
    * - for field: descriptor (getter, setter) will be changed
    * - for param: no implementation
    * */
    'changes-structure'

] as const;
/**
 * Decorator Rules
 * */
export type DecoRule = typeof DecoRuleItems[number];
