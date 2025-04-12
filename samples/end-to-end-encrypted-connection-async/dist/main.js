'use strict';

const scriptLoadingUtility = (inSrc) => {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement("script");
        scriptElement.src = inSrc;
        // scriptElement.onprogress = (event) => logger.log("event", event);
        scriptElement.addEventListener('load', resolve);
        scriptElement.addEventListener('error', reject);
        document.head.appendChild(scriptElement);
    });
};

class Logger {
    _parentElement;
    constructor(parentElement) {
        this._parentElement = parentElement;
        this._clear();
    }
    static makeBorder(inStr) {
        return `<span style="padding: 10px; margin: 10px; border: 3px solid; border-color: rgb(64, 64, 64); line-height: 5.8;">${inStr}</span>`;
    }
    // makeColor(inColor: [number, number, number], inStr: string) {
    //   return Logger.makeColor(inColor, inStr);
    // }
    static makeColor(inColor, inStr) {
        return `<span style="color: rgb(${inColor[0]}, ${inColor[1]}, ${inColor[2]});">${inStr}</span>`;
    }
    // makeSize(inSize: number, inStr: string) {
    //   return Logger.makeSize(inSize, inStr);
    // }
    static makeSize(inSize, inStr) {
        return `<span style="font-size: ${inSize}px;">${inStr}</span>`;
    }
    alignedLog(align, ...args) {
        const text = args.join(' ').split("\n").join("<br>") + "<br>";
        const newParagraph = document.createElement("p");
        newParagraph.innerHTML = text;
        newParagraph.style = `text-align: ${align};`; // TODO
        this._parentElement.appendChild(newParagraph);
    }
    log(...args) {
        this.alignedLog.apply(this, ["left", ...args]);
    }
    logLeft(...args) {
        this.alignedLog.apply(this, ["left", ...args]);
    }
    logRight(...args) {
        this.alignedLog.apply(this, ["right", ...args]);
    }
    logCenter(...args) {
        this.alignedLog.apply(this, ["center", ...args]);
    }
    error(...args) {
        this.alignedLog.apply(this, ["center", 'ERR', ...args]);
    }
    _clear() {
        while (this._parentElement.firstChild)
            this._parentElement.removeChild(this._parentElement.lastChild);
    }
}

class CrytpoppWasmModule {
    static _wasmModule;
    static async load() {
        await scriptLoadingUtility("../../build/wasm-cryptopp.js");
        await CrytpoppWasmModule.rawLoad();
    }
    static async rawLoad() {
        CrytpoppWasmModule._wasmModule = await wasmCryptoppJs({
            locateFile: (url) => {
                console.log(`url: "${url}"`);
                return `../../build/${url}`;
            },
        });
    }
    static get() {
        if (!this._wasmModule)
            throw new Error("crytpopp wasm module not loaded");
        return this._wasmModule;
    }
}

const printHexadecimalStrings$1 = (logger, inHexStr, inStep, inAlign) => {
    const strSize = inHexStr.length.toString();
    let index = 0;
    while (index < inHexStr.length) {
        const currLine = inHexStr.substr(index, inStep);
        let currText = currLine;
        if (index > 0)
            currText = currText.padEnd(inStep, '_');
        const coloredText = Logger.makeColor([128, 128, 64], currText);
        switch (inAlign) {
            case "left": {
                logger.alignedLog(inAlign, ` => {${index.toString().padStart(3, '_')} / ${strSize}} ${coloredText}`);
                break;
            }
            case "right": {
                logger.alignedLog(inAlign, `${coloredText} {${index.toString().padStart(3, '_')} / ${strSize}} <= `);
                break;
            }
            case "center": {
                logger.alignedLog(inAlign, `${coloredText}`);
                break;
            }
        }
        index += inStep;
    }
};

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

