export interface StreamState {
    /**
     * Blocks per second.
     */
    bps: string;

    /**
     * Referenced blocks per second.
     */
    rbps: string;

    /**
     * Referenced rate.
     */
    referencedRate: string;

    /**
     * The milestones.
     */
     topics: {
        name: string;
        messages: number
        latest_msg: string;
    }[];
}
