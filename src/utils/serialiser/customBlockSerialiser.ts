// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import {
    DEFAULT_PROTOCOL_VERSION,
    MILESTONE_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE,
    TRANSACTION_PAYLOAD_TYPE,
    TREASURY_TRANSACTION_PAYLOAD_TYPE,
    BLOCK_ID_LENGTH,
    UINT64_SIZE,
    UINT8_SIZE,
    MIN_PAYLOAD_LENGTH,
    MAX_NUMBER_PARENTS
} from "@iota/iota.js";
import type { ReadStream, WriteStream } from "@iota/util.js";
import bigInt from "big-integer";
import { deserializePayload, serializePayload } from "./customPayloadSerialiser";
import { IBlock } from "../../models/IBlock";


/**
 * The minimum length of a block binary representation.
 */
const MIN_BLOCK_LENGTH: number =
    UINT8_SIZE + // Protocol Version
    UINT8_SIZE + // Parent count
    BLOCK_ID_LENGTH + // Single parent
    MIN_PAYLOAD_LENGTH + // Min payload length
    UINT64_SIZE; // Nonce

/**
 * Deserialize the block from binary.
 * @param readStream The block to deserialize.
 * @returns The deserialized block.
 */
export function deserializeBlock(readStream: ReadStream): IBlock {
    if (!readStream.hasRemaining(MIN_BLOCK_LENGTH)) {
        throw new Error(
            `Block data is ${readStream.length()} ` +
            `in length which is less than the minimimum size required of ${MIN_BLOCK_LENGTH}`
        );
    }

    const protocolVersion = readStream.readUInt8("block.protocolVersion");
    const numParents = readStream.readUInt8("block.numParents");
    const parents: string[] = [];

    for (let i = 0; i < numParents; i++) {
        const parentBlockId = readStream.readFixedHex(`block.parentBlockId${i}`, BLOCK_ID_LENGTH);
        parents.push(parentBlockId);
    }

    const payload = deserializePayload(readStream);

    if (payload && payload.type === TREASURY_TRANSACTION_PAYLOAD_TYPE) {
        throw new Error("Blocks can not contain receipt or treasury transaction payloads");
    }

    const nonce = readStream.readUInt64("block.nonce");

    const unused = readStream.unused();
    if (unused !== 0) {
        throw new Error(`Block data length ${readStream.length()} has unused data ${unused}`);
    }

    return {
        protocolVersion,
        parents,
        payload,
        nonce: nonce.toString()
    };
}

/**
 * Serialize the block essence to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializeBlock(writeStream: WriteStream, object: IBlock): void {
    writeStream.writeUInt8("block.protocolVersion", object.protocolVersion ?? DEFAULT_PROTOCOL_VERSION);

    const numParents = object.parents?.length ?? 0;
    writeStream.writeUInt8("block.numParents", numParents);

    if (object.parents) {
        if (numParents > MAX_NUMBER_PARENTS) {
            throw new Error(`A maximum of ${MAX_NUMBER_PARENTS} parents is allowed, you provided ${numParents}`);
        }
        if (new Set(object.parents).size !== numParents) {
            throw new Error("The block parents must be unique");
        }
        const sorted = object.parents.slice().sort();
        for (let i = 0; i < numParents; i++) {
            if (sorted[i] !== object.parents[i]) {
                throw new Error("The block parents must be lexographically sorted");
            }
            writeStream.writeFixedHex(`block.parentBlockId${i + 1}`, BLOCK_ID_LENGTH, object.parents[i]);
        }
    }

    if (
        object.payload &&
        object.payload.type !== TRANSACTION_PAYLOAD_TYPE &&
        object.payload.type !== MILESTONE_PAYLOAD_TYPE &&
        object.payload.type !== TAGGED_DATA_PAYLOAD_TYPE
    ) {
        throw new Error("Blocks can only contain transaction, milestone or tagged data payloads");
    }

    serializePayload(writeStream, object.payload);

    writeStream.writeUInt64("block.nonce", bigInt(object.nonce ?? "0"));
}
