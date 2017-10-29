// flow-typed signature: b7539c3c11dd8d21a18ec5e7734b838e
// flow-typed version: <<STUB>>/image-size_v^0.6.1/flow_v0.57.3


declare type imageSize$Dimensions = {
    type: string;
    width: number;
    height: number;
};


type sizeOf = (path: string | Buffer, callback?: (error: ?Error, dim: imageSize$Dimensions)=> void)=> ?imageSize$Dimensions;

declare module 'image-size' {

    declare module.exports: sizeOf
}
