import '@brightspace-ui-labs/user-profile-card/user-profile-card.js';
import '@brightspace-ui/core/components/icons/icon.js';

import { html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationUserProfileCard extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			displayName: {
				attribute: 'display-name',
				type: String
			},
			tagline: {
				type: String
			},
			instantMessageHref: {
				type: String
			}
		};
	}

	constructor() {
		super();
		this.messagePopout = undefined;
	}

	dispatchMouseLeaveEvent() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-profile-card-mouse-leave', {
			composed: true,
			bubbles: true,
		}));
	}

	_openMessageDialog() {
		if (this.messagePopout) {
			if (!this.messagePopout.closed) {
				this.messagePopout.focus();
				return;
			}
		}

		this.messagePopout = window.open(
			this.instantMessageHref,
			'messagePopout',
			'width=400,height=200,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);
	}

	render() {
		return html`
		<d2l-labs-user-profile-card
			@mouseleave=${this.dispatchMouseLeaveEvent}
			@d2l-labs-user-profile-card-message=${this._openMessageDialog}
			tagline=${this.tagline}>
			<img slot="illustration" src="">
			${this.displayName}
		</d2l-labs-user-profile-card>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-user-profile-card', ConsistentEvaluationUserProfileCard);
