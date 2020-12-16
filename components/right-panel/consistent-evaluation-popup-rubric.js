import './consistent-evaluation-rubric.js';
import { html, LitElement } from 'lit-element';
import { ConsistentEvaluationHrefController } from '../controllers/ConsistentEvaluationHrefController.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationPopupRubric extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			href: { type: String },
			token: { type: Object },
			_rubricInfos: { type: Array },
		};
	}

	constructor() {
		super();
		this.href = undefined;
		this.token = undefined;
	}

	async updated(changedProperties) {
		super.updated();

		if (changedProperties.has('href')) {
			const controller = new ConsistentEvaluationHrefController(this.href, this.token);
			this._rubricInfos = await controller.getRubricInfos();
		}
	}

	render() {
		if (!this._rubricInfos) {
			return html ``;
		}
		return html`
		    <d2l-consistent-evaluation-rubric
				header=${this.localize('rubrics')}
				.rubricInfos=${this._rubricInfos}
				active-scoring-rubric=${undefined}
				.token=${this.token}
				is-popout
				?show-active-scoring-rubric-options=false
				?read-only=false
			></d2l-consistent-evaluation-rubric>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-popup-rubric', ConsistentEvaluationPopupRubric);
