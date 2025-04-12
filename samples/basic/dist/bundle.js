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

const printHexadecimalStrings = (logger, inHexStr, inStep, inAlign) => {
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

const profileScope = async (inCallback, inDoneCallback) => {
    const startTime = Date.now();
    const val = await inCallback();
    const endTime = Date.now();
    inDoneCallback(endTime - startTime);
    return val;
};

const runDiffieHellmanClientTest = async (logger) => {
    const wasmModule = CrytpoppWasmModule.get();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("DiffieHellmanClient test"))));
    const clientA_str = Logger.makeColor([128 + 64, 128, 128], "Client A");
    const clientB_str = Logger.makeColor([128, 128, 128 + 64], "Client B");
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`${clientA_str} initialize`));
    logger.logLeft(`${clientA_str} created`);
    const clientA = new wasmModule.DiffieHellmanClientJs();
    logger.logLeft(`${clientA_str} generate keys`);
    logger.alignedLog('left', "generating");
    await profileScope(() => {
        clientA.generateRandomKeysSimpler();
    }, (elapsed) => {
        logger.alignedLog('left', `generated (${elapsed}ms)`);
    });
    logger.logLeft(`${clientA_str} provide public key`);
    const pubKeyHexStr_A = clientA.getPublicKeyAsHexStr();
    logger.logLeft(`${clientA_str} public key as hexadecimal value:`);
    printHexadecimalStrings(logger, pubKeyHexStr_A, 64, 'left');
    logger.log();
    logger.logCenter(Logger.makeBorder(`${clientB_str} initialize`));
    logger.logRight(`${clientB_str} created`);
    const clientB = new wasmModule.DiffieHellmanClientJs();
    logger.logRight(`${clientB_str} generate keys`);
    logger.alignedLog('right', "generating");
    await profileScope(() => {
        clientB.generateRandomKeysSimpler();
    }, (elapsed) => {
        logger.alignedLog('right', `generated (${elapsed}ms)`);
    });
    logger.logRight(`${clientB_str} provide public key`);
    const pubKeyHexStr_B = clientB.getPublicKeyAsHexStr();
    logger.logRight(`${clientB_str} public key as hexadecimal value:`);
    printHexadecimalStrings(logger, pubKeyHexStr_B, 64, 'right');
    logger.log();
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`${clientA_str} compute shared secret (with ${clientB_str} public key)`));
    logger.alignedLog('left', "computing");
    const sharedSecretHexStr_A = await profileScope(() => {
        clientA.computeSharedSecretFromHexStr(pubKeyHexStr_B);
        return clientA.getSharedSecretAsHexStr();
    }, (elapsed) => {
        logger.alignedLog('left', `computed (${elapsed}ms)`);
    });
    logger.logLeft(`${clientA_str} computed shared secret as hexadecimal value:`);
    printHexadecimalStrings(logger, sharedSecretHexStr_A, 64, 'left');
    logger.log();
    logger.logCenter(Logger.makeBorder(`${clientB_str} compute shared secret (with ${clientA_str} public key)`));
    logger.alignedLog('right', "computing");
    const sharedSecretHexStr_B = await profileScope(() => {
        clientB.computeSharedSecretFromHexStr(pubKeyHexStr_A);
        return clientB.getSharedSecretAsHexStr();
    }, (elapsed) => {
        logger.alignedLog('right', `computed (${elapsed}ms)`);
    });
    logger.logRight(`${clientB_str} computed shared secret as hexadecimal value:`);
    printHexadecimalStrings(logger, sharedSecretHexStr_B, 64, 'right');
    logger.log();
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`verification`));
    if (sharedSecretHexStr_A == sharedSecretHexStr_B) {
        logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], ` => SUCCESS: BOTH CLIENTS SHARE THE SAME SECRET!`))}
    `);
    }
    else {
        logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], ` => FAILURE: CLIENTS SECRETS ARE NOT MATCHING!`))}
    `);
    }
    //
    //
    //
    clientA.delete();
    clientB.delete();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder(`DiffieHellmanClient test`))));
};

