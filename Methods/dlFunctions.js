const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs-extra');
const cp = require('child_process');
const readline = require('readline');
const dlImg = require('image-downloader');
const webpConvert = require('webp-converter');



let option = 5;
/*
* 0 es para ver la informacion
* 1 Para descargar audio
* 2 Para descargar video
* 3 Para convertir archivos
* 4 Para unir archivos 
* 5 Para descargar multiples archivos*/

//variables para pruebas
/*let url = 'https://www.youtube.com/watch?v=KXmrlSEODMU&list=RD4ZPqL_2r-tY&index=5';
let shortUrl = 'https://youtu.be/iXoS9Yh0inQ';
let wrongUrl = 'Cualquier cosa';
let ytUrl = 'https://www.youtube.com';
let playList = 'https://www.youtube.com/playlist?list=PLkIOkerdKtNZAhL61FBWy0HHInCpcUkm5';
let videoFormats = ['mp4', 'avi', 'wmv', 'mov', 'mkv'];
let audioFormats = ['mp3', 'wma', 'aac', 'ogg', 'flac'];
let calidades = ['144p', '240p', '360p', '480p', '720p', '720p60', '1080p', '1080p60'];

*/
/*
* TODO: Crear un archivo zip con los archivos que se pudieron descargar, 
* Mostrar un mensaje del estado final de las descargas
* Agregar la opcion de unir imagen con audio
*/
/*switch(option){
    case 0:
        //Prueba de como pedir la informacion del video
        let info = {};
        GetInfo(shortUrl)
        .then(v => {
            //console.log(v);
            //Almacenando los datos
            info.title = v.videoDetails.title;
            info.durationSec = v.videoDetails.lengthSeconds;
            info.category = v.videoDetails.category;
            info.author = v.videoDetails.author.name;
            info.thumbnails = v.videoDetails.thumbnails;
            info.isPrivate = v.videoDetails.isPrivate;
            info.isLiveContent = v.videoDetails.isLiveContent;
            
            //Obteniendo los formatos y calidades de video
            info.AllFormats = v.formats;
            info.qualityLabels = [];
            //Filtrando los formatos y ordenando las calidades
            info.AllFormats.map(x => {
                if(x.container == 'mp4' && x.qualityLabel != null) {
                    info.qualityLabels.push({
                        "itag":x.itag,
                        "quality": x.qualityLabel,
                        "hasAudio": x.hasAudio
                    })
                }
            });

            
        }).catch(e => console.log('Ocurrio un error!, verifica que sea un video'));
        

        break;
    case 1:
        //Ejemplo de descarga de Audio
        let guardar = path.join(__dirname, './dlAudios/');
        let Audio = DlVideoNAudio(url, guardar, audioFormats[0], '');
        Audio.then(v => {
            console.log(v.msg)
        }).catch(e => console.log(e));
        break;
    case 2:
        //Ejemplo para descargar video
        let destino = path.join(__dirname, './dlVideos/');
        let video = DlVideoNAudio(shortUrl, destino, videoFormats[0], calidades[0]);
        video.then(async v => {
            console.log(v.msg);
            let input = `${destino}Audio${v.fileName}.mp4`;
            let output = `${destino}Audio${v.fileName}.mp3`;

            //Convirtiendo audio y uniendo en caso de que esten separados
            await ConvertMedia(input, output).then(async c => {
                console.log(c); //Se convirtieron los archivos
                let videoInput = `${destino}Video${v.fileName}.mp4`;
                let audioInput = `${destino}Audio${v.fileName}.mp3`;
                let videoOutput = `${destino}${v.fileName}.mp4`;

                await  MargeMedia(videoInput, audioInput, videoOutput)
                .then(async m => {
                    console.log(m);
                })
                .catch(e => console.log('Ocurrio un error al unir'));
            })
            .catch(e => console.log('Ocurrio un error al convertir'));
            
        });
        video.catch(e => console.log(e));;

        break;
    case 3:
        //Ejemplo para convertir archivos
        let input = path.join(__dirname, './dlAudios/pista.mp3');
        let output = path.join(__dirname, './dlAudios/pista.aac');
        ConvertMedia(input, output)
        .then(v => console.log(v))
        .catch(e => console.log('Ocurrio un error al convertir'));
        break;
    case 4:
        //Ejemplo para unir audio y video
        let videoInput = path.join(__dirname, './dlVideos/VideoAdam Pearce, OMAS - Pieces (feat. Dani King).mp4');
        let audioInput = path.join(__dirname, './dlVideos/AudioAdam Pearce, OMAS - Pieces (feat. Dani King).mp3');
        let videoOutput = path.join(__dirname, './dlVideos/Adam Pearce, OMAS - Pieces (feat. Dani King).mp4');
        MargeMedia(videoInput, audioInput, videoOutput)
        .then(v => console.log(v))
        .catch(e => console.log('Ocurrio un error al unir'));
        break;
    case 5:
        let save = path.join(__dirname, './dlAudios/');
        let canciones = [
            'https://www.youtube.com/watch?v=RXZ8tYXRNBk&list=RDMMRXZ8tYXRNBk&start_radio=1',
            'ishdsihdishdsidhs',
            'https://www.youtube.com/watch?v=hG2SCu1HXpE&list=RDMMRXZ8tYXRNBk&index=2'
        ];
        isExist = [];
        canciones.map((validate,index) =>{
            if(ytdl.validateURL(validate)) isExist.push(validate);
        })
        MultiFileDownload([], 0, isExist, save, audioFormats[0], '')
        .then(v => console.log(v))
        .catch(e => console.log(e));
        break;

}*/


