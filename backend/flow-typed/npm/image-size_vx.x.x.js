// flow-typed signature: 9b84ce970e4cdba686efb29ef9911e33
// flow-typed version: <<STUB>>/image-size_v^0.6.1/flow_v0.56.0


declare type imageSize$Dimensions = {
    type: string;
    width: number;
    height: number;
};


type sizeOf = (path: string | Buffer, callback?: (error: ?Error, dim: imageSize$Dimensions)=> void)=> ?imageSize$Dimensions;

declare module 'image-size' {

    declare module.exports: sizeOf
}
