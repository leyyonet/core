import {FQN_PCK} from "./internal";
import {CoreResourceItems} from "../core";
import {InjectionPool} from "./pool";
import {
    AsyncProvider,
    AutoWired,
    Configuration,
    DataSource,
    Inject,
    Injectable,
    LazyInject,
    Loader,
    Module,
    Optional,
    PostConstruct,
    Provider,
    Resource,
    Service
} from "./decorators";


export const injectionResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [InjectionPool],
    functions: [AsyncProvider, DataSource, Resource, // async
        Inject, AutoWired,
        Loader, Module,
        Optional,
        PostConstruct, LazyInject,
        Provider, Injectable, Service, Configuration],
    literals: []
};