// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-mixed-operators */
import {
    IMilestonePayload,
    ITaggedDataPayload,
    ITreasuryTransactionPayload,
    ITypeBase,
    MILESTONE_PAYLOAD_TYPE,
    TAGGED_DATA_PAYLOAD_TYPE,
    TRANSACTION_PAYLOAD_TYPE,
    TREASURY_TRANSACTION_PAYLOAD_TYPE,
    UINT32_SIZE,
    deserializeMilestonePayload,
    serializeMilestonePayload,
    deserializeTreasuryTransactionPayload,
    serializeTreasuryTransactionPayload
} from "@iota/iota.js";
import type { ReadStream, WriteStream } from "@iota/util.js";

import { DemiaProps, ITransactionPayload } from "../../models/IBlock";
import {
    deserializeTaggedDataPayload,
    serializeTaggedDataPayload
} from "./customTaggedDataPayloadSerialiser";
import {
    deserializeTransactionPayload,
    serializeTransactionPayload
} from "./customTransactionPayloadSerialiser";

export type PayloadTypes = ITransactionPayload
    | IMilestonePayload
    | ITreasuryTransactionPayload
    | (ITaggedDataPayload & DemiaProps);

/**
 * Deserialize the payload from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializePayload(readStream: ReadStream): PayloadTypes | undefined {
    const payloadLength = readStream.readUInt32("payload.length");

    if (!readStream.hasRemaining(payloadLength)) {
        throw new Error(`Payload length ${payloadLength} exceeds the remaining data ${readStream.unused()}`);
    }

    let payload: PayloadTypes | undefined;

    if (payloadLength > 0) {
        const payloadType = readStream.readUInt32("payload.type", false);

        if (payloadType === TRANSACTION_PAYLOAD_TYPE) {
            payload = deserializeTransactionPayload(readStream);
        } else if (payloadType === MILESTONE_PAYLOAD_TYPE) {
            payload = deserializeMilestonePayload(readStream);
        } else if (payloadType === TREASURY_TRANSACTION_PAYLOAD_TYPE) {
            payload = deserializeTreasuryTransactionPayload(readStream);
        } else if (payloadType === TAGGED_DATA_PAYLOAD_TYPE) {
            payload = deserializeTaggedDataPayload(readStream);
        } else {
            throw new Error(`Unrecognized payload type ${payloadType}`);
        }
    }

    return payload;
}

/**
 * Serialize the payload essence to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializePayload(writeStream: WriteStream, object: PayloadTypes | undefined): void {
    // Store the location for the payload length and write 0
    // we will rewind and fill in once the size of the payload is known
    const payloadLengthWriteIndex = writeStream.getWriteIndex();
    writeStream.writeUInt32("payload.length", 0);

    if (!object) {
        // No other data to write
    } else if (object.type === TRANSACTION_PAYLOAD_TYPE) {
        serializeTransactionPayload(writeStream, object);
    } else if (object.type === MILESTONE_PAYLOAD_TYPE) {
        serializeMilestonePayload(writeStream, object);
    } else if (object.type === TREASURY_TRANSACTION_PAYLOAD_TYPE) {
        serializeTreasuryTransactionPayload(writeStream, object);
    } else if (object.type === TAGGED_DATA_PAYLOAD_TYPE) {
        serializeTaggedDataPayload(writeStream, object);
    } else {
        throw new Error(`Unrecognized transaction type ${(object as ITypeBase<number>).type}`);
    }

    const endOfPayloadWriteIndex = writeStream.getWriteIndex();
    writeStream.setWriteIndex(payloadLengthWriteIndex);
    writeStream.writeUInt32("payload.length", endOfPayloadWriteIndex - payloadLengthWriteIndex - UINT32_SIZE);
    writeStream.setWriteIndex(endOfPayloadWriteIndex);
}
