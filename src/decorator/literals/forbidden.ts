// noinspection JSUnusedGlobalSymbols
// console.log(__filename);

/**
 * DecoratorPool not allowed items
 * */
export const ForbiddenItems = ['no-instance', 'no-static', 'no-volatile', 'no-multiple', 'no-inherited'] as const;
/**
 * DecoratorPool not allowed
 *
 * @description *no-instance*: DecoratorPool can not be assigned to instance properties and their parameters [if method]
 *
 * - Option type is {@link DecoKind}
 * - If it's not set then decorator can be assigned to any property [static or instance]
 *
 * @description *no-static*: DecoratorPool can not be assigned to static properties and their parameters [if method]
 *
 * - Option type is {@link DecoKind}
 * - If it's not set then decorator can be assigned to any property [static or instance]
 *
 * @description *no-volatile*: DecoratorPool definition will be persistent after initialization
 *
 * - If it's not set then decorator definition will be removed from memory after initialization
 *
 * @description *no-multiple*: DecoratorPool values limited with one
 *
 * - New appended values will overwrite existing values
 * - If it's not set then a decorator can be used multiple times for a target, and values will be stored as an array of values
 *
 * @description *no-inherited*: DecoratorPool will not inherit proto/inherited decorators
 *
 * - If it's not set then parent's decorators will be inherited
 * - This option can not be implemented for parameters
 * */
export type Forbidden = typeof ForbiddenItems[number];