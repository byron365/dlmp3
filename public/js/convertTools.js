let convertFile = document.getElementById('convertFile');
let selectFile = document.getElementById('selectFile');
let formatOpBtn = document.getElementById('formatOpBtn');
let formatOp = document.getElementById('formatOp');
let convertBtn = document.getElementById('convertBtn');
let dataForm = document.getElementById('dataForm');
let alertCnt = document.getElementById('alertCnt');
let errorText = document.getElementById('errorText');
let replaceBtn = document.getElementById('replaceBtn');
let processingLabel = document.getElementById('processingLabel');
let btnStatus = 0; //Servira para controla los estados del boton de accion, al inicio sera 0, 1 para descargar el archivo 2 para convertir otro

//Eventos del boton de formatos
convertBtn.disabled = true;
convertFile.addEventListener('change', ()=>{
    selectFile.innerHTML = convertFile.value.replaceAll('C:\\fakepath\\', '');
    if(convertFile.value != ''){
        convertBtn.disabled = false;
    }else{
        convertBtn.disabled = true;
    }
})

//Eventos del form
dataForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
})

//Eventos del boton de enviar
convertBtn.addEventListener('mouseover',()=>{
    if(convertFile.value != ''){
        convertBtn.disabled = false;
    }else{
        convertBtn.disabled = true;
    }
})

let dataResponse;
convertBtn.addEventListener('click', async ()=>{
    const formData = new FormData(dataForm);
    let url = '/tools/uploadfile';
    if(btnStatus == 0){
        //estado inicial
        //Mostrando mensaje 
        isLoading(true,processingLabel,2500);
        convertBtn.innerHTML = 'Uploading...';
        convertBtn.style.backgroundColor = '#ff9f1a';
        convertBtn.disabled = true;
        convertFile.disabled = true;
        //Subiendo archivo
        await fetch(url,{
            method:'POST',
            mode:'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers:{
                'Accept': 'application/json',
                //'Content-Type': 'multipart/form-data',
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: formData
        }).then(async res => {
            if(res.status == 500){
                alertCnt.style.visibility = 'visible';
                isLoading(false,processingLabel,2500);
                errorText.innerHTML = `<strong>Error!</strong> ${res.statusText}. Please try <a href="/tools/videotoaudio">again</a>`
            }
            //Cambiando mensaje
            convertBtn.innerHTML = 'Converting...';

            //Procesando la respuesta
            await res.json().then(async v =>{
                //console.log(v)
                //Reuniendo datos
                let data = v;
                //console.log(data)

                //Haciendo peticion para convertir archivo
                await fetch('/tools/convertfile',{
                    method:'POST',
                    mode:'cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers:{
                        'Content-Type': 'application/json'
                        //'Content-Type': 'multipart/form-data',
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify(data)
                }).then(async res =>{
                    await res.json().then(c =>{
                        //console.log(c);
                        dataResponse = c;
                        //Errores
                        if(c.error){
                            alertCnt.style.visibility = 'visible';
                            isLoading(false,processingLabel,2500);
                            errorText.innerHTML = `<strong>Error!</strong> ${c.error[0]}. Please try <a href="/tools/videotoaudio">again</a>`
                        }

                        //Si no hay errores
                        replaceBtn.innerHTML = `<a class="btn btn-success disabledBtn linkStyle" id="convertBtn" href="/tools/downloadFile/${dataResponse.originalname}/${dataResponse.format}/false/true">Download file</a>`
                        convertBtn.style.backgroundColor = '';
                        convertBtn.disabled = false;
                        isLoading(false,processingLabel,2500);
                        btnStatus = 1;//Se habilitara la peticion de descargar
                    })
                }).catch(e => {
                    alertCnt.style.visibility = 'visible';
                    isLoading(false,processingLabel,2500);
                    errorText.innerHTML = `<strong>Error</strong> Something wrong!. Please try <a href="/tools/videotoaudio">again</a>`
                })
            })
            
        })
        .catch(error => {
            //console.log(error)
            isLoading(false,processingLabel,2500);
            alertCnt.style.visibility = 'visible';
            errorText.innerHTML = `<strong>Error</strong> ${error.error}. Please try <a href="/tools/videotoaudio">again</a>`
        });
    }else if(btnStatus == 1){
        //Estado de descarga
        //Cambiando mensaje
        replaceBtn.innerHTML = `<a class="btn btn-success disabledBtn linkStyle" id="convertBtn" href="/tools/deleteFile/${dataResponse.originalname}/${dataResponse.format}/false/true">Download file</a>`
        convertBtn.style.backgroundColor = '#ff3838';
        isLoading(true,processingLabel,2500);
        btnStatus = 2;
        
    }else if(btnStatus == 2){
        //Estado de descargar otro
         //Cambiando mensaje
         replaceBtn.innerHTML = `<a class="btn btn-success disabledBtn linkStyle" id="convertBtn" href="/tools/deleteFile/${dataResponse.originalname}/${dataResponse.format}/false/true">Convert other</a>`
         convertBtn.style.backgroundColor = '#ff3838';
    }
})

//Eventos del boton de accion


//Evento para cuando se cierra la alerta
alertCnt.children[1].addEventListener('click', ()=>{
    alertCnt.style.visibility = 'hidden';
})

//Funcion para area de carga
let anCicle;
let currentTitle = processingLabel.innerHTML;
let anCount = 0;
function isLoading(activar ,tagElement, durationMsec){
    if(activar){
        anCicle= setInterval(()=>{
            tagElement.parentNode.style.visibility = "visible";
            tagElement.style.animationDuration = '2.5s';
            tagElement.style.animationName = 'headShake';
            tagElement.style.animationIterationCount = 'infinite';
            if(anCount == 0){
            //Primera animacion
                tagElement.innerHTML = 'Converting...';
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
            tagElement.style.animationIterationCount = '';
            tagElement.style.animationDuration = '';
            tagElement.style.animationName = '';
            tagElement.style.color = '';
            tagElement.parentNode.style.visibility = "";
        },2000)
        
        clearInterval(anCicle);
    }
}