const _workerMessageOnce$1 = async (inWorker) => {
    return new Promise((resolve, reject) => {
        const _callback = (message) => {
            inWorker.removeEventListener('message', _callback);
            resolve(message.data);
        };
        try {
            inWorker.addEventListener('message', _callback);
        }
        catch (err) {
            try {
                inWorker.removeEventListener('message', _callback);
            }
            catch (ignored) { }
            reject(err);
        }
    });
};
const _requestWorkerOnce$1 = async (inWorker, inMsg) => {
    inWorker.postMessage(inMsg);
    return await _workerMessageOnce$1(inWorker);
};
const makeInitializeRequest$1 = async (inWorker) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.initialize
});
const makeCreateSecureContextRequest$1 = async (inWorker) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.create_secure_context
});
const makeGenerateDiffieHellmanKeyRequest = async (inWorker, id) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.generate_diffie_hellman_keys, id
});
const makeComputeDiffieHellmanSharedSecretRequest = async (inWorker, id, publicKey) => _requestWorkerOnce$1(inWorker, {
    type: StrategiesTypes.compute_diffie_hellman_shared_secret, id, publicKey
});
const isErrorResponse$1 = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.success === false &&
        typeof (inValue.response) === 'object');
};
//
//
//
class DiffieHellmanWorker {
    _workerInstance;
    _secureContextId;
    _publicKey;
    _sharedSecret;
    constructor() {
    }
    async initialize() {
        if (this._workerInstance) {
            return;
        }
        {
            this._workerInstance = new Worker("./dist/worker-diffie-hellman.js");
            const message = await makeInitializeRequest$1(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
        }
        {
            const message = await makeCreateSecureContextRequest$1(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
            this._secureContextId = message.response.id;
        }
    }
    async dispose() {
        if (!this._workerInstance) {
            return;
        }
        this._workerInstance.terminate();
        this._workerInstance = undefined;
        this._secureContextId = undefined;
        this._publicKey = undefined;
        this._sharedSecret = undefined;
    }
    async generateDiffieHellmanKeys() {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeGenerateDiffieHellmanKeyRequest(this._workerInstance, this._secureContextId);
        if (isErrorResponse$1(message)) {
            throw new Error(message.response.error);
        }
        this._publicKey = message.response.publicKey;
        return message.response.elapsedTime;
    }
    async computeDiffieHellmanSharedSecret(publicKey) {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeComputeDiffieHellmanSharedSecretRequest(this._workerInstance, this._secureContextId, publicKey);
        if (isErrorResponse$1(message)) {
            throw new Error(message.response.error);
        }
        this._sharedSecret = message.response.sharedSecret;
        return message.response.elapsedTime;
    }
    get publicKey() {
        return this._publicKey;
    }
    get sharedSecret() {
        return this._sharedSecret;
    }
}

const _workerMessageOnce = async (inWorker) => {
    return new Promise((resolve, reject) => {
        const _callback = (message) => {
            inWorker.removeEventListener('message', _callback);
            resolve(message.data);
        };
        try {
            inWorker.addEventListener('message', _callback);
        }
        catch (err) {
            try {
                inWorker.removeEventListener('message', _callback);
            }
            catch (ignored) { }
            reject(err);
        }
    });
};
const _requestWorkerOnce = async (inWorker, inMsg) => {
    inWorker.postMessage(inMsg);
    return await _workerMessageOnce(inWorker);
};
const makeInitializeRequest = async (inWorker) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.initialize
});
const makeCreateSecureContextRequest = async (inWorker) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.create_secure_context
});
const makeDeriveRsaKeysRequest = async (inWorker, id, password, keySize) => _requestWorkerOnce(inWorker, {
    type: StrategiesTypes$1.derive_rsa_keys, id, password, keySize
});
const isErrorResponse = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.success === false &&
        typeof (inValue.response) === 'object');
};
//
//
//
class DeriveRsaKeysWorker {
    _workerInstance;
    _secureContextId;
    _privateKeyPem;
    _publicKeyPem;
    // private _ivValue?: string;
    constructor() {
    }
    async initialize() {
        if (this._workerInstance) {
            return;
        }
        {
            this._workerInstance = new Worker("./dist/worker-derive-rsa-key.js");
            const message = await makeInitializeRequest(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
        }
        {
            const message = await makeCreateSecureContextRequest(this._workerInstance);
            console.log('message.success', message.success);
            console.log('message.response', message.response);
            this._secureContextId = message.response.id;
        }
    }
    async dispose() {
        if (!this._workerInstance) {
            return;
        }
        this._workerInstance.terminate();
        this._workerInstance = undefined;
        this._secureContextId = undefined;
        this._privateKeyPem = undefined;
        this._publicKeyPem = undefined;
        // this._ivValue = undefined;
    }
    async deriveRsaKeys(password, keySize) {
        if (!this._workerInstance) {
            throw new Error("worker not initialized");
        }
        if (!this._secureContextId) {
            throw new Error("secure context not initialized");
        }
        const message = await makeDeriveRsaKeysRequest(this._workerInstance, this._secureContextId, password, keySize);
        if (isErrorResponse(message)) {
            throw new Error(message.response.error);
        }
        this._privateKeyPem = message.response.privateKeyPem;
        this._publicKeyPem = message.response.publicKeyPem;
        // this._ivValue = message.response.ivValue;
        // this._ivValue = message.response.ivValue.slice(0, 13*2); // reduce iv size from 16 to 13
        return message.response.elapsedTime;
    }
    makeRsaKeyPair() {
        if (!this._privateKeyPem) {
            throw new Error(`no public key derived`);
        }
        if (!this._publicKeyPem) {
            throw new Error(`no public key derived`);
        }
        return new RsaKeyPair(this._privateKeyPem, this._publicKeyPem);
    }
    get privateKeyPem() {
        return this._privateKeyPem;
    }
    get publicKeyPem() {
        return this._publicKeyPem;
    }
}
//
//
//
class RsaKeyPair {
    _privateKey;
    _publicKey;
    _prng;
    constructor(privateKeyPem, publicKeyPem) {
        const wasmModule = CrytpoppWasmModule.get();
        this._prng = new wasmModule.AutoSeededRandomPoolJs();
        this._privateKey = new wasmModule.RSAPrivateKeyJs();
        this._publicKey = new wasmModule.RSAPublicKeyJs();
        this._privateKey.loadFromPemString(privateKeyPem);
        this._publicKey.loadFromPemString(publicKeyPem);
    }
    signPayloadToHexStr(payload) {
        const wasmModule = CrytpoppWasmModule.get();
        const hexPayload = wasmModule.utf8ToHex(payload);
        return this._privateKey.signFromHexStrToHexStrUsingAutoSeeded(this._prng, hexPayload);
    }
    verifyHexStrPayloadToStr(signedHexStrPayload) {
        const wasmModule = CrytpoppWasmModule.get();
        const verifiedHexPayload = this._publicKey.verifyFromHexStrToHexStr(signedHexStrPayload);
        return wasmModule.hexToUtf8(verifiedHexPayload);
    }
}

const getRandomHexStr = (inSize) => {
    const wasmModule = CrytpoppWasmModule.get();
    const prng = new wasmModule.AutoSeededRandomPoolJs();
    const randomHexStr = prng.getRandomHexStr(inSize);
    prng.delete();
    return randomHexStr;
};

//
//
//
var MessageTypes;
(function (MessageTypes) {
    MessageTypes["PlainMessage"] = "PlainMessage";
    MessageTypes["EncryptedMessage"] = "EncryptedMessage";
    MessageTypes["ErrorMessage"] = "ErrorMessage";
    MessageTypes["SecurityRequest"] = "SecurityRequest";
    MessageTypes["SecurityResponse"] = "SecurityResponse";
})(MessageTypes || (MessageTypes = {}));
const isBaseMessage = (inValue) => {
    return (typeof (inValue) === 'object' &&
        typeof (inValue.type) === 'string');
};
const isPlainMessage = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.type === MessageTypes.PlainMessage &&
        typeof (inValue.plainText) === 'string');
};
const isEncryptedMessage = (inValue) => {
    return (typeof (inValue) === 'object' &&
        inValue.type === MessageTypes.EncryptedMessage &&
        typeof (inValue.encryptedMessage) === 'string' &&
        typeof (inValue.size) === 'number' &&
        typeof (inValue.ivValue) === 'string');
};
//
//
//
var EncryptedCommunicationState;
(function (EncryptedCommunicationState) {
    EncryptedCommunicationState[EncryptedCommunicationState["unencrypted"] = 0] = "unencrypted";
    EncryptedCommunicationState[EncryptedCommunicationState["initiated"] = 1] = "initiated";
    EncryptedCommunicationState[EncryptedCommunicationState["ready"] = 2] = "ready";
    EncryptedCommunicationState[EncryptedCommunicationState["confirmed"] = 3] = "confirmed";
})(EncryptedCommunicationState || (EncryptedCommunicationState = {}));
const isSecurityResponsePayload = (inValue) => {
    return (typeof (inValue) === 'object' &&
        typeof (inValue.signedPublicKey) === 'string' &&
        inValue.type === MessageTypes.SecurityResponse);
};
const isSecurityRequestPayload = (inValue) => {
    return (typeof (inValue) === 'object' &&
        typeof (inValue.signedPublicKey) === 'string' && (inValue.type === MessageTypes.SecurityRequest));
};
//
//
//

