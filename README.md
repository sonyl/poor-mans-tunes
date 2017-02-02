# poor-mans-tunes

is a simple audio album collection browser with integrated audio player. 
In more detail, it has the following characteristics and features:
* spa (single page application) based on react and redux (with thunk middleware)
* stylesheets based on bootstrap
* thumbnails as well as artist- and album information are fetched from last.fm and stored in the redux store.
* a simple react based audio player component plays the audio media files
* a simple react and Web Audio API based level meter component shows audio file volume, level and peak information 
* the collection information needs to be provided in json format (public/files.json)
* all audio media files should be available via http/https (e.g. from your local media server)
* to avoid CORS problems with audio player, the index.html, *.js, *.css and audio media files should be fetched from the same web-server
* in development mode (webpack dev server) this is achieved by a proxy configuration in webpack.config.js  
