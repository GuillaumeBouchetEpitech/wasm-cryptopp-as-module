"use strict";class e{_parentElement;constructor(e){this._parentElement=e,this._clear()}makeBorder(e){return`<span style="padding: 10px; margin: 10px; border: 3px solid; border-color: rgb(64, 64, 64); line-height: 5.8;">${e}</span>`}makeColor(e,t){return`<span style="color: rgb(${e[0]}, ${e[1]}, ${e[2]});">${t}</span>`}makeSize(e,t){return`<span style="font-size: ${e}px;">${t}</span>`}alignedLog(e,...t){const i=t.join(" ").split("\n").join("<br>")+"<br>",n=document.createElement("p");n.innerHTML=i,n.style=`text-align: ${e};`,this._parentElement.appendChild(n)}log(...e){this.alignedLog.apply(this,["left",...e])}logLeft(...e){this.alignedLog.apply(this,["left",...e])}logRight(...e){this.alignedLog.apply(this,["right",...e])}logCenter(...e){this.alignedLog.apply(this,["center",...e])}error(...e){this.alignedLog.apply(this,["center","ERR",...e])}_clear(){for(;this._parentElement.firstChild;)this._parentElement.removeChild(this._parentElement.lastChild)}}class t{static _wasmModule;static async load(){var e;await(e="../../build/wasm-cryptopp.js",new Promise(((t,i)=>{const n=document.createElement("script");n.src=e,n.addEventListener("load",t),n.addEventListener("error",i),document.head.appendChild(n)}))),await t.rawLoad()}static async rawLoad(){t._wasmModule=await wasmCryptoppJs({locateFile:e=>(console.log(`url: "${e}"`),`../../build/${e}`)})}static get(){if(!this._wasmModule)throw new Error("crytpopp wasm module not loaded");return this._wasmModule}}const i=(e,t,i,n)=>{const o=t.length.toString();let s=0;for(;s<t.length;){let a=t.substr(s,i);s>0&&(a=a.padEnd(i,"_"));const l=e.makeColor([128,128,64],a);switch(n){case"left":e.alignedLog(n,` => {${s.toString().padStart(3,"_")} / ${o}} ${l}`);break;case"right":e.alignedLog(n,`${l} {${s.toString().padStart(3,"_")} / ${o}} <= `);break;case"center":e.alignedLog(n,`${l}`)}s+=i}},n=["0x87A8E61DB4B6663CFFBBD19C651959998CEEF608660DD0F2","5D2CEED4435E3B00E00DF8F1D61957D4FAF7DF4561B2AA30","16C3D91134096FAA3BF4296D830E9A7C209E0C6497517ABD","5A8A9D306BCF67ED91F9E6725B4758C022E0B1EF4275BF7B","6C5BFC11D45F9088B941F54EB1E59BB8BC39A0BF12307F5C","4FDB70C581B23F76B63ACAE1CAA6B7902D52526735488A0E","F13C6D9A51BFA4AB3AD8347796524D8EF6A167B5A41825D9","67E144E5140564251CCACB83E6B486F6B3CA3F7971506026","C0B857F689962856DED4010ABD0BE621C3A3960A54E710C3","75F26375D7014103A4B54330C198AF126116D2276E11715F","693877FAD7EF09CADB094AE91E1A1597"].join(""),o=["0x3FB32C9B73134D0B2E77506660EDBD484CA7B18F21EF2054","07F4793A1A0BA12510DBC15077BE463FFF4FED4AAC0BB555","BE3A6C1B0C6B47B1BC3773BF7E8C6F62901228F8C28CBB18","A55AE31341000A650196F931C77A57F2DDF463E5E9EC144B","777DE62AAAB8A8628AC376D282D6ED3864E67982428EBC83","1D14348F6F2F9193B5045AF2767164E1DFC967C1FB3F2E55","A4BD1BFFE83B9C80D052B985D182EA0ADB2A3B7313D3FE14","C8484B1E052588B9B7D2BBD2DF016199ECD06E1557CD0915","B3353BBB64E0EC377FD028370DF92B52C7891428CDC67EB6","184B523D1DB246C32F63078490F00EF8D647D148D4795451","5E2327CFEF98C582664B4C0F6CC41659"].join("");var s;!function(e){e.PlainMessage="PlainMessage",e.EncryptedMessage="EncryptedMessage",e.SecurityRequest="SecurityRequest",e.SecurityResponse="SecurityResponse"}(s||(s={}));const a=e=>"object"==typeof e&&"string"==typeof e.type&&"string"==typeof e.payload;var l;!function(e){e[e.unencrypted=0]="unencrypted",e[e.initiated=1]="initiated",e[e.ready=2]="ready",e[e.confirmed=3]="confirmed"}(l||(l={}));const g=e=>"object"==typeof e&&"string"==typeof e.publicKey,r=e=>g(e)&&"string"==typeof e.ivValue;class c{_wasDeleted=!1;_communication;_EncryptedCommunicationState=l.unencrypted;_onReceiveCallbacks=[];_dhClient;_aesSymmetricCipher;_publicKey;_ivValue;_sharedSecret;_logger;_logTextAlign;constructor(e,i,n){this._communication=e,this._logger=i,this._logTextAlign=n;const o=t.get();this._dhClient=new o.DiffieHellmanClientJs,this._aesSymmetricCipher=new o.AesSymmetricCipherJs,this._communication.onReceive((e=>{this._processReceivedMessage(e)}))}delete(){this._dhClient.delete(),this._aesSymmetricCipher.delete(),this._wasDeleted=!0}_processReceivedMessage(e){if(this._wasDeleted)throw new Error("was deleted");const i=JSON.parse(e);if(!a(i))throw new Error("received message structure unrecognized");switch(this._logger.alignedLog(this._logTextAlign,`received message, type: "${i.type}"`),i.type){case s.PlainMessage:this._onReceiveCallbacks.forEach((e=>e(i.payload)));break;case s.EncryptedMessage:{this._logger.alignedLog(this._logTextAlign,"decrypting");const e=Date.now(),n=this._aesSymmetricCipher.decryptFromHexStrAsHexStr(i.payload),o=t.get().hexToUtf8(n),s=Date.now();if(this._logger.alignedLog(this._logTextAlign,`decrypted (${s-e}ms)`),this._EncryptedCommunicationState===l.ready)this._logger.alignedLog(this._logTextAlign,"connection now confirmed secure"),this._EncryptedCommunicationState=l.confirmed;else if(this._EncryptedCommunicationState!==l.confirmed)throw new Error("was expecting to be in a secure state");this._onReceiveCallbacks.forEach((e=>e(o)));break}case s.SecurityRequest:{this._logger.alignedLog(this._logTextAlign,"now securing the connection"),this._EncryptedCommunicationState=l.initiated;const e=JSON.parse(i.payload);if(!r(e))throw new Error("received message security request payload unrecognized");this._ivValue=e.ivValue,this._generateDiffieHellmanKeys(),this._initializeAesSymmetricCipher(e.publicKey),this._logger.alignedLog(this._logTextAlign,"sending public key"),this._EncryptedCommunicationState=l.ready;const t=JSON.stringify({publicKey:this._publicKey});this._communication.send(JSON.stringify({type:s.SecurityResponse,payload:t}));break}case s.SecurityResponse:{if(this._logger.alignedLog(this._logTextAlign,"processing received security response"),this._EncryptedCommunicationState!==l.initiated)throw new Error("was expecting a security response");this._logger.alignedLog(this._logTextAlign,"computing the shared secret with the received public key");const e=JSON.parse(i.payload);if(!g(e))throw new Error("received message security response payload unrecognized");this._initializeAesSymmetricCipher(e.publicKey),this._logger.alignedLog(this._logTextAlign,"connection now confirmed secure"),this._EncryptedCommunicationState=l.ready;break}default:throw new Error(`received message type unsupported, type: "${i.type}"`)}}makeSecure(){if(this._wasDeleted)throw new Error("was deleted");this._logger.alignedLog(this._logTextAlign,"now securing the connection"),this._EncryptedCommunicationState=l.initiated,this._generateDiffieHellmanKeys();const e=new(t.get().AutoSeededRandomPoolJs);this._ivValue=e.getRandomHexStr(16),e.delete();const i=JSON.stringify({publicKey:this._publicKey,ivValue:this._ivValue});this._communication.send(JSON.stringify({type:s.SecurityRequest,payload:i}))}send(e){if(this._wasDeleted)throw new Error("was deleted");if(this._EncryptedCommunicationState===l.initiated)throw new Error("cannot send while securing the connection");if(this._EncryptedCommunicationState===l.unencrypted)this._logger.alignedLog(this._logTextAlign,"[unencrypted] sending a message:"),this._logger.alignedLog(this._logTextAlign,`[unencrypted] "${e}"`),this._communication.send(JSON.stringify({type:s.PlainMessage,payload:e}));else{this._logger.alignedLog(this._logTextAlign,"[encrypted] sending a message:"),this._logger.alignedLog(this._logTextAlign,`[encrypted] "${e}"`),this._logger.alignedLog(this._logTextAlign,"[encrypted] encrypting");const i=Date.now(),n=t.get().utf8ToHex(e),o=this._aesSymmetricCipher.encryptFromHexStrAsHexStr(n),a=Date.now();this._logger.alignedLog(this._logTextAlign,`[encrypted] encrypted (${a-i}ms)`),this._communication.send(JSON.stringify({type:s.EncryptedMessage,payload:o}))}}onReceive(e){if(this._wasDeleted)throw new Error("was deleted");this._onReceiveCallbacks.push(e)}get EncryptedCommunicationState(){if(this._wasDeleted)throw new Error("was deleted");return this._EncryptedCommunicationState}_generateDiffieHellmanKeys(){this._logger.alignedLog(this._logTextAlign,"------------------------------------"),this._logger.alignedLog(this._logTextAlign,"Diffie Hellman Key Exchange"),this._logger.alignedLog(this._logTextAlign,"generating public/private keys"),this._logger.alignedLog(this._logTextAlign,"2048-bit MODP Group with 256-bit Prime Order Subgroup");const e=Date.now();this._dhClient.generateKeys(n,"0x8CF83642A709A097B447997640129DA299B1A47D1EB3750BA308B0FE64F5FBD3",o),this._publicKey=this._dhClient.getPublicKeyAsHexStr();const t=Date.now();this._logger.alignedLog(this._logTextAlign,`generated public/private keys (${t-e}ms)`),this._logger.alignedLog(this._logTextAlign,"------------------------------------")}_initializeAesSymmetricCipher(e){{this._logger.alignedLog(this._logTextAlign,"------------------------------------"),this._logger.alignedLog(this._logTextAlign,"Diffie Hellman Key Exchange"),this._logger.alignedLog(this._logTextAlign,"shared secret"),this._logger.alignedLog(this._logTextAlign,"computing");const t=Date.now();this._dhClient.computeSharedSecretFromHexStr(e);const n=Date.now();this._sharedSecret=this._dhClient.getSharedSecretAsHexStr(),this._logger.alignedLog(this._logTextAlign,`computed (${n-t}ms)`),i(this._logger,this._sharedSecret,64,this._logTextAlign),this._logger.alignedLog(this._logTextAlign,"------------------------------------")}{this._logger.alignedLog(this._logTextAlign,"------------------------------------"),this._logger.alignedLog(this._logTextAlign,"AES Symmetric Cipher"),this._logger.alignedLog(this._logTextAlign,"256bits key from computed shared secret");const e=this._sharedSecret.slice(0,64);this._logger.alignedLog(this._logTextAlign,"actual key used"),i(this._logger,e,32,this._logTextAlign),this._logger.alignedLog(this._logTextAlign,"initializing");const t=Date.now();this._aesSymmetricCipher.initializeFromHexStr(e,this._ivValue);const n=Date.now();this._logger.alignedLog(this._logTextAlign,`initialized (${n-t}ms)`),this._logger.alignedLog(this._logTextAlign,"------------------------------------")}}}const d=["/!\\","UNENCRYPTED MESSAGE","ANYONE LISTENING CAN SEE IT","/!\\"].join("\n"),h=["(OK)","ENCRYPTED MESSAGE","GOOD LUCK TO ANYONE LISTENING","(OK)"].join("\n"),p=["(OK)","NO COMPROMISING INFORMATION SHARED","GOOD LUCK TO ANYONE LISTENING","(OK)"].join("\n"),m=(e,t,i)=>{i.type===s.PlainMessage?e.alignedLog(t,e.makeColor([128,64,64],d)):i.type===s.EncryptedMessage?e.alignedLog(t,e.makeColor([64,128,64],h)):i.type!==s.SecurityRequest&&i.type!==s.SecurityResponse||e.alignedLog(t,e.makeColor([64,128,64],p))};class _{_logger;_logTextAlign;_myName;_otherName;_transitionStr;_allSentMessages=[];_allOnReceiveCallbacks=[];constructor(e,t,i,n){this._logger=e,this._logTextAlign=t,this._myName=i,this._otherName=n,this._transitionStr="right"===t?"<-----":"-----\x3e"}send(e){this._logger.alignedLog(this._logTextAlign,`fake websocket "${this._myName}" sent a message\n`),this._logger.alignedLog("center",`"${this._myName}" ${this._transitionStr} "${this._otherName}"`),((e,t,n)=>{const o=JSON.parse(n);if(a(o)){if(m(e,t,o),e.alignedLog(t,"type:"),e.alignedLog(t,e.makeColor([192,192,64],`"${o.type}"`)),o.type===s.PlainMessage)e.alignedLog(t,"payload:"),e.alignedLog(t,e.makeColor([192,64,64],e.makeSize(25,`"${o.payload}"`)));else try{const n=JSON.parse(o.payload);r(n)?(e.alignedLog(t,"payload.publicKey:"),i(e,n.publicKey,64,t),e.alignedLog(t,"payload.ivValue:"),i(e,n.ivValue,64,t)):g(n)?(e.alignedLog(t,"payload.publicKey:"),i(e,n.publicKey,64,t)):(e.alignedLog(t,"payload:"),i(e,o.payload,64,t))}catch{e.alignedLog(t,"payload:"),i(e,o.payload,64,t)}m(e,t,o)}else e.alignedLog(t,`"${n}"`)})(this._logger,"center",e),this._logger.alignedLog("center",`"${this._myName}" ${this._transitionStr} "${this._otherName}"`),this._logger.alignedLog("center","\n"),this._allSentMessages.push(e)}receive(e){this._logger.alignedLog(this._logTextAlign,`fake websocket "${this._myName}" received a message`),this._allOnReceiveCallbacks.forEach((t=>t(e)))}onReceive(e){this._allOnReceiveCallbacks.push(e)}pipeMessages(e){this._allSentMessages.forEach((t=>e.receive(t))),this._allSentMessages.length=0}hasMessageToSend(){return this._allSentMessages.length>0}}window.onload=async()=>{const i=Date.now(),n=(e=>{const t=document.querySelector(e);if(!t)throw new Error(`DOM elements not found, id: "${e}"`);return t})("#loggerOutput"),o=new e(n);o.logCenter("page loaded"),o.logCenter(o.makeColor([255,0,0],"\n\nSTART\n\n")),o.logCenter(" loading wasmCryptoppJs wasm script");const s=Date.now();await t.load();const a=Date.now();o.logCenter(`wasmCryptoppJs wasm module loaded (${a-s}ms)`),await(async e=>{e.logCenter(e.makeColor([128,128,0],e.makeSize(30,e.makeBorder("Secure Connection Test"))));const t=e.makeColor([192,128,128],"Client A"),i=e.makeColor([128,128,192],"Client B"),n=new _(e,"left",t,i),o=new _(e,"right",i,t);e.logCenter(e.makeBorder("initialize")),e.logLeft(`${t} created`);const s=new c(n,e,"left");s.onReceive((i=>{e.alignedLog("left",`${t} received:`),e.alignedLog("left",e.makeColor([64,192,64],e.makeSize(25,`"${i}"`))),e.alignedLog("left","\n")})),e.logRight(`${i} created`);const a=new c(o,e,"right");a.onReceive((t=>{e.alignedLog("right",`${i} received:`),e.alignedLog("right",e.makeColor([64,192,64],e.makeSize(25,`"${t}"`))),e.alignedLog("right","\n")})),e.logCenter(e.makeBorder("[unencrypted] Client A send to Client B")),e.logLeft(`${t} now sending a message:`);const l="Hello, is this safe?";e.alignedLog("left",e.makeColor([64,192,64],e.makeSize(25,`"${l}"`))),e.log("\n"),s.send(l),n.pipeMessages(o),e.logCenter(e.makeBorder("[unencrypted] Client B send to Client A")),e.logRight(`${i} now sending a message:`);const g="Hi, no... it isn't safe...";for(e.alignedLog("right",e.makeColor([64,192,64],e.makeSize(25,`"${g}"`))),e.log("\n"),a.send(g),o.pipeMessages(n),e.logCenter(e.makeBorder("Client A send request for encryption to Client B")),s.makeSecure();n.hasMessageToSend()||o.hasMessageToSend();)n.pipeMessages(o),o.pipeMessages(n);e.logCenter(e.makeBorder("Client B sent a reply for encryption to Client B")),e.logCenter(e.makeBorder("Both Client A and Client B can now encrypt/decrypt each other messages")),e.logCenter(e.makeBorder("[encrypted] Client A send to Client B")),e.logLeft(`${t} now sending a message:`);const r="Let's try again, safe now?";e.alignedLog("left",e.makeColor([64,192,64],e.makeSize(25,`"${r}"`))),e.log("\n"),s.send(r),n.pipeMessages(o),e.logCenter(e.makeBorder("[encrypted] Client B send to Client A")),e.logRight(`${i} now sending a message:`);const d="I'd say we're pretty safe right now :)";e.alignedLog("right",e.makeColor([64,192,64],e.makeSize(25,`"${d}"`))),e.log("\n"),a.send(d),o.pipeMessages(n),s.delete(),a.delete(),e.logCenter(e.makeColor([128,128,0],e.makeSize(30,e.makeBorder("Secure Connection Test"))))})(o);const l=Date.now();o.logCenter(o.makeColor([255,0,0],`\n\nSTOP (${l-i}ms)\n\n`))};
