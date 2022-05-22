const fs = require('fs-extra');
const path = require('path');

function CleanUp (filePaths = [], destroyTime){
    //filepath, array de las carpetas en las cuales buscar archivos para eliminar
    let arrayFiles = [];
    filePaths.map(async fp =>{
        //Por cada carpeta se sacara una lista de archivos
        arrayFiles = await fs.readdir(fp);
        //console.log(arrayFiles)

        //Por cada array de archivos de una carpeta comprobara su tiempo
        let limitTime = destroyTime;
        let fechaArchivo;
        let fechaActual = new Date().getTime();

        //Comprobando por cada archivo si existe
        arrayFiles.map(async f =>{
            fechaArchivo = await fs.statSync(`${fp}/${f}`).mtimeMs;
            if((fechaActual - fechaArchivo) >= limitTime){
                //Es mayor al tiempo limite se elimina
                await fs.unlinkSync(`${fp}/${f}`);
            }

        })
    })

}

var y;
function CleanUpStart(filePaths = [], freqTime, limitTime ){
    /*
    filepath es un array con las carpetas que contengan archivos para eliminar
    freqTime especifica la frecuencia con la que verificara si hay archivos que eliminar
    limiTime especifica la duracion maxima que debe tener un archivo antes de eliminarlo
    */
    y = setInterval(()=>{
        CleanUp(filePaths, limitTime);
        console.log('Se hizo limpieza')
    }, freqTime)
}

function stopCleanUp(){
    clearInterval(y);
}

module.exports = {CleanUpStart, stopCleanUp};