const runEllipticCurveDiffieHellmanClientTest = async (logger) => {
    const wasmModule = CrytpoppWasmModule.get();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("EllipticCurveDiffieHellmanClient test"))));
    const clientA_str = Logger.makeColor([128 + 64, 128, 128], "Client A");
    const clientB_str = Logger.makeColor([128, 128, 128 + 64], "Client B");
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`${clientA_str} initialize`));
    logger.logLeft(`${clientA_str} created`);
    const prngA = new wasmModule.AutoSeededRandomPoolJs();
    const clientA = new wasmModule.EllipticCurveDiffieHellmanClientJs();
    logger.logLeft(`${clientA_str} generate keys`);
    logger.alignedLog('left', "generating");
    await profileScope(() => {
        clientA.generateRandomKeys(prngA);
    }, (elapsed) => {
        logger.alignedLog('left', `generated (${elapsed}ms)`);
    });
    logger.logLeft(`${clientA_str} provide public key`);
    const pubKeyHexStr_A = clientA.getPublicKeyAsHexStr();
    logger.logLeft(`${clientA_str} public key as hexadecimal value:`);
    printHexadecimalStrings(logger, pubKeyHexStr_A, 64, 'left');
    logger.log();
    logger.logCenter(Logger.makeBorder(`${clientB_str} initialize`));
    logger.logRight(`${clientB_str} created`);
    const prngB = new wasmModule.AutoSeededRandomPoolJs();
    const clientB = new wasmModule.EllipticCurveDiffieHellmanClientJs();
    logger.logRight(`${clientB_str} generate keys`);
    logger.alignedLog('right', "generating");
    await profileScope(() => {
        clientB.generateRandomKeys(prngB);
    }, (elapsed) => {
        logger.alignedLog('right', `generated (${elapsed}ms)`);
    });
    logger.logRight(`${clientB_str} provide public key`);
    const pubKeyHexStr_B = clientB.getPublicKeyAsHexStr();
    logger.logRight(`${clientB_str} public key as hexadecimal value:`);
    printHexadecimalStrings(logger, pubKeyHexStr_B, 64, 'right');
    logger.log();
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`${clientA_str} compute shared secret (with ${clientB_str} public key)`));
    logger.alignedLog('left', "computing");
    const sharedSecretHexStr_A = await profileScope(() => {
        clientA.computeSharedSecretFromHexStr(pubKeyHexStr_B);
        return clientA.getSharedSecretAsHexStr();
    }, (elapsed) => {
        logger.alignedLog('left', `computed (${elapsed}ms)`);
    });
    logger.logLeft(`${clientA_str} computed shared secret as hexadecimal value:`);
    printHexadecimalStrings(logger, sharedSecretHexStr_A, 64, 'left');
    logger.log();
    logger.logCenter(Logger.makeBorder(`${clientB_str} compute shared secret (with ${clientA_str} public key)`));
    logger.alignedLog('right', "computing");
    const sharedSecretHexStr_B = await profileScope(() => {
        clientB.computeSharedSecretFromHexStr(pubKeyHexStr_A);
        return clientB.getSharedSecretAsHexStr();
    }, (elapsed) => {
        logger.alignedLog('right', `computed (${elapsed}ms)`);
    });
    logger.logRight(`${clientB_str} computed shared secret as hexadecimal value:`);
    printHexadecimalStrings(logger, sharedSecretHexStr_B, 64, 'right');
    logger.log();
    //
    //
    //
    logger.logCenter(Logger.makeBorder(`verification`));
    if (sharedSecretHexStr_A == sharedSecretHexStr_B) {
        logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], ` => SUCCESS: BOTH CLIENTS SHARE THE SAME SECRET!`))}
    `);
    }
    else {
        logger.logCenter(`
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], ` => FAILURE: CLIENTS SECRETS ARE NOT MATCHING!`))}
    `);
    }
    //
    //
    //
    clientA.delete();
    clientB.delete();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder(`EllipticCurveDiffieHellmanClient test`))));
};

// import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";
const runAesSymmetricTest = async (logger) => {
    const wasmModule = CrytpoppWasmModule.get();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("AesSymmetricCipher test"))));
    //
    //
    // generate
    const prng = new wasmModule.AutoSeededRandomPoolJs();
    logger.alignedLog('center', "generate random key value");
    const keyHexStr = prng.getRandomHexStr(32);
    logger.alignedLog('center', "generate random iv value");
    const ivHexStr = prng.getRandomHexStr(16);
    prng.delete();
    logger.logCenter(Logger.makeBorder("AesSymmetricCipher A: initialize"));
    logger.alignedLog('left', "create the AES Symmetric Cipher A");
    const aesEncryptCipherA = new wasmModule.AesSymmetricCipherJs();
    logger.alignedLog('left', "initialize the AES Symmetric Cipher A");
    logger.alignedLog('left', "initializing");
    await profileScope(() => {
        aesEncryptCipherA.initializeFromHexStr(keyHexStr, ivHexStr);
    }, (elapsed) => {
        logger.alignedLog('left', `initialized (${elapsed}ms)`);
    });
    logger.logCenter(Logger.makeBorder("AesSymmetricCipher B: initialize"));
    logger.alignedLog('right', "create the AES Symmetric Cipher B");
    const aesEncryptCipherB = new wasmModule.AesSymmetricCipherJs();
    logger.alignedLog('right', "initialize the AES Symmetric Cipher B");
    logger.alignedLog('right', "initializing");
    await profileScope(() => {
        aesEncryptCipherB.initializeFromHexStr(keyHexStr, ivHexStr);
    }, (elapsed) => {
        logger.alignedLog('right', `initialized (${elapsed}ms)`);
    });
    //
    //
    // encrypt
    logger.logCenter(Logger.makeBorder("AesSymmetricCipher A: encrypt payload"));
    const inputStr = "This is my plain text message....";
    logger.alignedLog('left', `original payload:  "${Logger.makeColor([64, 128 + 64, 64], inputStr)}"`);
    const inputHexStr = wasmModule.utf8ToHex(inputStr);
    logger.alignedLog('left', `encrypting`);
    const encodedHexStr = await profileScope(() => {
        return aesEncryptCipherA.encryptFromHexStrAsHexStr(inputHexStr);
    }, (elapsed) => {
        logger.alignedLog('left', `encrypted (${elapsed}ms)`);
    });
    logger.alignedLog('left', `encrypted payload:`);
    printHexadecimalStrings(logger, encodedHexStr, 32, 'left');
    //
    //
    // decrypt
    logger.logCenter(Logger.makeBorder("AesSymmetricCipher B: decrypt payload"));
    logger.alignedLog('right', `encrypted payload:`);
    printHexadecimalStrings(logger, encodedHexStr, 32, 'right');
    logger.alignedLog('right', `decrypting`);
    const decodedHexStr = await profileScope(() => {
        return aesEncryptCipherA.decryptFromHexStrAsHexStr(encodedHexStr);
    }, (elapsed) => {
        logger.alignedLog('right', `decrypted (${elapsed}ms)`);
    });
    const recoveredStr = wasmModule.hexToUtf8(decodedHexStr);
    logger.alignedLog('right', `decrypted payload: "${Logger.makeColor([128, 128, 255], recoveredStr)}"`);
    logger.alignedLog('right', `original payload:  "${Logger.makeColor([64, 128 + 64, 64], inputStr)}"`);
    logger.logCenter(Logger.makeBorder("Verification"));
    if (recoveredStr === inputStr) {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], " => SUCCESS: ENCRYPTED PAYLOAD WAS RECOVERED!"))}
    `);
    }
    else {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], " => FAILURE: ENCRYPTED PAYLOAD WAS NOT RECOVERED!"))}
    `);
    }
    //
    //
    //
    aesEncryptCipherA.delete();
    aesEncryptCipherB.delete();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("AesSymmetricCipher test"))));
};

// import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";
const runRSAFeaturesTest = async (logger) => {
    const wasmModule = CrytpoppWasmModule.get();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("RSA Features test"))));
    //
    // SETUP
    //
    logger.logCenter(Logger.makeBorder("RSA Features: setup"));
    const prng = new wasmModule.AutoSeededRandomPoolJs();
    const primarySet = {
        privateKey: new wasmModule.RSAPrivateKeyJs(),
        publicKey: new wasmModule.RSAPublicKeyJs(),
    };
    const secondarySet = {
        privateKey: new wasmModule.RSAPrivateKeyJs(),
        publicKey: new wasmModule.RSAPublicKeyJs(),
    };
    //
    // INITIALIZE
    //
    logger.logCenter(Logger.makeBorder("RSA Features: initialize"));
    logger.alignedLog('center', "generate random private key of 3072 bytes (PRIVATE KEY A)");
    logger.alignedLog('center', `generating`);
    await profileScope(() => {
        primarySet.privateKey.generateRandomWithKeySizeUsingAutoSeeded(prng, 3072);
    }, (elapsed) => {
        logger.alignedLog('center', `generated (${elapsed}ms)`);
    });
    logger.alignedLog('left', primarySet.privateKey.getAsPemString());
    logger.alignedLog('center', "get public key from the private key (PUBLIC KEY A)");
    primarySet.publicKey.setFromPrivateKey(primarySet.privateKey);
    logger.alignedLog('left', primarySet.publicKey.getAsPemString());
    //
    // PEM LOAD
    //
    logger.logCenter(Logger.makeBorder("RSA Features: PEM GET/LOAD"));
    logger.alignedLog('center', "load a new private key (PRIVATE KEY B) from the PEM of the first private key (PRIVATE KEY A)");
    secondarySet.privateKey.loadFromPemString(primarySet.privateKey.getAsPemString());
    logger.alignedLog('center', "load a new public key (PUBLIC KEY B) from the PEM of the first public key (PUBLIC KEY A)");
    secondarySet.publicKey.loadFromPemString(primarySet.publicKey.getAsPemString());
    //
    // SIGN
    //
    logger.logCenter(Logger.makeBorder("RSA Features: SIGN"));
    logger.alignedLog('center', "sign some content with the second private key (PRIVATE KEY B)");
    const payloadStr = "Hello from JavaScript!";
    logger.alignedLog('center', `original payload:`);
    logger.logCenter(Logger.makeColor([0, 128, 0], Logger.makeSize(30, `"${payloadStr}"`)));
    const payloadHexStr = wasmModule.utf8ToHex(payloadStr);
    logger.alignedLog('center', `signing`);
    const signedHexStr = await profileScope(() => {
        return secondarySet.privateKey.signFromHexStrToHexStrUsingAutoSeeded(prng, payloadHexStr);
    }, (elapsed) => {
        logger.alignedLog('center', `signed (${elapsed}ms)`);
    });
    logger.alignedLog('center', `signed payload:`);
    printHexadecimalStrings(logger, signedHexStr, 64, 'center');
    //
    // VERIFY
    //
    logger.logCenter(Logger.makeBorder("RSA Features: VERIFY"));
    logger.alignedLog('center', "verify signed content with the first public key (PUBLIC KEY A)");
    logger.alignedLog('center', `verifying`);
    const verifiedHexStr = await profileScope(() => {
        return primarySet.publicKey.verifyFromHexStrToHexStr(signedHexStr);
    }, (elapsed) => {
        logger.alignedLog('center', `verified (${elapsed}ms)`);
    });
    const verifiedMessage = wasmModule.hexToUtf8(verifiedHexStr);
    logger.alignedLog('center', `verified payload:`);
    logger.logCenter(Logger.makeColor([0, 128, 0], Logger.makeSize(30, `"${verifiedMessage}"`)));
    logger.logCenter(Logger.makeBorder("Verification"));
    if (verifiedMessage === payloadStr) {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], " => SUCCESS: SIGNED PAYLOAD WAS VERIFIED!"))}
    `);
    }
    else {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], " => FAILURE: SIGNED PAYLOAD WAS NOT VERIFIED!"))}
    `);
    }
    //
    // DEALLOCATE
    //
    secondarySet.publicKey.delete();
    secondarySet.privateKey.delete();
    primarySet.publicKey.delete();
    primarySet.privateKey.delete();
    prng.delete();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("RSA Features test"))));
};

// import { Logger, CrytpoppWasmModule, printHexadecimalStrings } from "../../../_common";
const runDeriveKey = async (logger) => {
    const wasmModule = CrytpoppWasmModule.get();
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("Derive Key Features test"))));
    //
    // DERIVE
    //
    const k_keySize = 64;
    const derivedKeyA = wasmModule.deriveSha256HexStrKeyFromHexStrData(wasmModule.utf8ToHex("my password"), wasmModule.utf8ToHex("my salt"), wasmModule.utf8ToHex("my info"), k_keySize);
    logger.logCenter(Logger.makeBorder(`Derive key A, password is "my password", size is 64bytes`));
    printHexadecimalStrings(logger, derivedKeyA, 32, 'center');
    const derivedKeyB = wasmModule.deriveSha256HexStrKeyFromHexStrData(wasmModule.utf8ToHex("my password"), wasmModule.utf8ToHex("my salt"), wasmModule.utf8ToHex("my info"), k_keySize * 2);
    logger.logCenter(Logger.makeBorder(`Derive key B, password is "my password", size is 128bytes`));
    printHexadecimalStrings(logger, derivedKeyB, 32, 'center');
    logger.logCenter(Logger.makeBorder("Verification"));
    if (derivedKeyA === derivedKeyB.slice(0, 128)) {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([128, 255, 128], " => SUCCESS: THE DERIVED KEY FIRST 64 BYTES WERE THE SAME!"))}
    `);
    }
    else {
        logger.alignedLog('center', `
      ${Logger.makeBorder(Logger.makeColor([255, 128, 128], " => FAILURE: THE DERIVED KEY FIRST 64 BYTES WERE NOT THE SAME!"))}
    `);
    }
    logger.logCenter(Logger.makeColor([128, 128, 0], Logger.makeSize(30, Logger.makeBorder("Derive Key Features test"))));
};

