'use strict';

importScripts("../../../build/wasm-cryptopp.js");
class CrytpoppWasmModule {
    static _wasmModule;
    static async load() {
        // await scriptLoadingUtility("../../build/wasm-cryptopp.js");
        // await importScripts("../../build/wasm-cryptopp.js");
        await CrytpoppWasmModule.rawLoad();
    }
    static async rawLoad() {
        // @ts-ignore
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

const isInitialize = (data) => data?.type === StrategiesTypes$1.initialize;
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
    CrytpoppWasmModule.get();
    _secureContextMap.set(keyStr, {
        _data: {},
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

const isCreateSecureContext = (data) => data?.type === StrategiesTypes$1.create_secure_context;
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

const isGenerateCipherKey = (data) => data?.type === StrategiesTypes$1.derive_rsa_keys;
const deriveRsaKeys = async (data) => {
    if (!isGenerateCipherKey(data)) {
        throw new Error('invalid payload');
    }
    const loadStartTime = Date.now();
    //
    //
    const secureContext = getSecureContext(data.id);
    secureContext._data = {}; // reset
    const wasmModule = CrytpoppWasmModule.get();
    {
        secureContext._data.password = data.password;
        // derive a bigger key from password (300bytes)
        const mySalt = "my salt";
        const myInfo = "my info";
        // totalToDerive(332) = entropy(100) + nonce(100) + personalization(100) + ivValue(32)
        // const k_size = 332;
        const k_size = 300;
        secureContext._data.derivedKey = wasmModule.deriveSha256HexStrKeyFromHexStrData(secureContext._data.password, mySalt, myInfo, k_size);
        secureContext._data.entropy = secureContext._data.derivedKey.slice(0, 100);
        secureContext._data.nonce = secureContext._data.derivedKey.slice(100, 200);
        secureContext._data.personalization = secureContext._data.derivedKey.slice(200, 300);
        // secureContext._data.ivValue = secureContext._data.derivedKey.slice(300, 332);
    }
    // use derived key deterministic random generator
    {
        if (secureContext.prng) {
            secureContext.prng.delete();
            secureContext.prng = undefined;
        }
        secureContext.prng = new wasmModule.HashDrbgRandomGeneratorJs(secureContext._data.entropy, secureContext._data.nonce, secureContext._data.personalization);
    }
    // use random generator to generate private/public RSA keys
    {
        if (secureContext.privateRsaKey) {
            secureContext.privateRsaKey.delete();
            secureContext.privateRsaKey = undefined;
        }
        secureContext.privateRsaKey = new wasmModule.RSAPrivateKeyJs();
        secureContext.privateRsaKey.generateRandomWithKeySizeUsingHashDrbg(secureContext.prng, data.keySize);
        secureContext._data.privateKeyPem = secureContext.privateRsaKey.getAsPemString();
    }
    {
        if (secureContext.publicRsaKey) {
            secureContext.publicRsaKey.delete();
            secureContext.publicRsaKey = undefined;
        }
        secureContext.publicRsaKey = new wasmModule.RSAPublicKeyJs();
        secureContext.publicRsaKey.setFromPrivateKey(secureContext.privateRsaKey);
        secureContext._data.publicKeyPem = secureContext.publicRsaKey.getAsPemString();
    }
    //
    //
    const loadEndTime = Date.now();
    const elapsedTime = loadEndTime - loadStartTime;
    return {
        elapsedTime,
        privateKeyPem: secureContext._data.privateKeyPem,
        publicKeyPem: secureContext._data.publicKeyPem,
        // ivValue: secureContext._data.ivValue,
    };
};

/// <reference no-default-lib="true"/>
const _strategiesMap = new Map([
    [StrategiesTypes$1.initialize, initializeStrategy],
    [StrategiesTypes$1.create_secure_context, createSecureContextStrategy],
    [StrategiesTypes$1.derive_rsa_keys, deriveRsaKeys],
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
        if (typeof (err) === 'number') {
            const wasmModule = CrytpoppWasmModule.get();
            const errMsg = wasmModule.getExceptionMessage(err);
            err = new Error(errMsg);
        }
        console.log("worker: on reply error");
        console.log("type", event.data.type);
        console.log("response.error", err);
        self.postMessage({
            success: false,
            response: { error: err }
        });
    }
};