const printHexadecimalStrings = (onLogging, inHexStr, inStep) => {
    const strSize = inHexStr.length.toString();
    let index = 0;
    while (index < inHexStr.length) {
        const currLine = inHexStr.substr(index, inStep);
        let currText = currLine;
        if (index > 0) {
            currText = currText.padEnd(inStep, '_');
        }
        onLogging(` => {${index.toString().padStart(3, '_')} / ${strSize}} ${currText}`);
        index += inStep;
    }
};

//
//
//
//
//
//
class AsyncSecureClient {
    _wasDeleted = false;
    _password;
    _communication;
    _EncryptedCommunicationState = EncryptedCommunicationState.unencrypted;
    _onReceiveCallbacks = [];
    _onLogging;
    _diffieHellmanWorker;
    _deriveRsaKeysWorker;
    _rsaKeyPair;
    // AesSymmetricCipherJs -> AES CBC
    // private _aesSymmetricCipher: wasmCryptoppJs.AesSymmetricCipherJs;
    // // AesStreamCipherJs -> AES CTR
    // private _aesStreamCipher: wasmCryptoppJs.AesStreamCipherJs;
    // AuthenticatedEncryptionJs -> AES CCM (or GCM?)
    _aesStreamCipher;
    constructor(password, inCommunication, inOnLogging) {
        this._password = password;
        this._communication = inCommunication;
        this._onLogging = inOnLogging;
        const wasmModule = CrytpoppWasmModule.get();
        // this._aesSymmetricCipher = new wasmModule.AesSymmetricCipherJs();
        this._aesStreamCipher = new wasmModule.AuthenticatedEncryptionJs();
        this._communication.onReceive(async (inMsg) => {
            await this._processReceivedClientMessage(inMsg);
        });
    }
    async initialize() {
        this._diffieHellmanWorker = new DiffieHellmanWorker();
        this._deriveRsaKeysWorker = new DeriveRsaKeysWorker();
        await Promise.all([
            this._diffieHellmanWorker.initialize(),
            this._deriveRsaKeysWorker.initialize(),
        ]);
    }
    delete() {
        this._aesStreamCipher.delete();
        this._diffieHellmanWorker?.dispose();
        this._deriveRsaKeysWorker?.dispose();
        this._wasDeleted = true;
    }
    //region Make Secure
    async makeSecure() {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        if (!this._diffieHellmanWorker) {
            throw new Error("worker (workerObtainCipherKey) not initialized");
        }
        if (!this._deriveRsaKeysWorker) {
            throw new Error("worker (deriveRsaKeysWorker) not initialized");
        }
        this._log("now securing the connection");
        this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;
        // both can be inside a Promise.all([...])
        // -> but since it would mess up the logs of this demo...
        await this._generateDiffieHellmanKeys();
        await this._deriveRsaKeys();
        if (!this._diffieHellmanWorker.publicKey) {
            throw new Error("no public key generated");
        }
        // if (!this._deriveRsaKeysWorker.ivValue) {
        //   throw new Error("no iv value generated");
        // }
        // this._log(`message.response.ivValue`);
        // printHexadecimalStrings(this._log.bind(this), this._deriveRsaKeysWorker.ivValue, 32);
        if (!this._rsaKeyPair) {
            throw new Error("Rsa Key Pair not initialized");
        }
        this._log("signing our public key for the peer");
        const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);
        this._log(Logger.makeColor([128, 128 + 64, 128], `here by signing the payload with the key only known from`));
        this._log(Logger.makeColor([128, 128 + 64, 128], `us and our peer, we ensure that we are talking to`));
        this._log(Logger.makeColor([128, 128 + 64, 128], `our peer and only to them, meaning no bad actor`));
        this._log(Logger.makeColor([128, 128 + 64, 128], `in the middle can usurp the identity of our peer and listen`));
        this._log("sending our signed public key to the peer");
        // this._log(Logger.makeColor([128,128 + 64,128], Logger.makeSize(25, `input password: "${this._password}"`)));
        // this._log(Logger.makeColor([128,128 + 64,128], `input password: "${this._password}"`));
        this._communication.send(JSON.stringify({
            type: MessageTypes.SecurityRequest,
            signedPublicKey,
        }));
    }
    //endregion Make Secure
    send(inText) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        if (this._EncryptedCommunicationState === EncryptedCommunicationState.initiated) {
            throw new Error("cannot send while securing the connection");
        }
        if (this._EncryptedCommunicationState === EncryptedCommunicationState.unencrypted) {
            this._log(`sending a message:`, "[unencrypted]");
            this._log(`"${inText}"`, "[unencrypted]");
            this._communication.send(JSON.stringify({
                type: MessageTypes.PlainMessage,
                plainText: inText
            }));
            return;
        }
        if (!this._deriveRsaKeysWorker) {
            throw new Error("worker (deriveRsaKeysWorker) not initialized");
        }
        // if (!this._deriveRsaKeysWorker.ivValue) {
        //   throw new Error("iv value not initialized");
        // }
        try {
            this._log(`sending a message:`, "[encrypted]");
            this._log(`"${inText}"`, "[encrypted]");
            this._log(`encrypting`, "[encrypted]");
            const startTime = Date.now();
            const ivValue = getRandomHexStr(13);
            // console.log({ivValue})
            const wasmModule = CrytpoppWasmModule.get();
            const textAsHex = wasmModule.utf8ToHex(inText);
            // const encrypted = this._aesStreamCipher.encryptFromHexStrAsHexStr(textAsHex);
            // const encrypted = this._aesStreamCipher.encryptFromHexStrAsHexStr(textAsHex, this._deriveRsaKeysWorker.ivValue);
            const encrypted = this._aesStreamCipher.encryptFromHexStrAsHexStr(textAsHex, ivValue);
            const endTime = Date.now();
            this._log(`encrypted (${endTime - startTime}ms)`, "[encrypted]");
            // this._communication.send(JSON.stringify({ type: MessageTypes.EncryptedMessage, payload: encrypted }));
            this._communication.send(JSON.stringify({
                type: MessageTypes.EncryptedMessage,
                encryptedMessage: encrypted,
                size: inText.length,
                // ivValue: this._deriveRsaKeysWorker.ivValue,
                ivValue
            }));
        }
        catch (err) {
            console.log(err);
            if (typeof (err) === 'number') {
                const wasmModule = CrytpoppWasmModule.get();
                console.log(wasmModule.getExceptionMessage(err));
            }
            else {
                console.log(err);
            }
            throw err;
        }
    }
    onReceive(inCallback) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        this._onReceiveCallbacks.push(inCallback);
    }
    get EncryptedCommunicationState() {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        return this._EncryptedCommunicationState;
    }
    //region Process Message
    async _processReceivedClientMessage(inText) {
        if (this._wasDeleted) {
            throw new Error("was deleted");
        }
        const jsonMsg = JSON.parse(inText);
        if (!isBaseMessage(jsonMsg)) {
            throw new Error("received message structure unrecognized");
        }
        this._log(`received message, type: "${jsonMsg.type}"`);
        if (isPlainMessage(jsonMsg)) {
            this._onReceiveCallbacks.forEach((callback) => callback(jsonMsg.plainText));
            return;
        }
        if (isEncryptedMessage(jsonMsg)) {
            this._log("decrypting");
            const startTime = Date.now();
            try {
                const recovered = this._aesStreamCipher.decryptFromHexStrAsHexStr(jsonMsg.encryptedMessage, jsonMsg.size, jsonMsg.ivValue);
                const wasmModule = CrytpoppWasmModule.get();
                const plainText = wasmModule.hexToUtf8(recovered);
                const endTime = Date.now();
                this._log(`decrypted (${endTime - startTime}ms)`);
                if (this._EncryptedCommunicationState === EncryptedCommunicationState.ready) {
                    this._log("connection now confirmed secure");
                    this._EncryptedCommunicationState = EncryptedCommunicationState.confirmed;
                }
                else if (this._EncryptedCommunicationState !== EncryptedCommunicationState.confirmed) {
                    throw new Error("was expecting to be in a secure state");
                }
                this._onReceiveCallbacks.forEach((callback) => callback(plainText));
            }
            catch (err) {
                console.log(err);
                if (typeof (err) === 'number') {
                    const wasmModule = CrytpoppWasmModule.get();
                    console.log(wasmModule.getExceptionMessage(err));
                }
                else {
                    console.log(err);
                }
                throw err;
            }
            return;
        }
        if (isSecurityRequestPayload(jsonMsg)) {
            this._log("now securing the connection");
            this._EncryptedCommunicationState = EncryptedCommunicationState.initiated;
            if (!this._diffieHellmanWorker) {
                throw new Error("worker (workerObtainCipherKey) not initialized");
            }
            // both can be inside a Promise.all([...])
            // -> but since it would mess up the logs of this demo...
            await this._deriveRsaKeys();
            await this._generateDiffieHellmanKeys();
            if (!this._rsaKeyPair) {
                throw new Error("Rsa Key Pair not initialized");
            }
            this._log("verifying signed public key from the peer");
            const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonMsg.signedPublicKey);
            this._log(Logger.makeColor([128, 128 + 64, 128], `here we verify the signed key from our peer, by doing so we can`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `confirm the peer is someone that used the same password only known`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `from us and our peer(s), which is vital to prevent someone`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `listening in the middle (bad actors)`));
            await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
            await this._initializeAesSymmetricCipher();
            this._EncryptedCommunicationState = EncryptedCommunicationState.ready;
            if (!this._diffieHellmanWorker.publicKey) {
                throw new Error("missing public key");
            }
            this._log("signing our public key for the peer");
            const signedPublicKey = this._rsaKeyPair.signPayloadToHexStr(this._diffieHellmanWorker.publicKey);
            this._log(Logger.makeColor([128, 128 + 64, 128], `here by signing the payload with the key only known from`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `us and our peer, we ensure that we are talking to`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `our peer and only to them, meaning no bad actor`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `in the middle can usurp the identity of our peer and listen`));
            this._log("sending our signed public key to the peer");
            this._communication.send(JSON.stringify({
                type: MessageTypes.SecurityResponse,
                signedPublicKey: signedPublicKey,
            }));
            return;
        }
        if (isSecurityResponsePayload(jsonMsg)) {
            this._log("processing received security response");
            if (this._EncryptedCommunicationState !== EncryptedCommunicationState.initiated) {
                throw new Error("was expecting a security response");
            }
            this._log("computing the shared secret with the received public key");
            if (!this._rsaKeyPair) {
                throw new Error("Rsa Key Pair not initialized");
            }
            this._log("verifying signed public key of the peer");
            const verifiedPublicKey = this._rsaKeyPair.verifyHexStrPayloadToStr(jsonMsg.signedPublicKey);
            this._log(Logger.makeColor([128, 128 + 64, 128], `here we verify the signed key from our peer, by doing so we can`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `confirm the peer is someone that used the same password only known`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `from us and our peer(s), which is vital to prevent someone`));
            this._log(Logger.makeColor([128, 128 + 64, 128], `listening in the middle (bad actors)`));
            await this._computeDiffieHellmanSharedSecret(verifiedPublicKey);
            await this._initializeAesSymmetricCipher();
            this._log("connection now confirmed secure");
            this._EncryptedCommunicationState = EncryptedCommunicationState.ready;
            return;
        }
        throw new Error(`received message type unsupported, type: "${jsonMsg.type}"`);
    }
    //endregion Process Message
    _log(inLogMsg, inLogHeader) {
        if (this._onLogging) {
            this._onLogging(inLogMsg, inLogHeader);
        }
    }
    //region Helpers
    async _generateDiffieHellmanKeys() {
        this._log("------------------------------------");
        this._log("Diffie Hellman Key Exchange");
        this._log("generating public/private keys");
        this._log("2048-bit MODP Group with 256-bit Prime Order Subgroup");
        if (!this._diffieHellmanWorker) {
            throw new Error("worker (workerObtainCipherKey) not initialized");
        }
        const elapsed = await this._diffieHellmanWorker.generateDiffieHellmanKeys();
        this._log(`diffieHellmanWorker.publicKey`);
        printHexadecimalStrings(this._log.bind(this), this._diffieHellmanWorker.publicKey, 32);
        this._log(`generated public/private keys (${elapsed}ms)`);
        this._log("------------------------------------");
    }
    async _deriveRsaKeys() {
        if (!this._deriveRsaKeysWorker) {
            throw new Error("worker (deriveRsaKeysWorker) not initialized");
        }
        // const keySize = 1024 * 3; // actually safe
        const keySize = 1024 * 1; // faster for the demo but unsafe
        this._log("------------------------------------");
        this._log(`Derive Rsa Keys`);
        this._log(Logger.makeColor([128, 128 + 64, 128], Logger.makeSize(30, `input password: "${this._password}"`)));
        this._log(`input key size: ${keySize}`);
        this._log(Logger.makeColor([128, 128 + 64, 128], `(key size is likely smaller for this demo)`));
        this._log(Logger.makeColor([128, 128 + 64, 128], `(safe key size at the moment of writing is at least >=${1024 * 3})`));
        let elapsedTime = await this._deriveRsaKeysWorker.deriveRsaKeys(this._password, keySize);
        this._log("output privateKeyPem");
        this._log(this._deriveRsaKeysWorker.privateKeyPem);
        this._log("output publicKeyPem");
        this._log(this._deriveRsaKeysWorker.publicKeyPem);
        // this._log("output ivValue");
        // printHexadecimalStrings(this._log.bind(this), this._deriveRsaKeysWorker.ivValue!, 32);
        this._log(Logger.makeColor([128, 128 + 64, 128], `those value will be the same for the peer`));
        this._log(Logger.makeColor([128, 128 + 64, 128], `since the same password was used`));
        this._log(`Derive Rsa Keys done (elapsedTime: ${elapsedTime}ms)`);
        this._log("------------------------------------");
        this._rsaKeyPair = this._deriveRsaKeysWorker.makeRsaKeyPair();
    }
    async _computeDiffieHellmanSharedSecret(publicKey) {
        if (!this._diffieHellmanWorker) {
            throw new Error("worker (workerObtainCipherKey) not initialized");
        }
        this._log("------------------------------------");
        this._log("Diffie Hellman Key Exchange");
        this._log(`computing shared secret`);
        this._log(`input publicKey`);
        printHexadecimalStrings(this._log.bind(this), publicKey, 32);
        const elapsed = await this._diffieHellmanWorker.computeDiffieHellmanSharedSecret(publicKey);
        this._log(`output sharedSecret`);
        printHexadecimalStrings(this._log.bind(this), this._diffieHellmanWorker.sharedSecret, 32);
        this._log(`computed shared secret (${elapsed}ms)`);
        this._log("------------------------------------");
    }
    async _initializeAesSymmetricCipher() {
        if (!this._deriveRsaKeysWorker) {
            throw new Error("worker (deriveRsaKeysWorker) not initialized");
        }
        // if (!this._deriveRsaKeysWorker.ivValue) {
        //   throw new Error("iv value not initialized");
        // }
        if (!this._diffieHellmanWorker) {
            throw new Error("worker (workerObtainCipherKey) not initialized");
        }
        if (!this._diffieHellmanWorker.sharedSecret) {
            throw new Error("shared secret not initialized");
        }
        this._log("------------------------------------");
        this._log("AES GCM (Stream) Cipher");
        this._log("initializing");
        this._log("256bits key from computed shared secret");
        const startTime = Date.now();
        // this._aesStreamCipher.initializeFromHexStr(
        //   this._diffieHellmanWorker.sharedSecret.slice(0, 64), // 64hex -> 32bytes ->  256bits key
        //   this._deriveRsaKeysWorker.ivValue,
        // );
        this._aesStreamCipher.initializeFromHexStr(this._diffieHellmanWorker.sharedSecret.slice(0, 64));
        const endTime = Date.now();
        this._log(`initialized (${endTime - startTime}ms)`);
        this._log("------------------------------------");
    }
}

