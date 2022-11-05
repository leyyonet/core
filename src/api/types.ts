import {FieldType} from "./enums";
import {Func0, RecKey, RecLike} from "../common";

export interface ApiSchemaLike extends RecLike {
    $ref?: string;
    type?: FieldType;
    name?: string;
    title?: string;
    default?: unknown;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: Array<string>;
    not?: ApiSchemaLike;
    properties?: RecLike<ApiSchemaLike>;
    additionalProperties?: ApiAdditionalPropertiesLike;
    description?: string;
    format?: string;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    example?: unknown;
    externalDocs?: unknown;
    deprecated?: boolean;
    xml?: RecLike;
    enum?: Array<RecKey>;
    discriminator?: RecLike;
    items?: ApiSchemaLike; // for only array
    allOf?: Array<ApiSchemaLike>; // for only composed
    anyOf?: Array<ApiSchemaLike>; // for only composed
    oneOf?: Array<ApiSchemaLike>; // for only composed
}
export type ApiAdditionalPropertiesLike = boolean | ApiSchemaLike;

export interface CoreApiLike {
    none(): void
}
export interface CoreCallLike<C = RecLike, Q = RecLike, S = RecLike, A = RecLike, N = Func0> extends RecLike {
    ctx: C;
    req: Q;
    res: S;
    app?: A;
    next?: N;
}