import { Blake2b } from "@iota/crypto.js";
import { ALIAS_ADDRESS_TYPE, NFT_ADDRESS_TYPE } from "@iota/iota.js";
import { Converter, HexHelper } from "@iota/util.js";
import { Bech32AddressHelper } from "./bech32AddressHelper";
import { IBech32AddressDetails } from "../models/IBech32AddressDetails";

export interface SearchQuery {
    /**
     * The query string in lower case.
     */
    queryLower: string;
    /**
     * The did query.
     */
    did?: string;
    /**
     * The milestoneIndex query.
     */
    milestoneIndex?: number;
    /**
     * The milestoneId query.
     */
    milestoneId?: string;
    /**
     * The MaybeAddress query.
     */
    address?: IBech32AddressDetails;
    /**
     * The blockId or transactionId query.
     */
    blockIdOrTransactionId?: string;
    /**
     * The outputId query.
     */
    output?: string;
    /**
     * The aliasId query.
     */
    aliasId?: string;
    /**
     * The nftId query.
     */
    nftId?: string;
    /**
     * The foundryId query.
     */
    foundryId?: string;
    /**
     * The tag of an output.
     */
    tag?: string;

    /**
     * The streams tag ID
     */
    streamsTagId?: string;
}

/**
 * Builds SearchQuery object from query stirng
 */
export class SearchQueryBuilder {
    /**
     * The query string.
     */
    private readonly query: string;

    /**
     * The query string in lower case.
     */
    private readonly queryLower: string;

    /**
     * Thed human readable part to use for bech32.
     */
    private readonly networkBechHrp: string;

    /**
     * Creates a new instance of SearchQueryBuilder.
     * @param query The query string.
     * @param networkBechHrp The network bechHrp.
     */
    constructor(query: string, networkBechHrp: string) {
        this.query = query;
        this.queryLower = query.toLowerCase();
        this.networkBechHrp = networkBechHrp;
    }

    /**
     * Builds the SearchQuery.
     * @returns the SearchQuery object.
     */
    public build(): SearchQuery {
        let blockIdOrTransactionId: string | undefined;
        let output: string | undefined;
        let aliasId: string | undefined;
        let nftId: string | undefined;
        let milestoneId: string | undefined;
        let foundryId: string | undefined;
        let streamsTagId: string | undefined;

        const milestoneIndex = /^\d+$/.test(this.query) ? Number.parseInt(this.query, 10) : undefined;
        const streamsMsg = /^([\dA-Fa-f]{80}):([\dA-Fa-f]{24})$/.test(this.query);
        if (streamsMsg) {
            const split = this.query.split(":");
            const blake = new Blake2b(Blake2b.SIZE_256, undefined);
            blake.update(Converter.hexToBytes(split[0]));
            blake.update(Converter.hexToBytes(split[1]));
            streamsTagId = Converter.bytesToHex(blake.final());
        }

        const address = Bech32AddressHelper.buildAddress(this.query, this.networkBechHrp);

        // if the hex without prefix has 64 characters it might be an AliasId, NftId or MilestoneId
        if (address?.hexNoPrefix && address.hexNoPrefix.length === 64) {
            aliasId = address.hex;
            nftId = address.hex;
            milestoneId = address.hex;
        }

        // if the hex without prefix has 66 characters, if might be and Alias or Nft Address
        if (address?.hexNoPrefix && address.hexNoPrefix.length === 66) {
            const typeByte = address.hexNoPrefix.slice(0, 2);
            const maybeAddress = address.hexNoPrefix.slice(2);

            if (Number.parseInt(typeByte, 10) === ALIAS_ADDRESS_TYPE) {
                aliasId = HexHelper.addPrefix(maybeAddress);
            }

            if (Number.parseInt(typeByte, 10) === NFT_ADDRESS_TYPE) {
                nftId = HexHelper.addPrefix(maybeAddress);
            }
        }

        const hexWithPrefix = HexHelper.addPrefix(this.queryLower);
        const hexNoPrefix = HexHelper.stripPrefix(this.queryLower);
        // if the hex without prefix is 76 characters and first byte is 08,
        // it can be a FoundryId or TokenId
        if (Converter.isHex(hexWithPrefix, true) &&
            Number.parseInt(hexNoPrefix.slice(0, 2), 16) === ALIAS_ADDRESS_TYPE && hexNoPrefix.length === 76) {
            foundryId = hexWithPrefix;
        }

        // if the hex has 66 characters, it might be a block or transaction id
        if (address?.hex && address.hex.length === 66) {
            blockIdOrTransactionId = address.hex;
        }

        // if the hex is 70 characters, try and look for an output
        if (address?.hex && address.hex.length === 70) {
            output = address.hex;
        }

        const tag = Converter.isHex(this.query, true) ? this.query : Converter.utf8ToHex(this.query, true);

        return {
            queryLower: this.queryLower,
            milestoneIndex,
            milestoneId,
            address,
            blockIdOrTransactionId,
            output,
            aliasId,
            nftId,
            foundryId,
            tag,
            streamsTagId
        };
    }
}