const k_plainMessagetext = [
    "/!\\",
    "UNENCRYPTED MESSAGE",
    "ANYONE LISTENING CAN SEE IT",
    "/!\\",
].join("\n");
const k_encryptedMessagetext = [
    "(OK)",
    "ENCRYPTED MESSAGE",
    "GOOD LUCK TO ANYONE LISTENING",
    "(OK)",
].join("\n");
const k_securityMessagetext = [
    "(OK)",
    "NO COMPROMISING INFORMATION SHARED",
    "GOOD LUCK TO ANYONE LISTENING",
    "(OK)",
].join("\n");
const logSeparator = (logger, inAlign, jsonMsg) => {
    if (jsonMsg.type === MessageTypes.PlainMessage) {
        logger.alignedLog(inAlign, Logger.makeColor([128, 64, 64], k_plainMessagetext));
    }
    else if (jsonMsg.type === MessageTypes.EncryptedMessage) {
        logger.alignedLog(inAlign, Logger.makeColor([64, 128, 64], k_encryptedMessagetext));
    }
    else if (jsonMsg.type === MessageTypes.SecurityRequest || jsonMsg.type === MessageTypes.SecurityResponse) {
        logger.alignedLog(inAlign, Logger.makeColor([64, 128, 64], k_securityMessagetext));
    }
};
const logMessagePayload = (logger, inAlign, inText) => {
    const jsonMsg = JSON.parse(inText);
    if (!isBaseMessage(jsonMsg)) {
        throw new Error("unknown message format");
    }
    logSeparator(logger, inAlign, jsonMsg);
    logger.alignedLog(inAlign, `type:`);
    logger.alignedLog(inAlign, Logger.makeColor([128 + 64, 128 + 64, 64], `"${jsonMsg.type}"`));
    if (isPlainMessage(jsonMsg)) {
        logger.alignedLog(inAlign, `payload:`);
        logger.alignedLog(inAlign, Logger.makeColor([128 + 64, 64, 64], Logger.makeSize(25, `"${jsonMsg.plainText}"`)));
        logSeparator(logger, inAlign, jsonMsg);
        return;
    }
    if (isEncryptedMessage(jsonMsg)) {
        logger.alignedLog(inAlign, `encryptedMessage:`);
        printHexadecimalStrings$1(logger, jsonMsg.encryptedMessage, 64, inAlign);
        logger.alignedLog(inAlign, `size:`);
        logger.alignedLog(inAlign, jsonMsg.size);
        logger.alignedLog(inAlign, `ivValue:`);
        printHexadecimalStrings$1(logger, jsonMsg.ivValue, 64, inAlign);
        logSeparator(logger, inAlign, jsonMsg);
        return;
    }
    if (isSecurityRequestPayload(jsonMsg) ||
        isSecurityResponsePayload(jsonMsg)) {
        logger.alignedLog(inAlign, `payload.signedPublicKey:`);
        printHexadecimalStrings$1(logger, jsonMsg.signedPublicKey, 64, inAlign);
        logSeparator(logger, inAlign, jsonMsg);
        return;
    }
    throw new Error("unknown message type");
};

