/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare var self: WorkerGlobalScope & typeof globalThis;

import { StrategiesTypes } from "../../_common/index";
import * as strategies from "./strategies";

const _strategiesMap = new Map<string, (data: any) => Promise<any>>([
    [StrategiesTypes.initialize, strategies.initializeStrategy],
    [StrategiesTypes.create_secure_context, strategies.createSecureContextStrategy],
    [StrategiesTypes.generate_diffie_hellman_keys, strategies.generateDiffieHellmanKeysStrategy],
    [StrategiesTypes.compute_diffie_hellman_shared_secret, strategies.computeDiffieHellmanSharedSecretStrategy],
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
        console.log("worker: on reply error");
        console.log("type", event.data.type);
        console.log("response.error", err);
        self.postMessage({ success: false, response: { error: err } });
    }
};


