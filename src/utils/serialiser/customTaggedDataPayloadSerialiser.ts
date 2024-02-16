// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable no-mixed-operators */
import {
    ITaggedDataPayload, TAGGED_DATA_PAYLOAD_TYPE,
    MIN_TAGGED_DATA_PAYLOAD_LENGTH, MAX_TAG_LENGTH
} from "@iota/iota.js";
import { HexHelper, ReadStream, WriteStream } from "@iota/util.js";
import { DemiaProps } from "../../models/IBlock";

/**
 * Deserialize the tagged data payload from binary.
 * @param readStream The stream to read the data from.
 * @returns The deserialized object.
 */
export function deserializeTaggedDataPayload(readStream: ReadStream): ITaggedDataPayload & DemiaProps {
    if (!readStream.hasRemaining(MIN_TAGGED_DATA_PAYLOAD_LENGTH)) {
        throw new Error(
            `Tagged Data Payload data is ${readStream.length()} ` +
            `in length which is less than the minimimum size required of ${MIN_TAGGED_DATA_PAYLOAD_LENGTH}`
        );
    }

    const type = readStream.readUInt32("payloadTaggedData.type");
    if (type !== TAGGED_DATA_PAYLOAD_TYPE) {
        throw new Error(`Type mismatch in payloadTaggedData ${type}`);
    }
    const tagLength = readStream.readUInt8("payloadTaggedData.tagLength");
    let tag = "";
    if (tagLength > 0) {
        tag = readStream.readFixedHex("payloadTaggedData.tag", tagLength);
    }
    const dataLength = readStream.readUInt32("payloadTaggedData.dataLength");
    let data = "";
    if (dataLength > 0) {
        data = readStream.readFixedHex("payloadTaggedData.data", dataLength);
    }
    const signatureLength = readStream.readUInt8("payloadTaggedData.signatureLength");
    let signature = "";
    if (signatureLength > 0) {
        signature = readStream.readFixedHex("payloadTaggedData.signature", signatureLength);
    }
    const publicKeyLength = readStream.readUInt8("payloadTaggedData.publicKeyLength");
    let publicKey = "";
    if (publicKeyLength > 0) {
        publicKey = readStream.readFixedHex("payloadTaggedData.publicKey", publicKeyLength);
    }

    return {
        type: TAGGED_DATA_PAYLOAD_TYPE,
        tag: tag ? HexHelper.addPrefix(tag) : tag,
        data: data ? HexHelper.addPrefix(data) : data,
        publicKey: publicKey ? HexHelper.addPrefix(publicKey) : publicKey,
        signature: signature ? HexHelper.addPrefix(signature) : signature
    };
}

/**
 * Serialize the tagged data payload to binary.
 * @param writeStream The stream to write the data to.
 * @param object The object to serialize.
 */
export function serializeTaggedDataPayload(writeStream: WriteStream, object: ITaggedDataPayload & DemiaProps): void {
    if (object.tag && object.tag.length / 2 > MAX_TAG_LENGTH) {
        throw new Error(
            `The tag length is ${
                object.tag.length / 2
            }, which exceeds the maximum size of ${MAX_TAG_LENGTH}`
        );
    }

    writeStream.writeUInt32("payloadTaggedData.type", object.type);
    if (object.tag) {
        const tag = HexHelper.stripPrefix(object.tag);
        writeStream.writeUInt8("payloadTaggedData.tagLength", tag.length / 2);
        if (tag.length > 0) {
            writeStream.writeFixedHex("payloadTaggedData.tag", tag.length / 2, tag);
        }
    } else {
        writeStream.writeUInt32("payloadTaggedData.tagLength", 0);
    }
    if (object.data) {
        const data = HexHelper.stripPrefix(object.data);
        writeStream.writeUInt32("payloadTaggedData.dataLength", data.length / 2);
        if (data.length > 0) {
            writeStream.writeFixedHex("payloadTaggedData.data", data.length / 2, data);
        }
    } else {
        writeStream.writeUInt32("payloadTaggedData.dataLength", 0);
    }

    if (object.publicKey) {
        const publicKey = HexHelper.stripPrefix(object.publicKey);
        writeStream.writeUInt8("payloadTaggedData.publicKeyLength", publicKey.length / 2);
        if (publicKey.length > 0) {
            writeStream.writeFixedHex("payloadTaggedData.publicKey", publicKey.length / 2, publicKey);
        }
    } else {
        writeStream.writeUInt8("payloadTaggedData.publicKeyLength", 0);
    }
    if (object.signature) {
        const signature = HexHelper.stripPrefix(object.signature);
        writeStream.writeUInt8("payloadTaggedData.signatureLength", signature.length / 2);
        if (signature.length > 0) {
            writeStream.writeFixedHex("payloadTaggedData.signature", signature.length / 2, signature);
        }
    } else {
        writeStream.writeUInt8("payloadTaggedData.signatureLength", 0);
    }
}
