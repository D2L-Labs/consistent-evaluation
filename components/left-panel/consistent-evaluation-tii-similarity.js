import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
import { tiiPendingReportStatus, tiiReportCompleteStatus } from '../controllers/constants.js';
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
			fileId: {
				attribute: 'file-id',
				type: String
			},
			originalityReportHref : {
				attribute: 'originality-report-href',
				type: String
			},
			reportStatus: {
				attribute: 'report-status',
				type: String
			},
			score: {
				type: Number
			},
			submitFileHref : {
				attribute: 'submit-file-href',
				type: String
			}
		};
	}

	static get styles() {
		return [labelStyles, css`
			.d2l-consistent-evaluation-tii-similarity-bar {
				cursor: pointer;
				display: flex;
				margin-top: 0.5rem;
				width: 5.25rem;
			}
			.d2l-consistent-evaluation-tii-similarity-bar:hover {
				background-color: #e1f3fd;
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

	_onErrorClick() {
		// open dialog
	}

	_onSimilarityBarClick() {
		window.open(this.originalityReportHref);
	}

	_onSubmitFileClick() {
		const event = new CustomEvent('d2l-consistent-evaluation-evidence-tii-submit-file-action', {
			detail: {
				fileId: this.fileId,
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	_renderBar() {
		if (this.reportStatus != tiiReportCompleteStatus || isNaN(parseFloat(this.score))) {
			return html``;
		}
		const renderScore = Math.round(this.score*100);

		return html`
			<div class="d2l-consistent-evaluation-tii-similarity-bar" @click=${this._onSimilarityBarClick}>
				<div class="d2l-consistent-evaluation-tii-similarity-score">${renderScore}%</div>
				<div class="d2l-consistent-evaluation-tii-similarity-colour" style="background-color:${this.colour};"></div>
			</div>
		`;
	}

	_renderError() {
		if (this.error) {
			return html`
				<d2l-button-icon
					text="${this.localize('turnitinFileNotRetrieved')}"
					icon="tier1:alert"
					@click=${this._onErrorClick}
				></d2l-button-icon>
			`;
		}
	}

	_renderSubmitFile() {
		if (this.reportStatus == tiiReportCompleteStatus) {
			return html``;
		} else if (this.reportStatus == tiiPendingReportStatus) {
			return html`${this.localize('inProgress')}`;
		} else {
			return html`
				<d2l-button-icon
					text="${this.localize('turnitinSubmitFile')}"
					icon="tier2:upload"
					@click=${this._onSubmitFileClick}
				></d2l-button-icon>
			`;
		}
	}

	render() {
		return html`
			<div class="d2l-label-text">${this.localize('turnitinSimilarity')}</div>

			${this._renderBar()}
			${this._renderError()}
			${this._renderSubmitFile()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-tii-similarity', ConsistentEvaluationTiiSimilarity);
