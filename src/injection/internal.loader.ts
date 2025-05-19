import {Arr} from "@leyyo/common";
import {InjectionPool} from "./pool";
import {
    AsyncProvider,
    AutoWired,
    BulkProvider,
    Configuration,
    DataSource,
    Inject,
    Injectable,
    LazyInject,
    Loader,
    Module,
    NativeProvider,
    Optional,
    PostConstruct,
    Provider,
    Resource,
    Service
} from "./decorators";

export const $$coreInjectionInternal: Arr = [InjectionPool, AsyncProvider, BulkProvider, DataSource, NativeProvider, Resource,
    Inject, AutoWired,
    Loader, Module,
    Optional,
    PostConstruct, LazyInject,
    Provider, Configuration, Injectable, Service];
