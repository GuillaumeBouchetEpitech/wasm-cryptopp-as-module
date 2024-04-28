'use strict';

var StrategiesTypes$1;
(function (StrategiesTypes) {
    StrategiesTypes["initialize"] = "initialize";
    StrategiesTypes["create_secure_context"] = "create_secure_context";
    StrategiesTypes["derive_rsa_keys"] = "derive_rsa_keys";
})(StrategiesTypes$1 || (StrategiesTypes$1 = {}));
//
//
//

var StrategiesTypes;
(function (StrategiesTypes) {
    StrategiesTypes["initialize"] = "initialize";
    StrategiesTypes["create_secure_context"] = "create_secure_context";
    StrategiesTypes["generate_diffie_hellman_keys"] = "generate_diffie_hellman_keys";
    StrategiesTypes["compute_diffie_hellman_shared_secret"] = "compute_diffie_hellman_shared_secret";
})(StrategiesTypes || (StrategiesTypes = {}));
//
//
//

importScripts("../../../build/wasm-cryptopp.js");
class CrytpoppWasmModule {
    static _wasmModule;
    static async load() {
        // await scriptLoadingUtility("../../build/wasm-cryptopp.js");
        // await importScripts("../../build/wasm-cryptopp.js");
        await CrytpoppWasmModule.rawLoad();
    }
    static async rawLoad() {
        CrytpoppWasmModule._wasmModule = await wasmCryptoppJs({
            locateFile: (url) => {
                console.log(`url: "${url}"`);
                return `../../../build/${url}`;
            },
        });
    }
    static get() {
        if (!this._wasmModule)
            throw new Error("crytpopp wasm module not loaded");
        return this._wasmModule;
    }
}

const isInitialize = (data) => data?.type === StrategiesTypes.initialize;
const initializeStrategy = async (data) => {
    if (!isInitialize(data)) {
        throw new Error('invalid payload');
    }
    const loadStartTime = Date.now();
    await CrytpoppWasmModule.load();
    const loadEndTime = Date.now();
    const elapsedTime = loadEndTime - loadStartTime;
    console.log(`worker, wasmCryptoppJs wasm module loaded (${elapsedTime}ms)`);
    return {
        elapsedTime,
    };
};

let idVal = 0;
const _secureContextMap = new Map();
const createNewSecureContext = () => {
    idVal += 1;
    const keyStr = `${idVal}`;
    const wasmModule = CrytpoppWasmModule.get();
    _secureContextMap.set(keyStr, {
        diffieHellmanClient: new wasmModule.DiffieHellmanClientJs(),
        aesSymmetricCipher: new wasmModule.AesSymmetricCipherJs(),
    });
    return keyStr;
};
const getSecureContext = (keyStr) => {
    const value = _secureContextMap.get(keyStr);
    if (!value) {
        throw new Error(`secure context not found: "${keyStr}"`);
    }
    return value;
};

const isCreateSecureContext = (data) => data?.type === StrategiesTypes.create_secure_context;
const createSecureContextStrategy = async (data) => {
    if (!isCreateSecureContext(data)) {
        throw new Error('invalid payload');
    }
    const loadStartTime = Date.now();
    //
    //
    //
    const newKeyStr = createNewSecureContext();
    //
    //
    //
    const loadEndTime = Date.now();
    const elapsedTime = loadEndTime - loadStartTime;
    return { elapsedTime, id: newKeyStr };
};

const isGenerateCipherKey = (data) => data?.type === StrategiesTypes.generate_diffie_hellman_keys;
const generateDiffieHellmanKeysStrategy = async (data) => {
    if (!isGenerateCipherKey(data)) {
        throw new Error('invalid payload');
    }
    const loadStartTime = Date.now();
    //
    //
    const secureContext = getSecureContext(data.id);
    secureContext.diffieHellmanClient.generateRandomKeysSimpler();
    secureContext.publicKey = secureContext.diffieHellmanClient.getPublicKeyAsHexStr();
    //
    //
    const loadEndTime = Date.now();
    const elapsedTime = loadEndTime - loadStartTime;
    return {
        elapsedTime,
        publicKey: secureContext.publicKey,
    };
};

const isProcessSecurityRequest = (data) => data?.type === StrategiesTypes.compute_diffie_hellman_shared_secret;
const computeDiffieHellmanSharedSecretStrategy = async (data) => {
    if (!isProcessSecurityRequest(data)) {
        throw new Error('invalid payload');
    }
    const loadStartTime = Date.now();
    //
    //
    const secureContext = getSecureContext(data.id);
    secureContext.diffieHellmanClient.computeSharedSecretFromHexStr(data.publicKey);
    secureContext.sharedSecret = secureContext.diffieHellmanClient.getSharedSecretAsHexStr();
    //
    //
    const loadEndTime = Date.now();
    const elapsedTime = loadEndTime - loadStartTime;
    return {
        elapsedTime,
        sharedSecret: secureContext.sharedSecret,
    };
};

/// <reference no-default-lib="true"/>
const _strategiesMap = new Map([
    [StrategiesTypes.initialize, initializeStrategy],
    [StrategiesTypes.create_secure_context, createSecureContextStrategy],
    [StrategiesTypes.generate_diffie_hellman_keys, generateDiffieHellmanKeysStrategy],
    [StrategiesTypes.compute_diffie_hellman_shared_secret, computeDiffieHellmanSharedSecretStrategy],
]);
self.onmessage = async (event) => {
    console.log("worker: on message");
    console.log("type", event.data.type);
    console.log("message.data", event.data);
    try {
        const currStrategy = _strategiesMap.get(event.data?.type);
        if (!currStrategy) {
            throw new Error(`unknown strategy "${event.data?.type}"`);
        }
        const response = await currStrategy(event.data);
        console.log("worker: on reply");
        console.log("type", event.data.type);
        console.log("response", response);
        self.postMessage({ success: true, response });
    }
    catch (err) {
        console.log("worker: on reply error");
        console.log("type", event.data.type);
        console.log("response.error", err);
        self.postMessage({ success: false, response: { error: err } });
    }
};
