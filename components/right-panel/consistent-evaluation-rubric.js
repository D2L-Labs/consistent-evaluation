import './consistent-evaluation-right-panel-block';
import 'd2l-rubric/d2l-rubric.js';
import { css, html, LitElement } from 'lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class ConsistentEvaluationRubric extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			header: {
				type: String
			},
			rubricInfo: {
				attribute: false,
				type: Array
			},
			activeScoringRubric: {
				attribute: 'active-scoring-rubric',
				type: Number
			},
			showActiveScoringRubricOptions: {
				attribute: 'show-active-scoring-rubric-options',
				type: Boolean
			},
			token: {
				type: String
			},
			readonly: {
				attribute: 'read-only',
				type: Boolean
			}
		};
	}

	static get styles() {
		return  [labelStyles, selectStyles, css`
			.d2l-consistent-evaluation-rubric:nth-child(n + 2) {
				margin-top: 0.7rem;
			}
			.d2l-label-text {
				margin-bottom: 0.4rem;
				margin-top: 1.4rem;
			}
		`];
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('activeScoringRubric')) {
			this.shadowRoot.querySelector('.d2l-consistent-evaluation-active-scoring-rubric').value = this.activeScoringRubric ?
				this.activeScoringRubric :
				null;
		}
	}

	_syncActiveScoringRubricGrade(e) {
		const score = e.detail.score;
		if (score === null) {
			return;
		}

		const targetRubricId = parseInt(e.target.getAttribute('rubric-id'));

		if (this.activeScoringRubric !== targetRubricId) {
			return;
		}

		const currentRubricInfo = this.rubricInfo.find(rubric => rubric.rubricId === targetRubricId);

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-rubric-total-score-changed', {
			composed: true,
			bubbles: true,
			detail: {
				score: score,
				rubricInfo: currentRubricInfo
			}
		}));
	}

	_onActiveScoringRubricChange(e) {
		const rubricId = e.target.value;

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-active-scoring-rubric-change', {
			composed: true,
			bubbles: true,
			detail: {
				rubricId: parseInt(rubricId)
			}
		}));
	}

	_getRubrics() {
		const rubrics =	this.rubricInfo.map(rubric => {
			if (!rubric) {
				return html``;
			}

			return html`
				<div class="d2l-consistent-evaluation-rubric">
					<d2l-rubric
						rubric-id=${rubric.rubricId}
						href=${rubric.rubricHref}
						assessment-href=${rubric.rubricAssessmentHref}
						.token=${this.token}
						?read-only=${this.readonly}
						force-compact
						overall-score-flag
						selected
						@d2l-rubric-total-score-changed=${this._syncActiveScoringRubricGrade}
					></d2l-rubric>
				</div>
			`;
		});

		return html`${rubrics}`;
	}

	_getActiveScoringRubricSelectDropdown() {
		if (!this.showActiveScoringRubricOptions) {
			return html``;
		}
		const scoringRubrics = this.rubricInfo.filter(rubric => rubric.rubricScoringMethod !== 0);
		if (scoringRubrics.length <= 0) {
			return html``;
		}
		return html`
			<h3 class="d2l-label-text">${this.localize('gradingRubric')}</h3>
			<select class="d2l-input-select d2l-truncate d2l-consistent-evaluation-active-scoring-rubric" aria-label=${this.localize('activeGradingRubric')} @change=${this._onActiveScoringRubricChange}>
				<option label=${this.localize('noActiveGradingRubric')} ?selected=${!this.activeScoringRubric} value=null></option>
				${scoringRubrics.map(rubric => html`
						<option value="${rubric.rubricId}" label=${rubric.rubricTitle} class="select-option" ?selected=${rubric.rubricId === this.activeScoringRubric}></option>
				`)}
			</select>
		`;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block title="${this.header}">
				${this._getRubrics()}
				${this._getActiveScoringRubricSelectDropdown()}
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-rubric', ConsistentEvaluationRubric);
