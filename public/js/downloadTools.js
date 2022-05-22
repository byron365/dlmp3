let url = document.getElementById('url');
let reqButton = document.getElementById('reqButton');
let errorText = document.getElementById('errorText');
let alertCnt = document.getElementById('alertCnt');
let warningCnt = document.getElementById('warningCnt');
let warningMsg = document.getElementById('warningMsg');
let reqNres = document.getElementsByClassName('reqNres');

let thumbnail = document.getElementById('thumbnail');
let VideoTitle = document.getElementById('VideoTitle');
let author = document.getElementById('author');
let category = document.getElementById('category');
let duration = document.getElementById('duration');

let formatOp = document.getElementById('formatOp');
let preDownloadBtn = document.getElementById('preDownloadBtn');
let downloadBtn = document.getElementById('downloadBtn');
let downloadOther = document.getElementById('downloadOther');
let calidadOp = document.getElementById('calidadOp');

let titlePage = document.getElementById('titlePage');
let infoVideoCnt = document.getElementsByClassName('infoVideoCnt');

//Eventos del input
let isOnReq = false;
url.value = '';
reqButton.disabled = true;
url.addEventListener('keypress', ()=>{
    //Aqui se filtrara
    if(url.value != '' && isOnReq == false){
        //Si no esta vacio
        reqButton.disabled = false;
    }else{
        reqButton.disabled = true;
    }
})

url.addEventListener('mousemove', ()=>{
    //Aqui se filtrara
    if(url.value != '' && isOnReq == false){
        //Si no esta vacio
        reqButton.disabled = false;
    }else{
        reqButton.disabled = true;
    }
})

url.addEventListener('focusout', ()=>{
    //Aqui se filtrara
    if(url.value != '' && isOnReq == false){
        //Si no esta vacio
        reqButton.disabled = false;
    }else{
        reqButton.disabled = true;
    }
})

//Evento del boton de comenzar
var data = {}
reqButton.addEventListener('click', async ()=>{
    if(url.value != ''){
        data = {'url': url.value}
        reqButton.disabled = true;
        isOnReq = true;
        isLoading(true, titlePage, 2500);
        var res = await reqFunction('/tools/getinfo', 'POST', data)
        .then(v =>{
            //console.log(v);
            if(v.errors){
                //Hay errores
                isOnReq = false;
                alertCnt.style.visibility = 'visible';
                errorText.innerHTML = `<strong>Error!</strong> ${v.errors[0].error}`;
                isLoading(false,titlePage,2500);
            }else{
                //Mostrando informacion
                isLoading(false,titlePage,2500);
                if(v.info.isLiveContent){
                    warningCnt.style.visibility = 'visible';
                    warningMsg.innerHTML = `<strong>Is a Live!</strong> \nWhen the live ends, you can download it <a href="/tools/yttoaudio">Try other</a>`;
                    setTimeout(()=>{
                        warningCnt.style.visibility = 'hidden';
                    }, 10000);
                    preDownloadBtn.disabled = true;
                }
                data.isLiveContent = v.info.isLiveContent;
                reqNres[0].style.transform = 'translateY(-40vh)';
                infoVideoCnt[0].style.visibility = 'visible';
                VideoTitle.innerHTML = v.info.title;
                thumbnail.setAttribute('src', `${v.info.thumbnails[v.info.thumbnails.length-1].url}`);
                author.innerHTML = `<strong>Author:</strong> ${v.info.author}`;
                category.innerHTML = `<strong>Category:</strong> ${v.info.category}`;
                duration.innerHTML = `<strong>Duration:</strong> ${convertSec(v.info.durationSec)}`;
                if(location.href.includes('yttovideo')){
                    v.info.qualityLabels.map(x =>{
                        if(!calidadOp.innerHTML.includes(`<option value="${x.quality}">${x.quality}</option>`)){
                            calidadOp.innerHTML = calidadOp.innerHTML + `<option value="${x.quality}">${x.quality}</option>`;
                        }
                    })
                }
                

            }
        }).catch(e =>{
            isLoading(false,titlePage,2500);
            isOnReq = false;
            alertCnt.style.visibility = 'visible';
            if(location.href.includes('yttovideo')){
                errorText.innerHTML = `<strong>Error!</strong> Something is wrong, please try <a href="/tools/yttovideo">again</a>`;
            }else{
                errorText.innerHTML = `<strong>Error!</strong> Something is wrong, please try <a href="/tools/yttoaudio">again</a>`;
            }
        })
    }else{
        reqButton.disabled = true;
    }
})

//Eventos para los formatos de video
formatOp.addEventListener('change',()=>{
    if(formatOp.value == "mov" || formatOp.value == "mkv"){
        warningCnt.style.visibility = "visible";
        warningMsg.innerHTML = "Some formats such as <strong>mov</strong> and <strong>mkv</strong> may take longer to convert."
    }else{
        warningCnt.style.visibility = "hidden";
        warningMsg.innerHTML = "";
    }
})

