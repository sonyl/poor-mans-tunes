// flow-typed signature: 6afbb30be8618a83f4ade75547921c95
// flow-typed version: <<STUB>>/promise-limit_v^2.4.0/flow_v0.56.0


type limit<T> = (()=> Promise<T>)=> Promise<T>;
declare function PromiseLimit$Function<T>(number): limit<T>;

declare module 'promise-limit' {

    declare export default typeof PromiseLimit$Function;
}