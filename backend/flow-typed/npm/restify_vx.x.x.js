// flow-typed signature: 03f61e9d109caafb5df199301228849b
// flow-typed version: <<STUB>>/restify_v^5.0.0/flow_v0.51.0


declare class restify$RequestResponseBase {
}

declare class restify$Request extends http$IncomingMessage mixins restify$RequestResponseBase {
    body: any;
    log: any;
    params(name: string, defaultValue?: string): string | void;
}

declare class restify$Response extends http$ServerResponse mixins restify$RequestResponseBase {
    json(body: mixed): this;
    json(status?: number, body?: mixed): this;
    send(body?: mixed): void;
    header(string, string): void;
}

declare type restify$Middleware =
    ((req: restify$Request, res: restify$Response, next: restify$NextFunction) => mixed) |
    ((error: ?Error, req: restify$Request, res: restify$Response, next: restify$NextFunction) => mixed);

declare interface restify$RouteMethodType<T> {
    (middleware: restify$Middleware): T;
    (...middleware: Array<express$Middleware>): T;
    (path: string|RegExp|string[], ...middleware: Array<express$Middleware>): T;
}

declare class restify$Server {
    name: string;
    url: string;
    pre: (any)=> void;
    on: (string, any)=> void;
    use(any): void;
    get: restify$RouteMethodType<this>;
    post: restify$RouteMethodType<this>;
    put: restify$RouteMethodType<this>;
    del: restify$RouteMethodType<this>;
    listen(port: number, callback?: (err?: ?Error) => mixed): void;
}

declare class restify$Application {
    bunyan: any;
    createServer({}): restify$Server;
}

declare type restify$NextFunction = (err?: ?Error | 'route') => mixed;

declare module 'restify' {
    declare export type NextFunction = restify$NextFunction;
    declare export type $Response = restify$Response;
    declare export type $Request = restify$Request;
    declare export type $Application = restify$Application;


    declare module.exports: restify$Application
}
