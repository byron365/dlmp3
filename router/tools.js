const express = require('express');
const path = require('path');
const router = express.Router();
const dlFunctions = require('../Methods/dlFunctions');
const fs = require('fs-extra');
const multer = require('multer');
const cleanUp = require('../Methods/CleanUp');
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage }).single('file');

//Rutas para servir frontend
router.get('/yttoaudio', (req,res)=>{
    
    res.render('ytDownload',{'toolTitle':'Youtube to Audio', 'isVideoTool':false})
})

router.get('/yttovideo', (req,res)=>{
    res.render('ytDownload',{'toolTitle':'Youtube to Video', 'isVideoTool':true})
})

router.get('/videotoaudio', (req, res)=>{
    res.render('fileConvert', {'toolTitle': 'Video to Audio', 'isVideoTool':false});
})

router.get('/videotovideo', (req, res)=>{
    res.render('fileConvert', {'toolTitle': 'Video to Video'});
})

router.get('/audiotoaudio', (req, res)=>{
    res.render('fileConvert', {'toolTitle': 'Audio to Audio'});
})

//Ruta para enviar informacion del video apartir de la url
router.post('/getinfo', async (req, res)=>{
    let info = {}
    let errors = [];
    let {url} = req.body;
    console.log(url);

    await dlFunctions.GetInfo(url)
    .then(data =>{
        //Organizando informacion
        info.title = data.videoDetails.title.replaceAll('/', '');
        info.durationSec = data.videoDetails.lengthSeconds;
        info.category = data.videoDetails.category;
        info.author = data.videoDetails.author.name;
        info.thumbnails = data.videoDetails.thumbnails;
        info.isPrivate = data.videoDetails.isPrivate;
        info.isLiveContent = data.videoDetails.isLiveContent;
        
        //Obteniendo los formatos y calidades de video
        info.AllFormats = data.formats;
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
        })
    }).catch(e => {
        if(e.statusCode){
            if(e.statusCode == 410){
                errors.push({error: "Video isn't available!"})
            }
        }
        else{
            if(e.toString().includes('This is a private video.')){
                errors.push({error: "This is a private video!"})
            }else{
                errors.push({error:e})
            }
            
        }
    });

    //Enviando informacion o errores
    if(errors.length == 0){
        res.json({info})
    }else{
        res.json({errors})
    }
    
})

//Ruta para Procesar el audio
router.post('/dlAudio', async (req, res) =>{
    //let errors = [{error:'Hubo un error'}];
    let errors = [];
    let data ={};
    let {url, format, isLiveContent} = req.body;
    data.url = url;
    data.format = format;

    //Descargando cancion
    let dir = path.join(__dirname, '../dlAudios/');
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    var y;
    
    //Comprobando si el achivo existe
    await dlFunctions.GetInfo(url).then(async info =>{
        
        if(!fs.existsSync(`${dir}/${info.videoDetails.title.replaceAll('/', '')}.${format}`)){
            if(isLiveContent){
                errors.push({error: 'Is a Live \nWhen the live ends, you can download it <a href="/tools/yttoaudio">Try other</a>'})
            }else{
                //Estado de la descarga
                y = setInterval(()=>{
                    if(!dlFunctions.AdlStatus.AudioDl.isComplete){
                        console.log(dlFunctions.AdlStatus.AudioDl.percentComplete + "% descargado");
                    }else{
                        console.log('Se completo la descarga del audio');
                        if(!dlFunctions.AdlStatus.fileConvert.isComplete){
                            console.log(dlFunctions.AdlStatus.fileConvert.percentComplete + "% convertido");
                        }else{
                            console.log('Se completo la conversion del audio');
                        }
                    }
        
                    if(dlFunctions.AdlStatus.AudioDl.isComplete == true && dlFunctions.AdlStatus.fileConvert.isComplete == true){
                        clearInterval(y);
                    }
                },200)
                await dlFunctions.DlVideoNAudio(url, dir, format, '')
                .then(v =>{
                    console.log(v.msg)
                    data.name = v.fileName.replaceAll('/', '');
                }).catch(e => errors.push({error:e}));
            }
        }else{
            console.log('Archivo existente');
            data.name = info.videoDetails.title.replaceAll('/', '');
        }
    })

    //Enviando informacion o errores
    if(errors.length == 0){
        clearInterval(y);
        dlFunctions.AdlStatus.AudioDl.isComplete = false;
        dlFunctions.AdlStatus.fileConvert.isComplete = false;
        res.json(data)
    }else{
        res.json({errors})
    }
})