class FakeWebSocket {
    _logger;
    _logTextAlign;
    _myName;
    _otherName;
    _transitionStr;
    _allSentMessages = [];
    _allOnReceiveCallbacks = [];
    constructor(inLogger, inLogTextAlign, inMyName, inOtherName) {
        this._logger = inLogger;
        this._logTextAlign = inLogTextAlign;
        this._myName = inMyName;
        this._otherName = inOtherName;
        this._transitionStr = inLogTextAlign === "right" ? "<-----" : "----->";
    }
    send(inText) {
        this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" sent a message\n`);
        this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
        logMessagePayload(this._logger, 'center', inText);
        this._logger.alignedLog('center', `"${this._myName}" ${this._transitionStr} "${this._otherName}"`);
        this._logger.alignedLog("center", "\n");
        this._allSentMessages.push(inText);
    }
    async receive(inText) {
        this._logger.alignedLog(this._logTextAlign, `fake websocket "${this._myName}" received a message`);
        for (const callback of this._allOnReceiveCallbacks) {
            await callback(inText);
        }
    }
    onReceive(inCallback) {
        this._allOnReceiveCallbacks.push(inCallback);
    }
    async pipeMessages(other) {
        for (const inText of this._allSentMessages) {
            await other.receive(inText);
        }
        this._allSentMessages.length = 0;
    }
    hasMessageToSend() {
        return this._allSentMessages.length > 0;
    }
}

