import '@brightspace-ui/core/components/dialog/dialog-confirm.js';
import { html, LitElement } from 'lit-element/lit-element.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { LocalizeConsistentEvaluation } from '../lang/localize-consistent-evaluation.js';

const DIALOG_ACTION_CONTINUE_GRADING = 'continue_grading';

export class ConsistentEvaluationDialogs extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			href: {
				attribute: 'href',
				type: String
			},
			publishClicked: {
				attribute: false,
				type: Boolean
			},
			updateClicked: {
				attribute: false,
				type: Boolean
			},
			token: {
				type: Object
			},
			_publishUnscoredCriteriaDialogOpened: {
				type: Boolean,
				attribute: false
			},
			_updateUnscoredCriteriaDialogOpened: {
				type: Boolean,
				attribute: false
			}
		};
	}

	constructor() {
		super();
		this._token = undefined;
		this.publishClicked = false;
		this.updateClicked = false;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('publishClicked') && this.publishClicked) {
			this._checkAndPublishEvaluation();
		} else if (changedProperties.has('updateClicked') && this.updateClicked) {
			this._checkAndUpdateEvaluation();
		}
	}

	async _checkAndPublishEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const hasUnscoredCriteria = await this._checkUnscoredCriteria();
		if (hasUnscoredCriteria) {
			this._publishUnscoredCriteriaDialogOpened = true;
			return;
		}

		this._firePublishEvaluationEvent();
	}

	async _checkAndUpdateEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const hasUnscoredCriteria = await this._checkUnscoredCriteria();
		if (hasUnscoredCriteria) {
			this._updateUnscoredCriteriaDialogOpened = true;
			return;
		}

		this._fireUpdateEvaluationEvent();
	}

	async _checkUnscoredCriteria() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		const _rubricsInfo = await controller.getRubricInfos(true);
		const hasUnscoredCriteria = _rubricsInfo.find(rubric => rubric.hasUnscoredCriteria) !== undefined;
		return hasUnscoredCriteria;
	}

	async _onPublishUnscoredCriteriaDialogClosed(e) {
		this._publishUnscoredCriteriaDialogOpened = false;
		if (e.detail.action !== DIALOG_ACTION_CONTINUE_GRADING) {
			this._firePublishEvaluationEvent();
		} else {
			this._fireDialogClosedEvent();
		}
	}

	async _onUpdateUnscoredCriteriaDialogClosed(e) {
		this._updateUnscoredCriteriaDialogOpened = false;
		if (e.detail.action !== DIALOG_ACTION_CONTINUE_GRADING) {
			this._fireUpdateEvaluationEvent();
		} else {
			this._fireDialogClosedEvent();
		}
	}

	async _fireUpdateEvaluationEvent() {
		this.dispatchEvent(new CustomEvent('d2l-update-evaluation', {
			composed: true,
			bubbles: true
		}));
	}

	async _firePublishEvaluationEvent() {
		this.dispatchEvent(new CustomEvent('d2l-publish-evaluation', {
			composed: true,
			bubbles: true
		}));
	}

	async _fireDialogClosedEvent() {
		this.dispatchEvent(new CustomEvent('d2l-unscored-criteria-dialog-closed', {
			composed: true,
			bubbles: true
		}));
	}

	render() {
		return html`
			<d2l-dialog-confirm
				title-text=${this.localize('unscoredCriteriaTitle')}
				text=${this.localize('unscoredCriteriaBody')}
				?opened=${this._publishUnscoredCriteriaDialogOpened}
				@d2l-dialog-close=${this._onPublishUnscoredCriteriaDialogClosed}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_CONTINUE_GRADING}>${this.localize('continueGrading')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this.localize('publish')}</d2l-button>
			</d2l-dialog-confirm>
			<d2l-dialog-confirm
				title-text=${this.localize('unscoredCriteriaTitle')}
				text=${this.localize('unscoredCriteriaBody')}
				?opened=${this._updateUnscoredCriteriaDialogOpened}
				@d2l-dialog-close=${this._onUpdateUnscoredCriteriaDialogClosed}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_CONTINUE_GRADING}>${this.localize('continueGrading')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this.localize('update')}</d2l-button>
			</d2l-dialog-confirm>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-dialogs', ConsistentEvaluationDialogs);
