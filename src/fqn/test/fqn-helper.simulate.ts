// noinspection JSUnusedGlobalSymbols

import {strict as assert} from "assert";
import {FqnType, FuncLike, leyyo, LY_TESTING_NS} from "../../index";

export type FqnGetterValue = [unknown, string, boolean?];

export function checkFootprint(describe: FuncLike, it: FuncLike, title: string, value: unknown, name: string, stereotype?: FqnType, origin?: string): void {
    describe(title, () => {
        const footprint = leyyo.fqn.getFootprint(value);
        it('name', () => {
            assert.equal(footprint?.name, name);
        });
        if (stereotype) {
            it('stereotype', () => {
                assert.equal(footprint?.stereotype, stereotype);
            });
        }
        if (origin) {
            it('origin', () => {
                assert.equal(footprint?.origin, origin);
            });
        }
    });
}
export function checkGetter(describe: FuncLike, it: FuncLike, title: string, holder: unknown, field: string, isInstance: boolean, name: string, stereotype?: FqnType, origin?: string): void {
    describe(title, () => {
        const footprint = leyyo.fqn.getterFootprint(holder, field);
        it('name', () => {
            assert.equal(footprint?.name, name);
        });
        if (stereotype) {
            it('stereotype', () => {
                assert.equal(footprint?.stereotype, stereotype);
            });
        }
        if (origin) {
            it('origin', () => {
                assert.equal(footprint?.origin, origin);
            });
        }
    });
}
export function testTag(tags: Array<string>): string {
    return tags.length > 0 ? ' ' + tags.map(tag => `#${tag}`).join(' ') : '';
}
export function testFootprint(describe: FuncLike, it: FuncLike, value: unknown, name: string, prefix: string, origin: string, stereotype: FqnType, ...tags: Array<string>): void {
    prefix = prefix ? `.${prefix}` : '';
    let code = name;
    if (code.includes('.')) {
        code = code.split('.').pop();
    }
    checkFootprint(describe, it, code + testTag(tags), value, `${LY_TESTING_NS}${prefix}.${name}`, stereotype, origin);
}
export function testGetter(describe: FuncLike, it: FuncLike, pair: FqnGetterValue, name: string, prefix: string, origin: string, stereotype: FqnType, ...tags: Array<string>): void {
    prefix = prefix ? `.${prefix}` : '';
    let code = name;
    if (code.includes('.')) {
        code = code.split('.').pop();
    }
    checkGetter(describe, it, code + testTag(tags), pair[0], pair[1], pair[2], `${LY_TESTING_NS}${prefix}.${name}`, stereotype, origin);
}
export function testClassRoot(describe: FuncLike, it: FuncLike, clazz: unknown, name: string, prefix: string, ...tags: Array<string>) {
    testFootprint(describe, it, clazz, name, prefix, 'class-regular', 'class', ...tags);
}
export function testClassInherited(describe: FuncLike, it: FuncLike, clazz: unknown, name: string, prefix: string, ...tags: Array<string>) {
    testFootprint(describe, it, clazz, name, prefix, 'class-inherited', 'class', ...tags);
}
export function testClassAnonymous(describe: FuncLike, it: FuncLike, clazz: unknown, name: string, prefix: string, ...tags: Array<string>) {
    testFootprint(describe, it, clazz, name, prefix, 'class-anonymous', 'class', ...tags);
}
export function testMethodInstance(describe: FuncLike, it: FuncLike, pair: FqnGetterValue, name: string, prefix: string, ...tags: Array<string>): void {
    const holder = pair ? pair[0] : undefined;
    const member = pair ? pair[1] : undefined;
    testFootprint(describe, it, holder ? holder[member] : undefined, name, prefix, 'method-instance', 'method', ...tags);
}
export function testMethodStatic(describe: FuncLike, it: FuncLike, pair: FqnGetterValue, name: string, prefix: string, ...tags: Array<string>): void {
    const holder = pair ? pair[0] : undefined;
    const member = pair ? pair[1] : undefined;
    testFootprint(describe, it, holder ? holder[member] : undefined, name, prefix, 'method-static', 'method', ...tags);
}
export function testGetterInstance(describe: FuncLike, it: FuncLike, pair: FqnGetterValue, name: string, prefix: string, ...tags: Array<string>): void {
    pair[2] = true;
    testGetter(describe, it, pair, name, prefix, 'getter-instance', 'getter', ...tags);
}
export function testGetterStatic(describe: FuncLike, it: FuncLike, pair: FqnGetterValue, name: string, prefix: string, ...tags: Array<string>): void {
    pair[2] = false;
    testFootprint(describe, it, pair, name, prefix, 'getter-static', 'getter', ...tags);
}

