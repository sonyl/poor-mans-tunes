// flow-typed signature: f994c5ff090fafa9234c5e3470c44381
// flow-typed version: <<STUB>>/promise-limit_v^2.4.0/flow_v0.51.0


type Limit = (()=> Promise<T>)=> Promise<T>;
type PromiseLimit = (number)=> Limit;

declare module 'promise-limit' {
  declare module.exports: PromiseLimit;
}

