import {CoreInjector} from "./core-injector";
import {Autowired} from "./autowired";
import {Component} from "./component";
import {DI} from "./di";
import {Injectable} from "./injectable";
import {LazyWired} from "./lazy-wired";
import {Module} from "./module";
import {PostConstruct} from "./post-construct";
import {PostWired} from "./post-wired";
import {Singleton} from "./singleton";
import {AsyncComponent} from "./async-component";

export const $mdl_injector = [CoreInjector,
    AsyncComponent, Autowired, Component, DI, Injectable, LazyWired, Module, PostConstruct, PostWired, Singleton];