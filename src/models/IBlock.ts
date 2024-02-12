import type { HexEncodedString, IUTXOInput, OutputTypes, IMilestonePayload, ITaggedDataPayload, ITypeBase, UnlockTypes } from "@iota/iota.js";

/**
 * The default protocol version.
 */
export declare const DEFAULT_PROTOCOL_VERSION: number;
/**
 * Block layout.
 */
export interface IBlock {
    /**
     * The protocol version under which this block operates.
     */
    protocolVersion: number;
    /**
     * The parent block ids.
     */
    parents: HexEncodedString[];
    /**
     * The payload contents.
     */
    payload?: ITransactionPayload | IMilestonePayload | ITaggedDataPayload & DemiaProps;
    /**
     * The nonce for the block.
     */
    nonce: string;
}

/**
 * The global type for the payload.
 */
export declare const TRANSACTION_PAYLOAD_TYPE = 6;
/**
 * Transaction payload.
 */
export interface ITransactionPayload extends ITypeBase<6> {
    /**
     * The index name.
     */
    essence: ITransactionEssence;
    /**
     * The unlocks.
     */
    unlocks: UnlockTypes[];
}

/**
 * Transaction payload.
 */
 export interface ITransactionEssence extends ITypeBase<1> {
    /**
     * The network id of the block.
     */
    networkId: string;
    /**
     * The inputs of the transaction.
     */
    inputs: IUTXOInput[];
    /**
     * The commitment to the referenced inputs.
     */
    inputsCommitment: string;
    /**
     * The outputs of the transaction.
     */
    outputs: OutputTypes[];
    /**
     * Tagged data payload.
     */
    payload?: ITaggedDataPayload & DemiaProps;
 }

export interface DemiaProps {
    publicKey: HexEncodedString;
    signature: HexEncodedString;
}