const staticMap = {
    staticMethod: testMethodStatic,
    staticArrow: testMethodStatic,
    // staticGet: testGetterStatic,
}
const instanceMap = {
    instanceMethod: testMethodInstance,
    // instanceArrow: testMethodInstance,
    // instanceGet: testGetterInstance,
}
export function testAbstractClass(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassRoot(describe, it, clazz, 'AbstractClass', prefix);
    for (const [k, lambda] of Object.entries(staticMap)) {
        lambda(describe, it, [clazz, `${k}1`], `AbstractClass.${k}1`, prefix);
        lambda(describe, it, [clazz, `${k}2`], `AbstractClass.${k}2`, prefix);
    }
}
export function testBaseClass(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassInherited(describe, it, clazz, 'BaseClass', prefix);
    for (const [k, lambda] of Object.entries(staticMap)) {
        lambda(describe, it, [clazz, `${k}1`], `AbstractClass.${k}1`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}2`], `BaseClass.${k}2`, prefix, 'overridden');
        lambda(describe, it, [clazz, `${k}3`], `BaseClass.${k}3`, prefix);
    }
}
export function testBaseClassInstance(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassInherited(describe, it, clazz, 'BaseClass', prefix);
    for (const [k, lambda] of Object.entries(instanceMap)) {
        lambda(describe, it, [clazz, `${k}1`], `AbstractClass.${k}1`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}2`], `BaseClass.${k}2`, prefix, 'overridden');
        lambda(describe, it, [clazz, `${k}3`], `BaseClass.${k}3`, prefix);
    }
}

export function testInheritedClass(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassInherited(describe, it, clazz, 'InheritedClass', prefix);
    for (const [k, lambda] of Object.entries(staticMap)) {
        lambda(describe, it, [clazz, `${k}1`], `AbstractClass.${k}1`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}2`], `BaseClass.${k}2`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}3`], `InheritedClass.${k}3`, prefix, 'overridden');
        lambda(describe, it, [clazz, `${k}4`], `InheritedClass.${k}4`, prefix);
    }
}
export function testInheritedClassInstance(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassInherited(describe, it, clazz, 'InheritedClass', prefix);
    for (const [k, lambda] of Object.entries(instanceMap)) {
        lambda(describe, it, [clazz, `${k}1`], `AbstractClass.${k}1`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}2`], `BaseClass.${k}2`, prefix, 'inherited');
        lambda(describe, it, [clazz, `${k}3`], `InheritedClass.${k}3`, prefix, 'overridden');
        lambda(describe, it, [clazz, `${k}4`], `InheritedClass.${k}4`, prefix);
    }
}
export function testAnonymousClass(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassAnonymous(describe, it, clazz, 'AnonymousClass', prefix);
    // for (const [k, lambda] of Object.entries(staticMap)) {
    //     lambda(describe, it, [clazz, `${k}5`], `AnonymousClass.${k}5`, prefix);
    // }
}
export function testAnonymousClassInstance(describe: FuncLike, it: FuncLike, clazz: unknown, prefix: string): void {
    testClassAnonymous(describe, it, clazz, 'AnonymousClass', prefix);
    // for (const [k, lambda] of Object.entries(instanceMap)) {
    //     lambda(describe, it, [clazz, `${k}5`], `AnonymousClass.${k}5`, prefix);
    // }
}