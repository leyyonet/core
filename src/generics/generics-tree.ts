// x_console.log(`## ${__filename}`, {i: 'loading'});

import {GenericsAnyIdentifier, GenericsTreeLike} from "./types";
import {RecLike} from "../common";
import {$ly} from "../core";


/**
 * @instance
 * */
export class GenericsTree implements GenericsTreeLike {
    base: string;
    variations: Array<GenericsTreeLike>;
    children: Array<GenericsTreeLike>;

    constructor(base?: string, ...children: Array<GenericsAnyIdentifier>) {
        this.base = base;
        this.variations = [];
        this.children = children.map(child => {
            if (child instanceof GenericsTree) {
                return child;
            }
            return $ly.generics.$toTreeAsChild(child);
        });
    }
    static {
        $ly.addFqn(this);
    }
    toJSON(): RecLike {
        const obj = {base: this.base} as RecLike;
        if ($ly.primitive.isArrayFilled(this.variations)) {
            obj.variations = this.variations.map(c => c.toJSON());
        }
        if ($ly.primitive.isArrayFilled(this.children)) {
            obj.children = this.children.map(c => c.toJSON());
        }
        return obj;
    }
}