//Ruta para Procesar el video
router.post('/dlVideo', async (req, res) =>{
    //let errors = [{error:'Hubo un error'}];
    let errors = [];
    let data ={};
    let {url, format, isLiveContent, calidad} = req.body;
    data.url = url;
    data.format = format;
    let destino = path.join(__dirname, '../dlVideos/');
    if(!fs.existsSync(destino)){
        fs.mkdirSync(destino);
    }

    //Comprobando si el achivo existe
    await dlFunctions.GetInfo(url).then(async info =>{
        
        if(!fs.existsSync(`${destino}/${info.videoDetails.title.replaceAll('/', '')}.${format}`)){
            //Descargando video
            if(isLiveContent){
                errors.push({error: 'Is a Live \nWhen the live ends, you can download it <a href="/tools/yttovideo">Try other</a>'})
            }else{
                //Estado de la descarga
                y = setInterval(()=>{
                    if(!dlFunctions.VdlStatus.VideoDl.isComplete){
                        console.log(dlFunctions.VdlStatus.VideoDl.percentComplete + "% descargado");
                    }else{
                        console.log('Se completo la descarga del audio');
                        if(!dlFunctions.VdlStatus.fileConvert.isComplete){
                            console.log(dlFunctions.VdlStatus.fileConvert.percentComplete + "% convertido");
                        }else{
                            console.log('Se completo la conversion del audio');
                        }
                    }

                    if(dlFunctions.VdlStatus.VideoDl.isComplete == true && dlFunctions.AdlStatus.fileConvert.isComplete == true){
                        clearInterval(y);
                    }
                },200)

                await dlFunctions.DlVideoNAudio(url, destino, format, calidad)
                .then(async v => {
                    console.log(v.msg);
                    data.name = v.fileName.replaceAll('/', '');
                    let input = `${destino}Audio${v.fileName}.mp4`;
                    let output = `${destino}Audio${v.fileName}.mp3`;

                    //Convirtiendo audio y uniendo en caso de que esten separados
                    await dlFunctions.ConvertMedia(input, output, dlFunctions.VdlStatus).then(async c => {
                        console.log(c); //Se convirtieron los archivos
                        if(fs.existsSync(`${destino}${v.fileName}.${format}`)){
                            fs.rename(`${destino}${v.fileName}.${format}`,`${destino}Video${v.fileName}.${format}`)
                        }
                        let videoInput = `${destino}Video${v.fileName}.${format}`;
                        let audioInput = `${destino}Audio${v.fileName}.mp3`;
                        let videoOutput = `${destino}${v.fileName}.${format}`;

                        await  dlFunctions.MargeMedia(videoInput, audioInput, videoOutput)
                        .then(async m => {
                            console.log(m);
                        })
                        .catch(e => errors.push({error:'Ocurrio un error al descargar el video'}));
                    })
                    .catch(e => errors.push({error:'Ocurrio un error al descargar el video'}));
                    
                })
                .catch(e => console.log(e));
            }
            
        }else{
            console.log('Archivo existente');
            data.name = info.videoDetails.title.replaceAll('/', '');
        }
    })
    
    //Enviando informacion o errores
    if(errors.length == 0){
        clearInterval(y);
        dlFunctions.VdlStatus.VideoDl.isComplete = false;
        dlFunctions.VdlStatus.fileConvert.isComplete = false;
        res.json(data)
    }else{
        res.json({errors})
    }
    
})

//Ruta para subir archivos para la conversion
router.post('/uploadfile', async (req, res)=>{
    let format;
    let originalname;
    let input;
    dest = path.join(__dirname, '../convertFiles/');
    let errors = [] ;
    let data = {}
    let filename;

    //Procesando el archivo
    await upload(req, res, err=>{
        if(err instanceof multer.MulterError){
            //Ocurrio un error con multer
            errors.push("Ocurrio un error al subir el archivo");
        }else if(err){
            //Ocurrio un error desconocido
            errors.push('Ocurrio un error desconocido')
        }

        format = req.body.format;
        originalname = req.file.originalname;
        input = req.file.path;
        filename = req.file.filename;
        //Reuniendo datos
        data.format = format;
        data.originalname = originalname.replace(path.extname(originalname),'');
        data.id = filename;

        console.log(req.file);

        if(errors.length > 0){
            //Hay errores
            res.json({error:errors});
        }else{
            //no hay errores 
            res.json(data);
        }

    })
})