// import { Logger, CrytpoppWasmModule } from "../../_common";
const findOrFailHtmlElement = (inId) => {
    const htmlElement = document.querySelector(inId);
    if (!htmlElement)
        throw new Error(`DOM elements not found, id: "${inId}"`);
    return htmlElement;
};
window.onload = async () => {
    const loggerOutput = findOrFailHtmlElement("#loggerOutput");
    const logger = new Logger(loggerOutput);
    logger.logCenter(Logger.makeColor([255, 0, 0], "\n\nSTART\n\n"));
    logger.logCenter("page loaded");
    logger.logCenter(" loading wasmCryptoppJs wasm script");
    const loadStartTime = Date.now();
    await CrytpoppWasmModule.load();
    const loadEndTime = Date.now();
    const elapsedTime = (loadEndTime - loadStartTime);
    logger.logCenter(`wasmCryptoppJs wasm module loaded ${elapsedTime}ms`);
    //
    //
    //
    await runAesSymmetricTest(logger);
    //
    //
    //
    await runDiffieHellmanClientTest(logger);
    //
    //
    //
    await runEllipticCurveDiffieHellmanClientTest(logger);
    //
    //
    //
    await runRSAFeaturesTest(logger);
    //
    //
    //
    await runDeriveKey(logger);
    //
    //
    //
    logger.logCenter(Logger.makeColor([255, 0, 0], "\n\nSTOP\n\n"));
};
