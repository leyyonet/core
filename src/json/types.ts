export interface CoreJsonLike {
    check<E = unknown>(value: unknown, maxLevel?: number): E;
    stringify(value: unknown, maxLevel?: number): string;
    print(...params: Array<unknown>): void;
}