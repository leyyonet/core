import {GenericsTree} from "../generics-tree";

export const gen1text = 'array<object<string, array<string>>>';
export const gen1TextFormatted = 'Array<Object<String,Array<String>>>';
export const gen1Tree = new GenericsTree('Array',
    new GenericsTree('Object',
        new GenericsTree('String'),
        new GenericsTree('Array',
            new GenericsTree('String')
        )
    )
);
