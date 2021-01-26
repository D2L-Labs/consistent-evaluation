import '@brightspace-ui/core/components/dialog/dialog-confirm.js';
import { html, LitElement } from 'lit-element/lit-element.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { LocalizeConsistentEvaluation } from '../lang/localize-consistent-evaluation.js';

const DIALOG_ACTION_CONTINUE_GRADING = 'continue_grading';
const PUBLISH_UNSCORED_DIALOG = 'publishUnscored';
const UPDATE_UNSCORED_DIALOG = 'updateUnscored';

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
				attribute: false,
				type: Object
			},
			_dialogToOpen: {
				attribute: false,
				type: String
			},
			_unscoredCriteriaDialogOpened: {
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
			this._dialogToOpen = PUBLISH_UNSCORED_DIALOG;
			this._showUnscoredCriteriaDialog();
		} else if (changedProperties.has('updateClicked') && this.updateClicked) {
			this._dialogToOpen = UPDATE_UNSCORED_DIALOG;
			this._showUnscoredCriteriaDialog();
		}
	}

	async _showUnscoredCriteriaDialog() {
		const hasUnscoredCriteria = await this._checkUnscoredCriteria();
		if (hasUnscoredCriteria) {
			this._unscoredCriteriaDialogOpened = true;
			return;
		}

		this._updateOrPublishEvaluation();
	}

	async _checkUnscoredCriteria() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		const _rubricsInfo = await controller.getRubricInfos(true);
		const hasUnscoredCriteria = _rubricsInfo.find(rubric => rubric.hasUnscoredCriteria) !== undefined;
		return hasUnscoredCriteria;
	}

	_onUnscoredCriteriaDialogClosed(e) {
		this._unscoredCriteriaDialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_CONTINUE_GRADING) {
			this._fireDialogClosedEvent();
		} else {
			this._updateOrPublishEvaluation();
		}
	}

	_updateOrPublishEvaluation() {
		if (this._dialogToOpen === PUBLISH_UNSCORED_DIALOG) {
			this._firePublishEvaluationEvent();
		} else if (this._dialogToOpen === UPDATE_UNSCORED_DIALOG) {
			this._fireUpdateEvaluationEvent();
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
		this.dispatchEvent(new CustomEvent('d2l-dialog-closed', {
			composed: true,
			bubbles: true
		}));
	}

	_getUnscoredCriteriaAction() {
		if (this._dialogToOpen === UPDATE_UNSCORED_DIALOG) {
			return this.localize('update');
		}
		return this.localize('publish');
	}

	render() {
		return html`<d2l-dialog-confirm
				title-text=${this.localize('unscoredCriteriaTitle')}
				text=${this.localize('unscoredCriteriaBody')}
				?opened=${this._unscoredCriteriaDialogOpened}
				@d2l-dialog-close=${this._onUnscoredCriteriaDialogClosed}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_CONTINUE_GRADING}>${this.localize('continueGrading')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this._getUnscoredCriteriaAction()}</d2l-button>
			</d2l-dialog-confirm>`;
	}
}
customElements.define('d2l-consistent-evaluation-dialogs', ConsistentEvaluationDialogs);
