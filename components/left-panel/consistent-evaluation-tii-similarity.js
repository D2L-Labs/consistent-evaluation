import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationTiiSimilarity extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			colour: {
				type: String
			},
			error: {
				type: Boolean
			},
			score: {
				type: String
			},
			submitFileUrl : {
				attribute: 'submit-file-url',
				type: String
			}
		};
	}

	static get styles() {
		return [labelStyles, css`
			.d2l-consistent-evaluation-tii-similarity-title {
				padding-bottom: 0.5rem;
			}
			.d2l-consistent-evaluation-tii-similarity-bar {
				display: flex;
			}
			.d2l-consistent-evaluation-tii-similarity-score {
				border: 0.05rem solid;
				height: 1.35rem;
				padding-left: 0.25rem;
				padding-top: 0.1rem;
				width: 3.75rem;
			}
			.d2l-consistent-evaluation-tii-similarity-colour {
				border: 0.05rem solid;
				height: 1.45rem;
				width: 1.25rem;
			}
		`];
	}

	_renderBar() {
		if (this.score && this.colour) {
			return html`
				<div class="d2l-consistent-evaluation-tii-similarity-bar">
					<div class="d2l-consistent-evaluation-tii-similarity-score">${this.score}</div>
					<div class="d2l-consistent-evaluation-tii-similarity-colour" style="background-color:${this.colour};"></div>
				</div>
			`;
		}
	}

	_renderError() {
		if (this.error) {
			return html`
				<d2l-button-icon
					text="${this.localize('turnitinFileNotRetrieved')}"
					icon="tier1:alert"
				></d2l-button-icon>
			`;
		}
	}

	_renderSubmitFile() {
		if (this.submitFileUrl) {
			return html`
				<d2l-button-icon
					text="${this.localize('turnitinSubmitFile')}"
					icon="tier2:upload"
				></d2l-button-icon>
			`;
		}
	}

	render() {
		return html`
			<div class="d2l-label-text d2l-consistent-evaluation-tii-similarity-title">${this.localize('turnitinSimilarity')}</div>

			${this._renderBar()}
			${this._renderError()}
			${this._renderSubmitFile()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-tii-similarity', ConsistentEvaluationTiiSimilarity);
