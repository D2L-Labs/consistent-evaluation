import './consistent-evaluation-right-panel-block';
import 'd2l-rubric/d2l-rubric.js';
import { css, html, LitElement } from 'lit-element';
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
				attribute: false,
				type: Number
			},
			showSelector: {
				attribute: 'show-selector',
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
		return  [selectStyles, css`
			.d2l-consistent-evaluation-rubric:nth-child(n + 2) {
				margin-top: 0.7rem;
			}

			.d2l-consistent-evaluation-active-scoring-rubric {
				margin-top: 0.7rem;
			}
		`];
	}

	_syncRubricGrade(e) {
		let score = e.detail.score;
		if( score === null ) {
			return
		}

		const targetRubricId = parseInt(e.target.getAttribute('rubric-id'));

		if( this.activeScoringRubric != targetRubricId ) {
			return;
		}

		let currentRubricInfo = this.rubricInfo.find(rubric => rubric.rubricId === targetRubricId);

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-rubric-total-score-changed', {
			composed: true,
			bubbles: true,
			detail: {
				score: score,
				rubricInfo: currentRubricInfo
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
						@d2l-rubric-total-score-changed=${this._syncRubricGrade}
					></d2l-rubric>
				</div>
			`;
		});

		return html`${rubrics}`;
	}

	_onSelectChange(e) {
		const rubricId = e.target.value;

		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-active-scoring-rubric-change', {
			composed: true,
			bubbles: true,
			detail: {
				rubricId: rubricId
			}
		}));
	}

	_getRubricList() {
		if(!this.showSelector) {
			return html``;
		}
		return html`
			<select class="d2l-input-select d2l-truncate d2l-consistent-evaluation-active-scoring-rubric" aria-label=${'ACTIVE SCORING RUBRIC (LT)'} @change=${this._onSelectChange}>
				<option label=${'No scoring rubric (LT)'} ?selected=${!this.activeScoringRubric}></option>
				${this.rubricInfo.map(rubric => {
					return html`
						<option value="${rubric.rubricId}" label=${rubric.rubricTitle} class="select-option" ?selected=${rubric.rubricId == this.activeScoringRubric}></option>
					`
				})}
		`;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block title="${this.header}">
				${this._getRubrics()}
				${this._getRubricList()}
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-rubric', ConsistentEvaluationRubric);
