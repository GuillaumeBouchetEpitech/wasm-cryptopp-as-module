"use strict";var e;!function(e){e.initialize="initialize",e.create_secure_context="create_secure_context",e.generate_diffie_hellman_keys="generate_diffie_hellman_keys",e.compute_diffie_hellman_shared_secret="compute_diffie_hellman_shared_secret"}(e||(e={})),importScripts("../../../build/wasm-cryptopp.js");class t{static _wasmModule;static async load(){await t.rawLoad()}static async rawLoad(){t._wasmModule=await wasmCryptoppJs({locateFile:e=>(console.log(`url: "${e}"`),`../../../build/${e}`)})}static get(){if(!this._wasmModule)throw new Error("crytpopp wasm module not loaded");return this._wasmModule}}let a=0;const o=new Map,r=e=>{const t=o.get(e);if(!t)throw new Error(`secure context not found: "${e}"`);return t},s=new Map([[e.initialize,async a=>{if(!(t=>t?.type===e.initialize)(a))throw new Error("invalid payload");const o=Date.now();await t.load();const r=Date.now()-o;return console.log(`worker, wasmCryptoppJs wasm module loaded (${r}ms)`),{elapsedTime:r}}],[e.create_secure_context,async r=>{if(!(t=>t?.type===e.create_secure_context)(r))throw new Error("invalid payload");const s=Date.now(),n=(()=>{a+=1;const e=`${a}`,r=t.get();return o.set(e,{diffieHellmanClient:new r.DiffieHellmanClientJs,aesSymmetricCipher:new r.AesSymmetricCipherJs}),e})();return{elapsedTime:Date.now()-s,id:n}}],[e.generate_diffie_hellman_keys,async t=>{if(!(t=>t?.type===e.generate_diffie_hellman_keys)(t))throw new Error("invalid payload");const a=Date.now(),o=r(t.id);o.diffieHellmanClient.generateRandomKeysSimpler(),o.publicKey=o.diffieHellmanClient.getPublicKeyAsHexStr();return{elapsedTime:Date.now()-a,publicKey:o.publicKey}}],[e.compute_diffie_hellman_shared_secret,async t=>{if(!(t=>t?.type===e.compute_diffie_hellman_shared_secret)(t))throw new Error("invalid payload");const a=Date.now(),o=r(t.id);o.diffieHellmanClient.computeSharedSecretFromHexStr(t.publicKey),o.sharedSecret=o.diffieHellmanClient.getSharedSecretAsHexStr();return{elapsedTime:Date.now()-a,sharedSecret:o.sharedSecret}}]]);self.onmessage=async e=>{console.log("worker: on message"),console.log("type",e.data.type),console.log("message.data",e.data);try{const t=s.get(e.data?.type);if(!t)throw new Error(`unknown strategy "${e.data?.type}"`);const a=await t(e.data);console.log("worker: on reply"),console.log("type",e.data.type),console.log("response",a),self.postMessage({success:!0,response:a})}catch(t){console.log("worker: on reply error"),console.log("type",e.data.type),console.log("response.error",t),self.postMessage({success:!1,response:{error:t}})}};
