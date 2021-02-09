/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CallStore from '../../Stores/CallStore';
import UserStore from '../../Stores/UserStore';
import './GroupCallPanelButtons.css'

class GroupCallPanelButtons extends React.Component {
    constructor(props) {
        super(props);

        const { currentGroupCall: call } = CallStore;
        let connected = false;
        let status = '';
        if (call) {
            const { groupCallId, connection } = call;
            const groupCall = CallStore.get(groupCallId);
            if (groupCall) {
                if (!groupCall.can_unmute_self) {
                    status = 'forceMuted';
                } else {
                    status = !CallStore.isMuted() ? 'unmuted' : 'muted';
                }
            }
            connected = connection && connection.iceConnectionState === 'connected';
        }

        this.state = {
            call,
            status,
            connected
        };
    }

    componentDidMount() {
        CallStore.on('clientUpdateGroupCall', this.onClientUpdateGroupCall);
        CallStore.on('clientUpdateGroupCallConnectionState', this.onClientUpdateGroupCallConnectionState);
        CallStore.on('updateGroupCallParticipant', this.onUpdateGroupCallParticipant);
        CallStore.on('updateGroupCall', this.onUpdateGroupCall);
    }

    componentWillUnmount() {
        CallStore.off('clientUpdateGroupCall', this.onClientUpdateGroupCall);
        CallStore.off('clientUpdateGroupCallConnectionState', this.onClientUpdateGroupCallConnectionState);
        CallStore.off('updateGroupCallParticipant', this.onUpdateGroupCallParticipant);
        CallStore.off('updateGroupCall', this.onUpdateGroupCall);
    }

    onUpdateGroupCallParticipant = update => {
        const { group_call_id, participant } = update;
        if (!participant) return;

        const { call } = this.state;
        if (!call) return;

        if (group_call_id !== call.groupCallId) return;

        const { user_id } = participant;
        if (user_id !== UserStore.getMyId()) return;

        let connected = false;
        let status = '';
        if (call) {
            const { groupCallId, connection } = call;
            const groupCall = CallStore.get(groupCallId);
            if (groupCall) {
                if (!groupCall.can_unmute_self) {
                    status = 'forceMuted';
                } else {
                    status = !CallStore.isMuted() ? 'unmuted' : 'muted';
                }
            }
            // connected = connection && connection.iceConnectionState !== 'new' && connection.iceConnectionState !== 'connecting';
        }

        this.setState({
            status
        });
    }

    onUpdateGroupCall = update => {
        const { group_call } = update;
        const { call } = this.state;
        if (!call) return;

        if (group_call.id !== call.groupCallId) return;

        this.onClientUpdateGroupCall(update);
    };

    onClientUpdateGroupCallConnectionState = update => {
        const { groupCallId } = update;
        const { call } = this.state;
        if (!call) return;

        if (groupCallId !== call.groupCallId) return;

        this.onClientUpdateGroupCall(update);
    };

    onClientUpdateGroupCall = update => {
        const { currentGroupCall: call } = CallStore;

        let connected = false;
        let status = '';
        if (call) {
            const { groupCallId, connection } = call;
            const groupCall = CallStore.get(groupCallId);
            if (groupCall) {
                if (!groupCall.can_unmute_self) {
                    status = 'forceMuted';
                } else {
                    status = !CallStore.isMuted() ? 'unmuted' : 'muted';
                }
            }
            connected = connection && connection.iceConnectionState !== 'new' && connection.iceConnectionState !== 'connecting';
        }

        this.setState({
            call,
            status,
            connected
        });
    };

    render() {
        const { children } = this.props;
        const { status, connected } = this.state;

        return (
            <div className={classNames('group-call-panel-buttons', {
                'group-call-connecting': !connected,
                'group-call-muted': connected && status === 'muted',
                'group-call-muted-by-admin': connected && status === 'forceMuted',
                'group-call-unmuted': connected && status === 'unmuted',
            })}>
                {children}
            </div>
        );
    }
}

GroupCallPanelButtons.propTypes = {};

export default GroupCallPanelButtons;