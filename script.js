const urlAPI="https://mock-api.driven.com.br/api/v6/uol";

let ultimaHora;
let nick;

let tipoDeMsg ="message";
let destinatario="Todos";

//função para selecionar quem recebe a msg
function selecionarUsuario(usuario, elemento){
    const selecionado = document.querySelector(".contatos .selecionado");
    if(selecionado){
        selecionado.classList.remove("selecionado");
    }
    elemento.classList.add("selecionado");
    destinatario=usuario;
    //mexe menu lateral
    toggleMenu();
}

//função para mostar os usuarios
function mostrarUsuarios(resposta){
    console.log(resposta.data);
    const contatos = document.querySelector(".contatos");
    for(let i=0; i<resposta.data.length; i++){
        const usuarioTemplate =`
            <li class="publico" onclick="selecionarUsuario('${resposta.data[i].name}', this)">
                <ion-icon name="person-circle"></ion-icon>
                <span class="nome">${resposta.data[i].name}</span>
                <ion-icon class="check" name="checkmark-outline"></ion-icon>
            </li>`;
        contatos.innerHTML+=usuarioTemplate;
    }
}

//função para carregar os usuários
function carregarUsuarios(){
    console.log("CARREGAR USUARIOS");
    //promessa da função carregar, escopo local
    const promise = axios.get(`${urlAPI}/participants`);
    promise.then(mostrarUsuarios); 
    //callback
}

//função para ir até o fim das msg, tipo o whats q mostra as mais novas 
function whats(ultimaMsg){
    if(ultimaMsg !== ultimaHora){
        document
            .querySelector(".chat li:last-child")
            .scrollIntoView();
        ultimaHora=ultimaMsg;
    }
}

//função para ver as mensagens privadas
function visualizarPvd(tMsg){
    if(tMsg.type==="privatemsg" && (tMsg.from===nick || tMsg.to===nick)){
        return true;
    }
    return false;
}

//função para carregar as mensagens
function carregarMsg(){
    if(nick !== undefined){
        const promise = axios.get(`${urlAPI}/messages`);
        //promete a função q mostra as msgs
        promise.then(mostrarMsg);
    }
}

//função para entrar na sala
function entrar(){
    //como não fiz o bonus (pelo menos n ainda) o nome do usuario é pego por um prompt
    nick = prompt("Escreva seu nome");
    const promise=axios.post(`${urlAPI}/participants`, {name: nick});
    promise.catch(erroEntrar);
    promise.then(carregarMsg);
}

//função para continuar conectado
function continuarConectado(){
    if(nick){
        console.log("status");
        axios.post(`${urlAPI}/status`, {name: nick});
    }
}

//função de erro ao entrar na sala
function erroEntrar(){
    console.log("ERRO");
    nick=undefined;
}

//função para mostrar as mensagens, colocar no dominio
function mostrarMsg(resposta){
    console.log("mostrarMsg");
    let containerChat = document.querySelector(".chat");
    containerChat.innerHTML="";
    for(let i=0; i<resposta.data.length; i++){
        const tMsg = resposta.data[i];
        //para mensagens privadas
        if(visualizarPvd(tMsg)){
            containerChat.innerHTML+= `
                    <li class="privada">
                        <span class="hora">(${tMsg.time})</span>
                            <strong>${tMsg.from}</strong>
                                <span> reservadamente para </span>
                            <strong>${tMsg.to}: </strong>
                        <span>${tMsg.text}</span>
                    </li>
                `;
        }
        //para mensagens publicas
        if(tMsg.type==="message"){
            containerChat.innerHTML+= `
                    <li class="publica">
                        <span class="hora">(${tMsg.time})</span>
                            <strong>${tMsg.from}</strong>
                                <span> para </span>
                            <strong>${tMsg.to}: </strong>
                        <span>${tMsg.text}</span>
                    </li>            
                `;
        }
        //para mensagens de status
        if(tMsg.type==="status"){
            containerChat.innerHTML+= `
                    <li class="entradaesaida">
                        <span class="hora">(${tMsg.time})</span>
                            <strong>${tMsg.from}</strong>
                                <span> para </span>
                            <strong>${tMsg.to}: </strong>
                        <span>${tMsg.text}</span>
                    </li>
                `;
        }
    }
    const ultimaMsg = resposta.data[resposta.data.length-1].time;
    //chama a função q rola para o fim das msg
    whats(ultimaMsg);
}

//função para enviar mensagem
function enviar(){
    const msg=document.querySelector("input").value;
    axios.post(`${urlAPI}/messages`, {
        from: nick,
        to: destinatario,
        text: msg,
        type: tipoDeMsg
    });
    console.log({
        from: nick,
        to: destinatario,
        text: msg,
        type: tipoDeMsg
    });
    document.querySelector("input").value="";
}

//função para carregar chat
function carregarChat(){
    //chama a função para carregar os usuarios
    carregarUsuarios();
    //chama a função para entrar na sala
    entrar();
    setInterval(carregarMsg, 3000);
    setInterval(continuarConectado, 5000);
}

//função para escolher a visibilidade da mensagem
function visibilidade(tipo, element){
    tipoDeMsg=tipo;
    const selecionado=document.querySelector(".visibilidade .selecionado");
    if(selecionado){
        selecionado.classList.remove("selecionado");
    }
    element.classList.add("selecionado");
    //chama a função do menu lateral
    toggleMenu();
}

//função do menu lateral
function toggleMenu(){
    const menuLateral= document.querySelector(".menu");
    const conteudoDoChat= document.querySelector(".fundomenu");
    menuLateral.classList.toggle("escondido");
    conteudoDoChat.classList.toggle("fundoescondido");
}

//envio
document.addEventListener("keyup", function (evento){
    if (evento.key==="enter"){
        enviar();
    }
});

//chama a função para carregar o chat
carregarChat();