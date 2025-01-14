/* eslint-disable max-len */
import { RECEIPT_MILESTONE_OPTION_TYPE, PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE } from "@iota/iota.js";
import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DropdownIcon } from "./../../../assets/dropdown-arrow.svg";
import { MilestonePayloadProps } from "./MilestonePayloadProps";
import { MilestonePayloadState } from "./MilestonePayloadState";
import ProtocolParamsMilestonOption from "./ProtocolParamsMilestonOption";
import ReceiptMilestoneOption from "./ReceiptMilestoneOption";
import { ClipboardHelper } from "../../../utils/clipboardHelper";
import { FormatHelper } from "../../../utils/formatHelper";
import BlockButton from "../layout/BlockButton";

/**
 * Component which will display a milestone payload.
 */
class MilestonePayload extends Component<MilestonePayloadProps, MilestonePayloadState> {
    /**
     * Create a new instance of Milestone payload.
     * @param props The props.
     */
     constructor(props: MilestonePayloadProps) {
        super(props);

        this.state = {
            showSignatures: false,
            showOptions: false
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="milestone-payload card--content padding-0">
                <h2>Milestone Payload</h2>
                <div className="card--label">
                    Index
                </div>
                <div className="card--value">
                    {this.props.payload.index}
                </div>
                <div className="card--label">
                    Date
                </div>
                <div className="card--value">
                    {this.props.payload.timestamp && FormatHelper.date(
                        this.props.payload.timestamp
                    )}
                </div>
                <div className="card--label">
                    Previous Milestone Id
                </div>
                <div className="card--value">
                    {this.props.payload.previousMilestoneId}
                </div>
                {this.props.payload.parents?.map((parent, idx) => (
                    <React.Fragment key={idx}>
                        <div className="card--label">
                            Parent Block {idx + 1}
                        </div>
                        <div className="card--value card--value__mono row">
                            {parent !== "0".repeat(64) && (
                                <React.Fragment>
                                    <Link
                                        className="margin-r-t"
                                        to={
                                            `/explorer/block/${parent}`
                                        }
                                    >
                                        {parent}
                                    </Link>
                                    <BlockButton
                                        onClick={() => ClipboardHelper.copy(
                                            parent
                                        )}
                                        buttonType="copy"
                                        labelPosition="top"
                                    />
                                </React.Fragment>
                            )}
                            {parent === "0".repeat(64) && (
                                <span>Genesis</span>
                            )}
                        </div>
                    </React.Fragment>
                ))}
                <div className="card--label">
                    Confirmed Merkle Proof
                </div>
                <div className="card--value card--value__mono">
                    {this.props.payload.inclusionMerkleRoot}
                </div>
                <div className="card--label">
                    Applied Merkle Proof
                </div>
                <div className="card--value card--value__mono">
                    {this.props.payload.appliedMerkleRoot}
                </div>
                {this.props.payload.metadata && (
                    <React.Fragment>
                        <div className="card--label">
                            Metadata
                        </div>
                        <div className="card--value card--value__mono">
                            {this.props.payload.metadata}
                        </div>
                    </React.Fragment>
                )}

                {this.props.payload.options && (
                <React.Fragment>
                    <div className="milestone-payloads__options padding-t-s">
                        <div
                            className="card--content__input"
                            onClick={() => this.setState({ showOptions: !this.state.showOptions })}
                        >
                            <div className={classNames(
                                        "margin-r-t",
                                        "card--content__input--dropdown",
                                        { "opened": this.state.showOptions }
                                    )}
                            >
                                <DropdownIcon />
                            </div>
                            <h3 className="card--content__input--label">
                                Options
                            </h3>
                        </div>
                    </div>
                    {this.state.showOptions && (
                        <div className="card--content--border-l">
                            {this.props.payload.options.map((option, idx) => (
                                <React.Fragment key={idx}>
                                    { option.type === RECEIPT_MILESTONE_OPTION_TYPE && (
                                        <ReceiptMilestoneOption option={option} />
                                    )}
                                    { option.type === PROTOCOL_PARAMETERS_MILESTONE_OPTION_TYPE && (
                                        <ProtocolParamsMilestonOption option={option} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </React.Fragment>
                )}
                <div className="milestone-payloads__signatures padding-t-s">
                    <div
                        className="card--content__input"
                        onClick={() => this.setState({ showSignatures: !this.state.showSignatures })}
                    >
                        <div className={classNames(
                                "margin-r-t",
                                "card--content__input--dropdown",
                                { "opened": this.state.showSignatures }
                            )}
                        >
                            <DropdownIcon />
                        </div>
                        <h3 className="card--content__input--label">
                            Signatures
                        </h3>
                    </div>
                </div>
                {this.state.showSignatures && (
                    <div className="card--content--border-l">
                        {this.props.payload.signatures.map((sig, i) => (
                            <div key={i} className="margin-b-s">
                                <div className="card--label">
                                    Public Key
                                </div>
                                <div className="card--value card--value__mono">
                                    {sig.publicKey}
                                </div>
                                <div className="card--label">
                                    Signature
                                </div>
                                <div className="card--value card--value__mono">
                                    {sig.signature}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default MilestonePayload;