//Funcion para descargar multiples archivos
function ProcessMultiFileDownload(infor, pos, urls, save, formato, calidad){
    return new Promise(async (resolve, reject)=>{
        var position = pos;
        var informe = infor;
        var sound;

        console.log('Descargando cancion ' + (position + 1));
        sound= DlVideoNAudio(urls[position], save, formato, calidad);

        sound.then(async v => {
            //console.log(v.msg);
            //Agregaremos el informe de la descarga a la var informe para luego mostrarlos
            if(informe == undefined){
                informe = new Array();
            }
            informe.push({
                'Nombre': v.fileName,
                'Descarga completa': true,
                'Error': false
            })
            if(position != urls.length-1){
                position++;
                await MultiFileDownload(informe, position ,urls, save, formato, calidad);
                
            }else if(position >= urls.length-1){
                resolve(informe);
            }

        }).catch(async e => {
            //console.log(e)
            if(informe == undefined){
                informe = new Array();
            }
            informe.push({
                'Nombre': e.fileName,
                'Descarga completa': false,
                'Error': e.msg
            })
            if(position != urls.length-1){
                await MultiFileDownload(informe, position, urls, save, formato, calidad);
                position++;              
            } 
        });
    })
}

async function MultiFileDownload(infor, pos, urls, save, formato, calidad){
    var info = await ProcessMultiFileDownload(infor, pos, urls, save, formato, calidad);
    return info;
}

//Las siguioentes funciones crean una promesa la cual retorna los datos del video ingresado
function ProcessGetInfo(url){
    return new Promise(async (resolve, reject)=>{
        if(await ytdl.validateURL(url)){
            await ytdl.getInfo(url)
            .then(values => {
                resolve(values)
            })
            .catch(e => {
                console.log(e);
                reject(e);
            });
        }else{
            reject('Verifica que sea un video de Youtube');
        }
    })
}

async function GetInfo(url){
    let data = await ProcessGetInfo(url);
    return data;
}

//Variables de estado
const AdlStatus = {
    AudioDl:{
        isComplete: false,
        percentComplete: 0
    },
    fileConvert:{
        isComplete: false,
        percentComplete: 0
    }
}; //Se almacenara los datos de los pasos de cuando se descargue el audio

