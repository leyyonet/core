import {
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
@Fqn(...LY_TESTING_FQN)
export class MyKey2 implements CastLike<string> {
    cast(value: unknown|string): string {
        return leyyo.primitive.string(value);
    }
}
@CastAssign("instance")
@Fqn(...LY_TESTING_FQN)
export class MyValue2 implements CastLike<string> {
    cast(value: unknown|string): string {
        return leyyo.primitive.string(value);
    }
}

@GenericsAssign("instance")
@Nickname('nicknameObject2')
@GenericsAlias(Object)
@Fqn(...LY_TESTING_FQN)
export class MyObject2<K extends RecKey, V> implements GenericsLike<Record<K, V>> {
    gen(identifier: GenericsAnyIdentifier, value: unknown | Record<K, V>, opt?: GenericsOption): Record<K, V> {
        const tree = leyyo.generics.toTree(identifier);
        // leyyo.json.print('====> MyObject.gen', {tree: tree.toJSON(), value});
        if (tree.children.length < 1) {
            tree.children[0] = {base: 'MyKey2'};
            tree.children[1] = {base: 'MyValue2'};
        } else if (tree.children.length < 2) {
            tree.children[1] = tree.children[0];
            tree.children[0] = {base: 'MyKey2'};
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