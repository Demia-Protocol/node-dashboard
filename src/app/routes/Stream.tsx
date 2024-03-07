import React, { ReactNode } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ReactComponent as ConfirmationIcon } from "../../assets/confirmation.svg";
import { ReactComponent as MilestoneIcon } from "../../assets/milestone.svg";
import { ReactComponent as UptimeIcon } from "../../assets/uptime.svg";
import { ReactComponent as MessagesIcon } from "../../assets/db-icon.svg";
import AsyncComponent from "../components/layout/AsyncComponent";
import InfoPanel from "../components/layout/InfoPanel";
import SearchInput from "../components/layout/SearchInput";
import "./Explorer.scss";
import { StreamState } from "./StreamState";
import { ServiceFactory } from "../../factories/serviceFactory";
import { StreamService } from "../../services/streamService";

/**
 * Explorer panel.
 */
class Stream extends AsyncComponent<RouteComponentProps, StreamState> {
    /**
     * The streams service.
     */
    private readonly _streamService: StreamService;

    /**
     * The milestones subscription id.
     */
    private _milestonesSubscription?: string;

    /**
     * The confirmed metrics subscription id.
     */
    private _confirmedMsMetricsSubscription?: string;

    /**
     * Create a new instance of Peers.
     * @param props The props.
     */
    constructor(props: RouteComponentProps) {
        super(props);

        this._streamService = ServiceFactory.get<StreamService>("stream");

        this.state = {
            milestones: [],
            bps: "-",
            rbps: "-",
            referencedRate: "-"
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();
    }

    /**
     * The component will unmount.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="explorer">
                <div className="content">
                    <h2>Stream</h2>
                    <div className="card search-panel">
                        <SearchInput
                            message="Enter Streams address"
                            compact={false}
                            onSearch={address => this._streamService.sync(address)}
                        />
                    </div>
                    <div className="row tablet-down-column info margin-t-s">
                        <InfoPanel
                            caption="Stream branches"
                            value={this.state.rbps}
                            icon={<MessagesIcon />}
                            backgroundStyle="blue"
                        />
                        <InfoPanel
                            caption="Referenced Rate"
                            value={this.state.referencedRate}
                            icon={<ConfirmationIcon />}
                            backgroundStyle="purple"
                        />
                    </div>
                    <div className="card milestones-panel margin-t-s">
                        <h4 className="margin-b-l">Current branches</h4>

                        {this.state.topics.map((name, num_msgs, latest_address) => (
                            <div key={name} className="milestones-panel--milestone">
                                <div className="index">{ms.index}</div>
                                <Link
                                    to={`/explorer/tagged/${ms.index}`}
                                >
                                    {ms.milestoneId}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Stream);
