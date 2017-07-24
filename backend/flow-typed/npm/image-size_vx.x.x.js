// flow-typed signature: 391d316459a3519782bf9c83ede70a77
// flow-typed version: <<STUB>>/image-size_v^0.6.0/flow_v0.51.0


declare type imageSize$Dimensions = {
    type: string;
    width: number;
    height: number;
};


type sizeOf = (path: string | Buffer, callback?: (error: ?Error, dim: imageSize$Dimensions)=> void)=> ?imageSize$Dimensions;

declare module 'image-size' {

    declare module.exports: sizeOf
}