const runLogic = async (logger) => {
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("Secure End To End Connection Test"))));
    const clientA_str = Logger.makeColor([128 + 64, 128, 128], "Client A");
    const clientB_str = Logger.makeColor([128, 128, 128 + 64], "Client B");
    //
    //
    //
    const fakeWebSocketA = new FakeWebSocket(logger, 'left', clientA_str, clientB_str);
    const fakeWebSocketB = new FakeWebSocket(logger, 'right', clientB_str, clientA_str);
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`initialize`));
    const onLogA = (inLogMsg, inLogHeader) => {
        if (inLogHeader) {
            logger.logLeft(`${inLogHeader} ${inLogMsg}`);
        }
        else {
            logger.logLeft(inLogMsg);
        }
    };
    const onLogB = (inLogMsg, inLogHeader) => {
        if (inLogHeader) {
            logger.logRight(`${inLogMsg} ${inLogHeader}`);
        }
        else {
            logger.logRight(inLogMsg);
        }
    };
    // must only be known by both clients
    // must never be shared over the network
    const knownPassword = "pineapple";
    logger.logLeft(`${clientA_str} created`);
    const clientA = new AsyncSecureClient(knownPassword, fakeWebSocketA, onLogA);
    logger.logRight(`${clientB_str} created`);
    const clientB = new AsyncSecureClient(knownPassword, fakeWebSocketB, onLogB);
    clientA.onReceive(async (inText) => {
        logger.alignedLog("left", `${clientA_str} received:`);
        logger.alignedLog("left", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${inText}"`)));
        logger.alignedLog("left", `\n`);
    });
    clientB.onReceive(async (inText) => {
        logger.alignedLog("right", `${clientB_str} received:`);
        logger.alignedLog("right", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${inText}"`)));
        logger.alignedLog("right", `\n`);
    });
    await Promise.all([
        clientA.initialize(),
        clientB.initialize(),
    ]);
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`[unencrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    const messageToSend = "Hello, is this safe?";
    logger.alignedLog("left", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${messageToSend}"`)));
    logger.log(`\n`);
    clientA.send(messageToSend);
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    logger.logCenter(Logger.makeBorder(`[unencrypted] Client B send to Client A`));
    logger.logRight(`${clientB_str} now sending a message:`);
    const messageToReply = "Hi, no... it isn't safe...";
    logger.alignedLog("right", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${messageToReply}"`)));
    logger.log(`\n`);
    clientB.send(messageToReply);
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    logger.logCenter(Logger.makeBorder(`[unencrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    const messageToSendAgain = "Let's use our usual password...";
    logger.alignedLog("left", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${messageToSendAgain}"`)));
    logger.log(`\n`);
    clientA.send(messageToSendAgain);
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    //
    //
    logger.logCenter(Logger.makeBorder(`Client A send request for encryption to Client B`));
    await clientA.makeSecure();
    while (fakeWebSocketA.hasMessageToSend() ||
        fakeWebSocketB.hasMessageToSend()) {
        await fakeWebSocketA.pipeMessages(fakeWebSocketB);
        await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    }
    logger.logCenter(Logger.makeBorder(`Client B sent a reply for encryption to Client B`));
    logger.logCenter(Logger.makeBorder(`Both Client A and Client B can now encrypt/decrypt each other messages`));
    //
    logger.logCenter(Logger.makeBorder(`[encrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    // const newMessageToSend = "Let's try again, safe now?";
    const newMessageToSend = `
    Let's try again, safe now?
    I mean... we only shared a DH public key,
    that stuff is not compromising
  `.split('\n').map(val => val.trim()).filter(val => val.length > 0).join('<br>');
    logger.alignedLog("left", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${newMessageToSend}"`)));
    logger.log(`\n`);
    clientA.send(newMessageToSend);
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    logger.logCenter(Logger.makeBorder(`[encrypted] Client B send to Client A`));
    logger.logRight(`${clientB_str} now sending a message:`);
    const newMessageToReply = `
    (MIM: man in the middle protection)
    I'd say we're pretty safe right now :),
    ...
    that public key was publicly shared on this
    network, but since we signed it with our secret
    password that is only known to us we have the
    proof that no one is impersonating any of us, which
    means any of what we share here cannot be understood
    by anyone that might listen.
  `.split('\n').map(val => val.trim()).filter(val => val.length > 0).join('<br>');
    logger.alignedLog("right", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${newMessageToReply}"`)));
    logger.log(`\n`);
    clientB.send(newMessageToReply);
    await fakeWebSocketB.pipeMessages(fakeWebSocketA);
    logger.logCenter(Logger.makeBorder(`[encrypted] Client A send to Client B`));
    logger.logLeft(`${clientA_str} now sending a message:`);
    // const newMessageToSendAgain = "Yup, And we can always get a new<br>randomly encrypted channel like this<br>one from the same password again";
    const newMessageToSendAgain = `
    (PFS: perfect forward secrecy)
    There is still a risk of someone breaking the
    encryption assuming they have several years
    worth of super computing power at their disposal
    ...
    But we can always periodically get a new randomly
    encrypted channel like this one from the same
    password again, which would multiply the number
    of years needed to break it all... :)
  `.split('\n').map(val => val.trim()).filter(val => val.length > 0).join('<br>');
    logger.alignedLog("left", Logger.makeColor([64, 128 + 64, 64], Logger.makeSize(25, `"${newMessageToSendAgain}"`)));
    logger.log(`\n`);
    clientA.send(newMessageToSendAgain);
    await fakeWebSocketA.pipeMessages(fakeWebSocketB);
    //
    //
    //
    clientA.delete();
    clientB.delete();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("Secure End To End Connection Test"))));
};

