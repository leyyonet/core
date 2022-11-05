/**
 * TargetEnum types for decorators
 *
 * @enum {string}
 * */
export enum TargetEnum {
    /**
     * Target is a class
     * */
    CLASS = 'class',
    /**
     * Target is a method [Property type should be a function]
     * */
    METHOD = 'method',
    /**
     * Target is a field [Property type should not be a function]
     * */
    FIELD = 'field',
    /**
     * Target is a parameter
     * */
    PARAMETER = 'parameter',
}
export type TargetLike = Lowercase<keyof typeof TargetEnum> | TargetEnum;