# poor-mans-tunes

is a simple audio album collection browser with integrated audio player. 
In more detail, it has the following characteristics and features:
* spa (single page application) based on react and redux (with thunk middleware)
* stylesheets based on bootstrap
* thumbnails as well as artist- and album information are fetched from last.fm (you need your own api key, see: http://www.last.fm/api) and stored in the redux store.
* a simple react based audio player component plays the audio media files
* a simple react and Web Audio API based level meter component shows audio file volume, level and peak information 
* the collection data is provided by a node.js backend in json format
* all audio media and artwork images are provided by a node.js backend in json format 
* at the moment solely tested in development mode (webpack dev server)   
