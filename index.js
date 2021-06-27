const {Client,  MessageMedia, ChatTypes}= require('whatsapp-web.js')
const qrcode=require('qrcode-terminal')//rq code generator
const fs=require('fs')// file systerm
const yts= require('yt-search') //yt search

const DownloadYTFile = require('yt-dl-playlist')

//downloader, downloades yt by videoId
const downloader = new DownloadYTFile({ 
    outputPath: "./downloads",
    ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
    maxParallelDownload: 1,
    fileNameGenerator: (videoTitle) => {
      return videoTitle
    }
  })

const SESSION_FILE_PATH = './session.json';
// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    session: sessionData
});

client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

//creating qr code
client.on('qr', (qr) => {
    qrcode.generate(qr,{small: true})
})

//as soon as you scanned and whatsapp web app is linked to your whatsapp web app
client.on('ready',() => {
    console.log('Client Ready')
})

//logging/replying any new incoming msg we get
client.on('message', message => {
    console.log("Most Recent MESSAGE :: "+message.body)
    // message.reply('Hello');
    //making array of the text got
    var msgArr=message.body.split(" ");
    //formatting elements
    msgArr[0]=msgArr[0].toLowerCase();
    for (var i=2;i<msgArr.length;i++){
        msgArr[1]=msgArr[1]+" "+msgArr[i];
    }
    console.log(msgArr)
    if(msgArr[0]=="play" || msgArr[0]=="sing"){
        if(msgArr[1].trim()==null){
            return;
        }
        console.log(msgArr[1]);
        findYtSong(msgArr[1],message);
    }
});

client.initialize();

//function to find the yt song videoID by the name given
async function findYtSong(songName,message){
    const r=  await yts (songName);
    const videos = r.videos.slice( 0, 1 )
    videos.forEach( function ( v ) {
    console.log(v.videoId)
	downloadSong(v.videoId,v.title,message)
})}

//function to download song given and reply
async function downloadSong(videoID,songName,message) {
    console.log("Starting")
    message.reply("Starting Download")
    const download = await downloader.download(videoID, `${videoID}.mp3`);
    console.log("Downloaded")
    const media = MessageMedia.fromFilePath("./downloads/"+videoID+".mp3")
    message.reply(media);
}

