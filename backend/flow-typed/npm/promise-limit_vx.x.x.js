// flow-typed signature: 220f2e79491dbfcb0329686f7feb83b6
// flow-typed version: <<STUB>>/promise-limit_v^2.4.0/flow_v0.57.3


type limit<T> = (()=> Promise<T>)=> Promise<T>;
declare function PromiseLimit$Function<T>(number): limit<T>;

declare module 'promise-limit' {

    declare export default typeof PromiseLimit$Function;
}