//Eventos para realizar la peticion de descarga
preDownloadBtn.addEventListener('click', ()=>{
    data.format = formatOp.value;
    preDownloadBtn.style.backgroundColor = '##ff9f1a';
    preDownloadBtn.innerHTML = 'Processing...';
    preDownloadBtn.disabled = true;
    
    let ruta;
    if(!location.href.includes('yttovideo')){
        ruta = "/tools/dlAudio";
    }else{
        ruta = "/tools/dlVideo";
        data.calidad = calidadOp.value;
    }
    isLoading(true,titlePage,2500);

    reqFunction(ruta, 'POST', data)
    .then(v =>{
        if(v.errors){
            //Hay errores
            alertCnt.style.visibility = 'visible';
            errorText.innerHTML = `<strong>Error!</strong> ${v.errors[0].error}`;
            isLoading(false,titlePage,2500);
        }else{
            //console.log(v);
            isLoading(false,titlePage,2500);
            preDownloadBtn.style.display = 'none';
            formatOp.style.display = 'none';
            downloadBtn.style.display = 'inline-block';
            downloadOther.style.display = 'inline-block';
            if(location.href.includes('yttovideo')){
                downloadBtn.setAttribute('href', `/tools/downloadFile/${v.name}/${v.format}/true/false`);
            }else{
                downloadBtn.setAttribute('href', `/tools/downloadFile/${v.name}/${v.format}/false/false`);
            }
            data.format = v.format;
            data.name = v.name;
        }
    }).catch(e =>{
        isLoading(false,titlePage,2500);
        alertCnt.style.visibility = 'visible';
        if(location.href.includes('yttovideo')){
            errorText.innerHTML = `<strong>Error!</strong> Something is wrong, please try <a href="/tools/yttovideo">again</a>`;
        }else{
            errorText.innerHTML = `<strong>Error!</strong> Something is wrong, please try <a href="/tools/yttoaudio">again</a>`;
        }
    })
})

//Evento para cuando se cierra la alerta
alertCnt.children[1].addEventListener('click', ()=>{
    alertCnt.style.visibility = 'hidden';
})


//Evento para mandar la solicitud de eliminacion al precionar descargar otro
downloadOther.addEventListener('click', ()=>{
    let ruta;
    if(location.href.includes('yttovideo')){
        ruta = `/tools/deleteFile/${data.name}/${data.format}/true`;
    }else{
        ruta = `/tools/deleteFile/${data.name}/${data.format}/false`
    }
    reqFunction(ruta, 'DELETE', data)
    .then(v =>{
        console.log(v.msg);
        location.reload();
    })
})

//Funcion para hacer peticiones
async function reqFunction(url, method, data){
    const response = await fetch(url,{
        method:method,
        mode:'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers:{
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}

//Funcion para convertir de segundos a minutos y ahoras
function convertSec(sec){
    if(sec < 60){
        return parseFloat(sec).toFixed(2) + ' seconds';
    }else if(sec > 60){
        return parseFloat((sec / 60)).toFixed(2)  + ' minutes';
    }else if((sec / 60) >= 60){
        return parseFloat(((sec / 60) / 60)).toFixed(2)  + ' hours';
    }
}

//Funcion para el anuncio de carga
let anCicle;
let currentTitle = titlePage.innerHTML;
let anCount = 0;
function isLoading(activar ,tagElement, durationMsec){
    if(activar){
        anCicle= setInterval(()=>{
            tagElement.style.animationDuration = '2.5s';
            tagElement.style.animationName = 'headShake';
            titlePage.style.animationIterationCount = 'infinite';
            if(anCount == 0){
            //Primera animacion
                tagElement.innerHTML = 'Loading...';
                anCount = 1;
            }else if(anCount == 1){
                //Segunda animacion
                if(currentTitle.includes('Video')){
                    tagElement.innerHTML = 'Wait a few minutes...';
                }else{
                    tagElement.innerHTML = 'Wait a few seconds...';
                }
                
                anCount = 2;
            }else{
            //Tercera animacion
                tagElement.innerHTML = currentTitle;
                anCount = 0;
            }
        },durationMsec)
    }else{
        tagElement.innerHTML = 'Finished';
        tagElement.style.color = 'green';
        anCount = 0;
        setTimeout(()=> {
            tagElement.innerHTML = currentTitle;
            titlePage.style.animationIterationCount = '';
            tagElement.style.animationDuration = '';
            tagElement.style.animationName = '';
            tagElement.style.color = '';
        },2000)
        
        clearInterval(anCicle);
    }
}