import {ClassLike, Func} from "@leyyo/common";

/**
 * Name handler
 * */
export interface NameHandlerLike {
    /**
     * Copies function name
     * */
    copy(source: Func | ClassLike, target: Func | ClassLike): void;

    /**
     * Sets function name, especially for arrow functions or proxied class
     * */
    set(target: Func | ClassLike, name: string): void;
    anonymous(type: string, counter: number): string;
}
