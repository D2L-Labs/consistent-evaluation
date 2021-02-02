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
				attribute: 'tag-line',
				type: String
			}
		};
	}

	dispatchMouseLeaveEvent() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-profile-card-mouse-leave', {
			composed: true,
			bubbles: true,
		}));
	}

	render() {
		return html`
		<d2l-labs-user-profile-card
			@mouseleave=${this.dispatchMouseLeaveEvent}
			tagline=${this.tagline}>
			<img slot="illustration" src="" width="116px" height="116px">
			${this.displayName}
		</d2l-labs-user-profile-card>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-user-profile-card', ConsistentEvaluationUserProfileCard);