const VdlStatus = {
    VideoDl:{
        isComplete: false,
        percentComplete: 0
    },
    fileConvert:{
        isComplete: false,
        percentComplete: 0
    }
}
//Las siguientes funciones nos ayudaran a descargar videos y audios
function ProcessDlVideo(url, saveOut, format, quality){
    return new Promise(async (resolve, reject) => {
        let info = {};
        if (format == 'mp4' || format == 'avi' || format == 'wmv' || format == 'mov' || format == 'mkv') {
            if (await ytdl.validateURL(url)) {
                await GetInfo(url)
                .then(async v => {
                        VdlStatus.VideoDl.percentComplete = 0;
                        VdlStatus.fileConvert.percentComplete = 0;
                        //Almacenando los datos
                        info.title = v.videoDetails.title.replaceAll('/', '');
                        info.isPrivate = v.videoDetails.isPrivate;
                        info.isLiveContent = v.videoDetails.isLiveContent;                        
                         
                        //Obteniendo los formatos y calidades de video
                        info.AllFormats = v.formats;
                        info.qualityLabels = [];
                        
                        //Filtrando los formatos y ordenando las calidades
                        info.AllFormats.map(x => {
                            if(x.container == 'mp4' && x.qualityLabel != null) {
                                info.qualityLabels.push({
                                    "itag":x.itag,
                                    "quality": x.qualityLabel
                                })
                            }
                        });

                        //Descargando video
                        //Filtrando calidad
                        let calidad;
                        let hasAudio;
                        info.qualityLabels.map(q =>{
                            if(q.quality == quality) {
                                calidad = q.itag;
                            }
                        });
                        info.AllFormats.map(x =>{
                            if(x.itag == calidad) {
                                hasAudio = x.hasAudio;
                            }
                        })
                        
                        let starttime;
                        let audio;
                        let video;
                        //nos aseguramos que el video tenga audio, de lo contrario lo descargamos
                        if(hasAudio == false){
                            audio = ytdl(url,{quality: 'highestaudio'});
                            audio.pipe(fs.createWriteStream(`${saveOut}Audio${info.title}.mp4`));
                            audio.once('response', () => {
                                console.log('Comenzando la descarga del audio');
                            });
                            audio.on('end', () => {
                                console.log('Se termino la descarga del audio');
                            });
                            video = ytdl(url, {quality: calidad});
                            video.pipe(fs.createWriteStream(`${saveOut}Video${info.title}.mp4`));
                        }else{
                            video = ytdl(url, {quality: calidad});
                            video.pipe(fs.createWriteStream(`${saveOut}${info.title}.mp4`));
                        }
                        
                        video.once('response', () => {
                            starttime = Date.now();
                            console.log('Comenzando la descarga del video');
                        });
                        video.on('progress', (chunkLength, downloaded, total) => {
                            //mostrando el progreso de la descarga por consola
                            const percent = downloaded / total;
                            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                            const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                            /*readline.cursorTo(process.stdout, 0);
                            process.stdout.write(`${(percent * 100).toFixed(2)}% descargado `);
                            process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
                            process.stdout.write(`Trasncurrido: ${downloadedMinutes.toFixed(2)}min`);
                            process.stdout.write(`, Tiempo restante estimado: ${estimatedDownloadTime.toFixed(2)}min `);
                            readline.moveCursor(process.stdout, 0, -1);*/
                            VdlStatus.VideoDl.percentComplete = (percent * 100).toFixed(2);

                        });
                        video.on('end', () => {
                            //console.log('Se termino la descarga');
                            //Se convertira el video en caso el formato sea diferente de mp4
                            VdlStatus.VideoDl.isComplete = true;
                            if(format == 'mp4'){
                                process.stdout.write('\n\n');
                                //Retorno un mensaje y el nombre del archivo para seguir usandolo

                                resolve({
                                    msg: 'Se termino la descarga',
                                    fileName: info.title
                                });
                            }else if(format != 'mp4' && format != '3gp'){
                                //convirtiendo al formato indicado si es diferente a mp4
                                ConvertMedia(`${saveOut}Video${info.title}.mp4`,`${saveOut}${info.title}.${format}`, VdlStatus)
                                .then(c => {
                                    resolve({
                                    msg: 'Se termino la descarga',
                                    fileName: info.title
                                });

                                }).catch(e => reject('Ocurrio un erro al convertir video a otro formato'));
                            }
                        });

                    }).catch(e => {
                        //console.log('Ocurrio un error!, verifica que sea un video');
                        reject({
                            msg: 'Verifica que el link sea un video de Youtube',
                            fileName: info.title
                        });
                    });
            } else {
                reject({
                    msg: 'Verifica que el link sea un video de Youtube',
                    fileName: info.title
                });
            }
        }else if(format == 'mp3' || format == 'wma' || format == 'aac' || format == 'ogg' || format == 'flac'){
            //Proceso de descargar audio
            AdlStatus.AudioDl.percentComplete = 0;
            AdlStatus.fileConvert.percentComplete = 0;
            if(await ytdl.validateURL(url)){
                await GetInfo(url)
                .then(v =>{
                    //Almacenando los datos
                    info.title = v.videoDetails.title.replaceAll('/', '');
                    info.isPrivate = v.videoDetails.isPrivate;
                    info.isLiveContent = v.videoDetails.isLiveContent;
                    info.thumbnails = v.videoDetails.thumbnails;
                    
                    //Descargando audio
                    let starttime;
                    let audio = ytdl(url,{quality: 'highestaudio'});
                    audio.pipe(fs.createWriteStream(`${saveOut}Audio${info.title}.mp4`));
                    audio.once('response', () => {
                        starttime = Date.now();
                        console.log('Comenzando la descarga del video');
                    });
                    audio.on('progress', (chunkLength, downloaded, total) => {
                        //mostrando el progreso de la descarga por consola
                        const percent = downloaded / total;
                        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
                        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
                        /*readline.cursorTo(process.stdout, 0);
                        process.stdout.write(`${(percent * 100).toFixed(2)}% descargado `);
                        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
                        process.stdout.write(`Trasncurrido: ${downloadedMinutes.toFixed(2)}min`);
                        process.stdout.write(`, Tiempo restante estimado: ${estimatedDownloadTime.toFixed(2)}min `);
                        readline.moveCursor(process.stdout, 0, -1);*/
                        //Añadiendo la informacion de estado de la descarga
                        AdlStatus.AudioDl.percentComplete = (percent * 100).toFixed(2);
                        
                    });
                    audio.on('end', () => {
                        //console.log('Se termino la descarga');
                        //Añadiendo informacion de estado de descarga
                        AdlStatus.AudioDl.isComplete = true;

                        if (format == 'mp3') {
                            ConvertMedia(`${saveOut}Audio${info.title}.mp4`, `${saveOut}Audio${info.title}.${format}`, AdlStatus)
                            .then(async c => {
                                console.log('Añadiendo la imagen');
                                //Descargando la imagen para luego agregarla
                                let optionsImg = {
                                    url: info.thumbnails[info.thumbnails.length - 1].url,
                                    dest: `${saveOut}${info.title.replaceAll(' ', '')}.webp`              // will be saved to /path/to/dest/image.jpg
                                }
                                
                               await dlImg.image(optionsImg)
                                .then(async ({ filename }) => {
                                    console.log('Se guardo la imagen');

                                   await webpConvert.dwebp(`${filename.replaceAll(' ','')}`, `${filename.replace('.webp', '.jpg').replaceAll(' ','')}`, "-o", logging = "-v")
                                    .then(save => {
                                        console.log('Se convirtio la imagen');

                                        if(fs.existsSync(`${filename.replace('.webp', '.jpg').replaceAll(' ','')}`)){
                                            //ffmpeg -i input.mp3 -i cover.jpg -map_metadata 0 -map 0 -map 1 output.mp3
                                            cp.spawn('ffmpeg',
                                            ['-i', 
                                            `${saveOut}Audio${info.title}.${format}`, 
                                            '-i',`${filename.replace('.webp', '.jpg')}`, 
                                            '-map_metadata', '0', '-map', '0', 
                                            '-map', '1', `${saveOut}${info.title}.${format}`])
                                            .on('close',()=>{
                                                console.log('Se añadio la imagen a la pista');
                                                if(fs.existsSync(`${saveOut}Audio${info.title}.${format}`)){
                                                    fs.unlink(`${saveOut}Audio${info.title}.${format}`)
                                                    if (fs.existsSync(filename)) {
                                                        fs.unlink(filename);
                                                    }
                                                }
                                                if(fs.existsSync(`${filename.replace('.webp', '.jpg').replaceAll(' ','')}`)){
                                                    fs.unlink(`${filename.replace('.webp', '.jpg').replaceAll(' ','')}`)
                                                }
                                                resolve({
                                                    msg: 'Se termino la descarga',
                                                    fileName: info.title
                                                })
                                            })
                                        }else{
                                            fs.rename(`${saveOut}Audio${info.title}.${format}`,`${saveOut}${info.title}.${format}`);
                                            if(fs.existsSync(`${filename.replaceAll(' ','')}`)){
                                                fs.unlink(`${filename.replaceAll(' ','')}`)
                                            }
                                            resolve({
                                                msg: 'Se termino la descarga',
                                                fileName: info.title
                                            })
                                        }
                                                                                
                                    })
                                    .catch((err) => reject('Ocurrio un error al descargar la imagen ' + err))
                                
                                }).catch(e => reject('No se pudo descargar la imagen ' + e))

                            }).catch(e => reject('Ocurrio un erro al convertir video a otro formato'));
                            //Se añadira una imagen de portada al archivo de audio
                            /* */
                            
                        } else {
                            ConvertMedia(`${saveOut}Audio${info.title}.mp4`, `${saveOut}${info.title}.${format}`, AdlStatus)
                            .then(c => {
                                resolve({
                                    msg: 'Se termino la descarga',
                                    fileName: info.title
                                });

                            }).catch(e => reject('Ocurrio un erro al convertir video a otro formato'));
                        }
                        
                    });
                        
                })
                .catch(e => {
                    reject({
                        msg: 'Verifica que el link sea un video de Youtube',
                        fileName: info.title
                    });
                });
            }
        } 
        else {
            //console.log('Formato no reconocido');
            reject({
                msg: 'Formato no reconocido',
                fileName: 'Sin nombre'
            });
        }
    })
}

