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
			rubricHrefs: {
				attribute: false,
				type: Array
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
		`];
	}

	_getRubrics() {
		const rubrics =	this.rubricHrefs.map(rubric => {
			if (!rubric) {
				return html``;
			}
			return html`
				<div class="d2l-consistent-evaluation-rubric">
					<d2l-rubric
						rubric-id="${rubric.rubricHref}"
						href=${rubric.rubricHref}
						assessment-href=${rubric.rubricAssessmentHref}
						.token=${this.token}
						?read-only=${this.readonly}
						force-compact
						overall-score-flag
						selected
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
		return html`
			<select class="d2l-input-select d2l-truncate" aria-label=${this.localize('userSubmissions')} @change=${this._onSelectChange}>
				${this.rubricHrefs.map(rubric => {
					return html`
						<option value=${rubric.rubricId} label=${rubric.rubricTitle} class="select-option"></option>
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