//Ruta para procesar la conversion
router.post('/convertfile', async (req, res)=>{
    let {format, originalname, id} = req.body;
    let input = path.join(__dirname, '../uploads/'+id);
    let dest = path.join(__dirname, `../convertFiles/${originalname}.${format}`);
    let errors = [];
    const convertStatus = {
        fileConvert:{
            isComplete: false,
            percentComplete: 0
        }
    }
    let y;

    console.log(req.body);
    //Estado de la conversion
    if(format && originalname && id){
        y = setInterval(()=>{
            if(!convertStatus.fileConvert.isComplete){
                console.log(convertStatus.fileConvert.percentComplete + "% convertido");
            }else{
                console.log('Se completo la conversion del archivo');
            }
    
            if(convertStatus.fileConvert.isComplete == true){
                clearInterval(y);
            }
        },200)
        console.log(originalname)
        //mostrando progreso
        
        //Convirtiendo archivo
        await dlFunctions.ConvertMedia(input, dest, convertStatus)
        .then(v=>{
            console.log(v);
            if(fs.existsSync(input)){
                fs.unlink(input);
            }
        }).catch(err=>{
            errors.push("Ocurrio un error al convertir el archivo");
        })
    }else{
        //Los datos no existen codigo de error 22
        errors.push("Something went wrong! (Error-code 22)")

    }

    //Sirviendo archivo
    if(errors.length > 0){
        //Hay errores
        res.json({error: errors})
        clearInterval(y);
        convertStatus.fileConvert.percentComplete = 0;
    }else{
        //No hay errores
        convertStatus.fileConvert.percentComplete = 0;
        res.json({format, originalname, id})
    }
})

//Ruta para descargar el archivo
router.get('/downloadFile/:name/:format/:isVideo/:isConvertFile', (req,res)=>{
    let {format, name, isVideo,isConvertFile} = req.params;
    let dir;
    let errors = [];
    /*if(!isConvertFile == 'true'){
        //Descargar videos y audios descargados
        if(isVideo == 'true'){
            dir = path.join(__dirname, `../dlVideos/${name}.${format}`);
        }else{
            dir = path.join(__dirname, `../dlAudios/${name}.${format}`);
        }
    }else{
        //Descargara los archivos convertidos
        dir = path.join(__dirname, `../convertFiles/${name}.${format}`);
    }*/

    //Localizando archivo
    if(fs.existsSync(path.join(__dirname, `../dlVideos/${name}.${format}`))){
        //Si esta en la carpeta de video
        dir = path.join(__dirname, `../dlVideos/${name}.${format}`)
    }else if(fs.existsSync(path.join(__dirname, `../dlAudios/${name}.${format}`))){
        //Si existe en la carpeta de audios
        dir = path.join(__dirname, `../dlAudios/${name}.${format}`)
    }else if(fs.existsSync(path.join(__dirname, `../convertFiles/${name}.${format}`))){
        //Carpeta de convertidos
        dir = path.join(__dirname, `../convertFiles/${name}.${format}`)
    }else{
        //Si el archivo no existe
        errors.push('Oppps!, the file was deleted please <a href="/">Try again</a>')
    }

    if(errors.length > 0){
        res.send(errors[0])
    }else{
        res.download(dir);
    }
})

//Ruta para eliminar el archivo
router.delete('/deleteFile/:name/:format/:isVideo', async (req, res)=>{
    let {name, format, isVideo} = req.params;
    let dir = '';
    console.log(isVideo);
    console.log(format);

    //Localizando archivo
    if(fs.existsSync(path.join(__dirname, `../dlVideos/${name}.${format}`))){
        //Si esta en la carpeta de video
        dir = path.join(__dirname, `../dlVideos/${name}.${format}`)
    }else if(fs.existsSync(path.join(__dirname, `../dlAudios/${name}.${format}`))){
        //Si existe en la carpeta de audios
        dir = path.join(__dirname, `../dlAudios/${name}.${format}`)
    }else if(fs.existsSync(path.join(__dirname, `../convertFiles/${name}.${format}`))){
        //Carpeta de convertidos
        dir = path.join(__dirname, `../convertFiles/${name}.${format}`)
    }
    
    console.log(dir)
    if(fs.existsSync(dir)){
        await fs.unlink(dir)
        .then(v =>{
            res.json({'msg': 'Se elimino el archivo'});
        })
    }else{
        res.json({'msg': 'Ya no estaba disponible el archivo'});
    }
    
})

//Limpiando
//Cada hora eliminara los archivos que tengan mas de media hora
cleanUp.CleanUpStart([path.join(__dirname, '../dlAudios/'),path.join(__dirname, '../dlVideos/')], 3.6e6, 1.8e6);


module.exports = router;