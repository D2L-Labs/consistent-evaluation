import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationTiiGradeMark extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			gradeMarkHref: {
				attribute: 'grade-mark-href',
				type: String
			},
			fileName: {
				attribute: 'grade-mark-file-name',
				type: String
			},
			fileId: {
				attribute: 'file-id',
				type: String
			},
			outOf: {
				attribute: 'grade-mark-out-of',
				type: Number
			},
			score: {
				attribute: 'grade-mark-score',
				type: Number
			},
			hideUseGrade: {
				attribute: 'hide-use-grade',
				type: Boolean
			},
			_overallScore: {
				attribute: true,
				type: String
			}
		};
	}

	static get styles() {
		return [labelStyles, css`
		`];
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('score')) {
			this._setOverallScore();
		}
	}

	_onEditButtonClick() {
		window.open(this.gradeMarkHref);
	}

	_dispatchRefreshButtonClick() {
		// TODO: only show if action is there
		// TODO: Localization

		this._overallScore = 'Refreshing...';

		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-evidence-refresh-grade-mark', {
			detail: {
				fileId: this.fileId,
			},
			composed: true,
			bubbles: true
		}));
	}

	_dispatchUseGradeEvent() {
		const grade = new Grade(GradeType.Number, this.score, this.outOf, null, null, null);
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-use-tii-grade', {
			detail: {
				grade: grade
			},
			composed: true,
			bubbles: true
		}));
	}

	_renderUseGradeButton() {
		return (this.score && !this.hideUseGrade) ?
			html`
				<d2l-button-subtle
					icon="tier1:grade"
					text="${this.localize('turnitinUseGrade')}"
					@click=${this._dispatchUseGradeEvent}
				></d2l-button-subtle>
			` :
			html ``;
	}

	_renderEditButton() {
		// @click should make another api call and re-render to update the grade value
		return html`
			<d2l-button-icon
				text="${this.localize('turnitinGradeMarkEdit', { file: this.fileName })}"
				icon="tier1:edit"
				href=${this.gradeMarkHref}
				@click=${this._onEditButtonClick}
			></d2l-button-icon>
		`;
	}

	_renderRefreshButton() {
		return html`
			<d2l-button-icon
				text="${this.localize('turnitinGradeMarkRefresh', { file: this.fileName })}"
				icon="tier1:refresh"
				href=${this.href}
				@click=${this._dispatchRefreshButtonClick}
			></d2l-button-icon>
		`;
	}

	_setOverallScore() {
		this._overallScore = this.score ? html`${this.score} / ${this.outOf}` : this.localize('turnitinNoScore');

	}

	render() {
		return html`
			<div class="d2l-label-text">${this.localize('turnitinGradeMark')}</div>
			<div>
				${this._overallScore}
				${this._renderEditButton()}
				${this._renderRefreshButton()}
				${this._renderUseGradeButton()}
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-tii-grade-mark', ConsistentEvaluationTiiGradeMark);
