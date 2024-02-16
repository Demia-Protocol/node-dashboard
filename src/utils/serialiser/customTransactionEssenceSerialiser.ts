// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-mixed-operators */
import {
    MIN_TRANSACTION_ESSENCE_LENGTH,
    IUTXOInput,
    UTXO_INPUT_TYPE,
    INPUTS_COMMITMENT_SIZE,
    TRANSACTION_ESSENCE_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE,
    deserializeInputs,
    serializeInputs,
    deserializeOutputs,
    serializeOutputs
} from "@iota/iota.js";
import type { ReadStream, WriteStream } from "@iota/util.js";
import bigInt from "big-integer";
import { ITransactionEssence } from "../../models/IBlock";
import { deserializePayload, serializePayload } from "./customPayloadSerialiser";

/**
 * Deserialize the transaction essence from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeTransactionEssence(readStream: ReadStream): ITransactionEssence {
    if (!readStream.hasRemaining(MIN_TRANSACTION_ESSENCE_LENGTH)) {
        throw new Error(
            `Transaction essence data is ${readStream.length()} in length ` +
            `which is less than the minimimum size required of ${MIN_TRANSACTION_ESSENCE_LENGTH}`
        );
    }

    const type = readStream.readUInt8("transactionEssence.type");
    if (type !== TRANSACTION_ESSENCE_TYPE) {
        throw new Error(`Type mismatch in transactionEssence ${type}`);
    }

    const networkId = readStream.readUInt64("transactionEssence.networkId");

    const inputs = deserializeInputs(readStream);
    const inputsCommitment = readStream.readFixedHex("transactionEssence.inputsCommitment", INPUTS_COMMITMENT_SIZE);
    const outputs = deserializeOutputs(readStream);

    const payload = deserializePayload(readStream);
    if (payload && payload.type !== TAGGED_DATA_PAYLOAD_TYPE) {
        throw new Error("Transaction essence can only contain embedded Tagged Data Payload");
    }

    for (const input of inputs) {
        if (input.type !== UTXO_INPUT_TYPE) {
            throw new Error("Transaction essence can only contain UTXO Inputs");
        }
    }

    return {
        type: TRANSACTION_ESSENCE_TYPE,
        networkId: networkId.toString(),
        inputs: inputs as IUTXOInput[],
        inputsCommitment,
        outputs,
        payload
    };
}

/**
 * Serialize the transaction essence to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializeTransactionEssence(writeStream: WriteStream, object: ITransactionEssence): void {
    writeStream.writeUInt8("transactionEssence.type", object.type);

    writeStream.writeUInt64("transactionEssence.networkId", bigInt(object.networkId ?? "0"));

    for (const input of object.inputs) {
        if (input.type !== UTXO_INPUT_TYPE) {
            throw new Error("Transaction essence can only contain UTXO Inputs");
        }
    }

    serializeInputs(writeStream, object.inputs);
    writeStream.writeFixedHex("transactionEssence.inputsCommitment", INPUTS_COMMITMENT_SIZE, object.inputsCommitment);

    serializeOutputs(writeStream, object.outputs);
    serializePayload(writeStream, object.payload);
}
