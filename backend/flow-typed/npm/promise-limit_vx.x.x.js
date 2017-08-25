// flow-typed signature: f994c5ff090fafa9234c5e3470c44381
// flow-typed version: <<STUB>>/promise-limit_v^2.4.0/flow_v0.51.0


type limit<T> = (()=> Promise<T>)=> Promise<T>;
declare function PromiseLimit$Function<T>(number): limit<T>;

declare module 'promise-limit' {

  declare export default typeof PromiseLimit$Function;
}

