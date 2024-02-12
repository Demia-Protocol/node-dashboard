import { ITaggedDataPayload } from "@iota/iota.js";
import { DemiaProps } from "../../../models/IBlock";

export interface TaggedDataPayloadProps {
    /**
     * The tagged data payload.
     */
    payload: ITaggedDataPayload & DemiaProps;
}
