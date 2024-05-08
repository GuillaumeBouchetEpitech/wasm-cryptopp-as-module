/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare var self: WorkerGlobalScope & typeof globalThis;

import { CrytpoppWasmModule } from "@local-worker-framework";
import { DeriveRsaKeys } from "../../_common/index";
import * as strategies from "./strategies";

const _strategiesMap = new Map<string, (data: any) => Promise<any>>([
    [DeriveRsaKeys.StrategiesTypes.initialize, strategies.initializeStrategy],
    [DeriveRsaKeys.StrategiesTypes.create_secure_context, strategies.createSecureContextStrategy],
    [DeriveRsaKeys.StrategiesTypes.derive_rsa_keys, strategies.deriveRsaKeys],
]);

self.onmessage = async (event: any) => {

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

    } catch (err) {

        if (typeof(err) === 'number') {
            const wasmModule = CrytpoppWasmModule.get()
            const errMsg = wasmModule.getExceptionMessage(err);
            err = new Error(errMsg);
        }

        console.log("worker: on reply error");
        console.log("type", event.data.type);
        console.log("response.error", err);
        self.postMessage({ success: false, response: { error: err } });
    }
};


