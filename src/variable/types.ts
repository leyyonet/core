export interface VariableItem<T = unknown> {
    target: string;

    parser(v: unknown): T;

    required?: boolean;
    log?: boolean;
    def?: T;
}

export interface CoreVariableLike {
    getNames(): Array<string>;

    get(name: string): VariableItem;

    read<T>(name: string, variable: VariableItem<T>): T;
}