async function DlVideoNAudio(url, saveOut, format, quality){
    let data = await ProcessDlVideo(url, saveOut, format, quality);
    return data;
}

//Las siguientes funciones se encargaran de convertir los archivos
let convertInfo ={totalTime:0, currentTime:0, percent:0};
function ProcessesConvertMedia(inputPath, outputPath, saveStatus){
    return new Promise(async (resolve, reject) =>{
        //-i input.mp4 output.avi
        //Reiniciando variables
        convertInfo.totalTime = 0;
        convertInfo.currentTime = 0;
        convertInfo.percent = 0;

        console.log('Se convertiran los archivos');
        saveStatus.fileConvert.percentComplete = 0;
        saveStatus.fileConvert.isComplete = false;
        let DurationText;
        let CurrentTimeText;
       let convert = cp.spawn('ffmpeg', ['-i', inputPath, outputPath]);
       convert.on('error', (error)=>{
           console.log('Hubo un error ' +error);
       })
       
       convert.stderr.on('data', (chunk)=>{
           if(chunk.toString().includes("Duration")){
               DurationText = chunk.toString().substr(chunk.toString().indexOf("Duration")+10, 11);
               convertInfo.totalTime = convertTextToTime(DurationText);
           }
           if(chunk.toString().includes("time=")){
               CurrentTimeText = chunk.toString().substr(chunk.toString().indexOf("time") + 5,11);
               convertInfo.currentTime = convertTextToTime(CurrentTimeText);
           }
           convertInfo.percent = (convertInfo.currentTime * 100) / convertInfo.totalTime;
           //añadiendo informacion de estado de la conversion
           //console.log(convertInfo.percent + "% Convertido");
           saveStatus.fileConvert.percentComplete = convertInfo.percent.toFixed(2);
       })
       convert.on('close', (code) => {
            if(fs.existsSync(inputPath)){
                fs.unlink(inputPath).then(v =>{
                    console.log('Se elimino el archivo luego de convertir');
                    saveStatus.fileConvert.isComplete = true;
                    resolve('Se convirtieron los archivos');
                })
            }else{
                resolve('Se convirtieron los archivos');
                saveStatus.fileConvert.isComplete = true;
            }
      });
    })
}

