import 'd2l-navigation/d2l-navigation-immersive.js';
import 'd2l-navigation/components/d2l-navigation-iterator/d2l-navigation-iterator.js';

import { css, html, LitElement } from 'lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

class ConsistentEvaluationNavBar extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			assignmentName: {
				attribute: false,
				type: String
			},
			organizationName: {
				attribute: false,
				type: String
			},
			iteratorTotal: {
				attribute: false,
				type: Number
			},
			iteratorIndex: {
				attribute: false,
				type: Number
			}
		};
	}

	static get styles() {
		return [labelStyles, css`
			.d2l-student-iterator {
				padding-left: 4rem;
				padding-right: 4rem;
			}
			.d2l-heading-3 {
				padding-top: 0.25rem;
			}
		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	_dispatchButtonClickEvent(eventName) {
		this.dispatchEvent(new CustomEvent(eventName, {
			composed: true,
			bubbles: true
		}));
	}

	_emitPreviousStudentEvent() { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-previous-student');}
	_emitNextStudentEvent() { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-next-student'); }

	render() {
		return html`
			<d2l-navigation-immersive 
				back-link-href="https://www.d2l.com/"
				back-link-text="Back to D2L" 
				width-type="fullscreen">

				<div slot="middle">
					<div class="d2l-heading-3">${this.assignmentName}</div>
					<div class="d2l-label-text">${this.organizationName}</div>
				</div>

				<d2l-navigation-iterator 
					slot="right"
					@previous-click=${this._emitPreviousStudentEvent} 
					@next-click=${this._emitNextStudentEvent}
					?previous-disabled=${(this.iteratorIndex === 1 || this.iteratorIndex === undefined)}
					?next-disabled=${(this.iteratorIndex === this.iteratorTotal || this.iteratorIndex === undefined || this.iteratorIndex === undefined)}
					hide-text>
					<span class="d2l-student-iterator d2l-label-text">${this.localize('user')} ${this.iteratorIndex} ${this.localize('of')} ${this.iteratorTotal}</span>
				</d2l-navigation-iterator>

			</d2l-navigation-immersive>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-nav-bar', ConsistentEvaluationNavBar);
