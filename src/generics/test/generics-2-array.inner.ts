import {ArraySome, Fqn, GenericsAnyIdentifier, GenericsLike, GenericsOption, leyyo, LY_TESTING_FQN} from "../../index";

@Fqn(...LY_TESTING_FQN)
export class MyArray implements GenericsLike<ArraySome> {
    cast(value: unknown | ArraySome, opt?: GenericsOption): ArraySome {
        return leyyo.primitive.array(value);
    }

    gen(identifier: GenericsAnyIdentifier, value: unknown | ArraySome, opt?: GenericsOption): ArraySome {
        if (leyyo.primitive.isEmpty(value)) {
            return value as ArraySome;
        }
        const tree = leyyo.generics.toTree(identifier);
        // leyyo.json.print('====> MyArray.gen', {tree: tree.toJSON(), value});
        if (tree.children.length < 0) {
            return this.cast(value);
        }
        const arr = this.cast(value) ?? [];
        arr.forEach((item, index) => {
            arr[index] = leyyo.generics.run(tree.children[0], item);
        });
        return arr;
    }

}
export const myArray = new MyArray();

@Fqn(...LY_TESTING_FQN)
export class NoGenericsArray {
    noGen(value: unknown): string {
        return leyyo.primitive.text(value);
    }
}
export const noGenericsArray = new NoGenericsArray();