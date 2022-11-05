import {
    ArraySome,
    CastAlias,
    CastAssign,
    CastLike,
    DeveloperException,
    Fqn,
    GenericsAlias,
    GenericsAnyIdentifier,
    GenericsAssign,
    GenericsLike,
    GenericsOption,
    leyyo,
    LY_TESTING_FQN,
    Nickname,
    RecKey
} from "../../index";

@CastAssign("instance")
@CastAlias(String)
@Fqn(...LY_TESTING_FQN)
export class StringType implements CastLike<string> {
    cast(value: unknown|string): string {
        return leyyo.primitive.string(value);
    }
}
@CastAssign("instance")
@Fqn(...LY_TESTING_FQN)
export class IntegerType implements CastLike<number> {
    cast(value: unknown|number): number {
        return leyyo.primitive.integer(value);
    }
}
@CastAssign("instance")
@CastAlias(Number)
@Fqn(...LY_TESTING_FQN)
export class FloatType implements CastLike<number> {
    cast(value: unknown|number): number {
        return leyyo.primitive.float(value);
    }
}
@CastAssign("instance")
@CastAlias(Boolean)
@Fqn(...LY_TESTING_FQN)
export class BooleanType implements CastLike<boolean> {
    cast(value: unknown|boolean): boolean {
        return leyyo.primitive.boolean(value);
    }
}
@CastAssign("instance")
@Nickname('Unknown', 'Any')
@Fqn(...LY_TESTING_FQN)
export class AnyType implements CastLike {
    cast(value: unknown): unknown {
        return leyyo.primitive.any(value);
    }
}

@GenericsAssign("instance")
@GenericsAlias(Object)
@CastAlias(Object)
@Fqn(...LY_TESTING_FQN)
export class ObjectType<K extends RecKey, V> implements GenericsLike<Record<K, V>> {
    gen(identifier: GenericsAnyIdentifier, value: unknown | Record<K, V>, opt?: GenericsOption): Record<K, V> {
        const tree = leyyo.generics.toTree(identifier);
        // leyyo.json.print('====> MyObject.gen', {tree: tree.toJSON(), value});
        if (tree.children.length < 1) {
            tree.children[0] = {base: 'String'};
            tree.children[1] = {base: 'Unknown'};
        } else if (tree.children.length < 2) {
            tree.children[1] = tree.children[0];
            tree.children[0] = {base: 'String'};
        }
        const obj = this.cast(value) ?? {};
        const result = {} as Record<K, V>;
        let index = 0;
        for (const [k, v] of Object.entries(obj)) {
            const key = leyyo.generics.run(tree.children[0], k) as RecKey;
            if (!leyyo.primitive.isKey(key)) {
                throw new DeveloperException(`Invalid key ${key}`).with(this);
            } else {
                result[key] = leyyo.generics.run(tree.children[1], v) as V;
            }
            index++;
        }
        return result;
    }

    cast(value: unknown | Record<K, V>, opt?: GenericsOption): Record<K, V> {
        return leyyo.primitive.object<V>(value) as Record<K, V>;
    }
}

@GenericsAssign("instance")
@GenericsAlias(Array)
@CastAlias(Array)
@Fqn(...LY_TESTING_FQN)
export class ArrayType implements GenericsLike<ArraySome> {
    cast(value: unknown | ArraySome, opt?: GenericsOption): ArraySome {
        return leyyo.primitive.array(value);
    }

    gen(identifier: GenericsAnyIdentifier, value: unknown | ArraySome, opt?: GenericsOption): ArraySome {
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