/// <reference no-default-lib="true"/>
// import { AsyncSecureClient } from "./logic/AsyncSecureClient";
const findOrFailHtmlElement = (inId) => {
    const htmlElement = document.querySelector(inId);
    if (!htmlElement)
        throw new Error(`DOM elements not found, id: "${inId}"`);
    return htmlElement;
};
window.onload = async () => {
    const testStartTime = Date.now();
    const loggerOutput = findOrFailHtmlElement("#loggerOutput");
    const logger = new Logger(loggerOutput);
    logger.logCenter("page loaded");
    logger.logCenter(Logger.makeColor([255, 0, 0], "\n\nSTART\n\n"));
    logger.logCenter(" loading worker-obtain-cipher-key");
    //
    //
    //
    logger.logCenter(" loading worker-symmetric-cipher");
    const loadStartTime = Date.now();
    await CrytpoppWasmModule.load();
    const loadEndTime = Date.now();
    logger.logCenter(`wasmCryptoppJs wasm module loaded (${loadEndTime - loadStartTime}ms)`);
    //
    //
    //
    await runLogic(logger);
    //
    //
    //
    const testEndTime = Date.now();
    logger.logCenter(Logger.makeColor([255, 0, 0], `\n\nSTOP (${testEndTime - testStartTime}ms)\n\n`));
};
