export interface CorePackageLike {
    add(name: string): void;

    getItems(): Array<string>;
}
