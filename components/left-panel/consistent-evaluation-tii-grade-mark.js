import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
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
			outOf: {
				attribute: 'grade-mark-out-of',
				type: Number
			},
			score: {
				attribute: 'grade-mark-score',
				type: Number
			},
		};
	}

	static get styles() {
		return [labelStyles, css`
		`];
	}

	_onEditButtonClick() {
		console.log('edit');
		console.log(this.gradeMarkHref);
		window.open(this.gradeMarkHref);
	}

	_onRefreshButtonClick() {
		console.log('refresh');
	}

	_renderGradeButton() {
		// @click should trigger an event to page -> right panel -> grade result with the grade from TII
		return html`
			<d2l-button-subtle
				icon="tier1:grade"
				text="${this.localize('turnitinUseGrade')}"
			></d2l-button-subtle>
		`;
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
				@click=${this._onRefreshButtonClick}
			></d2l-button-icon>
		`;
	}

	_renderGradeMark() {
		return this.score ? html`${this.score} / ${this.outOf}` : this.localize('turnitinNoScore');
	}

	render() {
		return html`
			<div class="d2l-label-text">${this.localize('turnitinGradeMark')}</div>
			<div>
				${this._renderGradeMark()}
				${this._renderEditButton()}
				${this._renderRefreshButton()}
				${this._renderGradeButton()}
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-tii-grade-mark', ConsistentEvaluationTiiGradeMark);
