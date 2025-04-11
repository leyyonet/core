// console.log(__filename);
/**
 * DecoratorPool target items
 * */
export const TargetItems = ['class', 'method', 'field', 'parameter'] as const;
// noinspection JSUnusedGlobalSymbols
/**
 * DecoratorPool target
 * */
export type Target = typeof TargetItems[number];
