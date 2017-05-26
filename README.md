# poor-mans-tunes

is a simple audio album collection browser with integrated audio player. 
In more detail, it has the following characteristics and features:
* spa (single page application) based on react and redux (with thunk middleware)
* stylesheets based on bootstrap
* thumbnails as well as artist- and album information are fetched from last.fm and stored in the redux store. (you need your own api key, see: http://www.last.fm/api)
* a simple react based audio player component plays the audio media files
* a simple react and Web Audio API based level meter component shows audio file volume, level and peak information 
* the collection data is provided by a node.js backend in json format
* all audio media and artwork images are also provided by the same node.js backend.
* mp3 embedded artwork as well as .jpg and .png image-files are supported. 


# Installation
   
- clone this project
- get a api key for last.fm webservice access (see: http://www.last.fm/api) alternatively disable last.fm access in 'src/config.js'.
- store your last.fm api key in a file 'src/credentials.js' like so: "export const lastFmApi = 'xxx--your-api-key-goes-here--xxx';"
- execute "npm install" in main as well as in backend directory
- execute "npm run build:all" in main directory
- in backend directory execute "npm run serve"
- start your browser and and enter the "localhost:9000" url
- switch to settings tab
- enter the path to your audio files collection root directory
- press the "rescan files" button
- press "reload collection" button after the directory scan has finished

   