//Funcion que convierte tiempo en texto a milisegundos
function convertTextToTime(time){
    let hours = parseInt(time.substring(0,2));
    let minutes = parseInt(time.substring(3,5));
    let seconds = parseFloat(time.substr(6));
    let timeMs = 0;
        
    timeMs += hours * 3.6e6;
    timeMs += minutes * 60000;
    timeMs += seconds * 1000;

    return timeMs;
}

async function ConvertMedia(inputPath, outputPath, saveStatus){
    let data = await ProcessesConvertMedia(inputPath, outputPath, saveStatus);
    return data;
}

//Las siguientes funciones se encargan de unir audio con video
function ProcessesMargeMedia(videoInput, audioInput, output){
    return new Promise(async (resolve, reject) =>{
        //ffmpeg -i video.mp4 -i audio.m4a -c:v copy -c:a copy output.mp4
        console.log('Uniendo archivos');
        cp.spawn('ffmpeg', ['-i', videoInput, '-i', audioInput, '-c:v', 'copy', '-c:a', 'copy', output])
        .once('close', () =>{
            fs.unlink(videoInput).then(v =>{
                if(fs.existsSync(audioInput)){
                    fs.unlink(audioInput).then(v =>{
                        console.log('Se elimino el archivo luego de unir');
                        resolve('Se unieron los archivos');
                    })
                }else{
                    resolve('Se unieron los archivos');
                }
            })
        })
    })
}

async function MargeMedia(videoInput, audioInput, output){
    let data = await ProcessesMargeMedia(videoInput, audioInput, output);
    return data;
}

module.exports = {
    MargeMedia, 
    GetInfo, 
    DlVideoNAudio, 
    ConvertMedia, 
    MultiFileDownload, 
    AdlStatus,
    VdlStatus
} 