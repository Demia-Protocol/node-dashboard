import { IMilestonePayload } from "@iota/iota.js";
import { IBlock } from "../IBlock";

export interface IProofOfInclusion {
    /**
     * The block
     */
    block: IBlock;

    /**
     * The milestone
     */
    milestone: IMilestonePayload;

    /**
     * The proof
     */
    proof: Record<string, unknown>;
}
