import './d2l-consistent-evaluation-lcb-user-context.js';
import { css, html, LitElement } from 'lit-element';
import { EntityMixinLit } from 'siren-sdk/src/mixin/entity-mixin-lit.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { UserEntity } from 'siren-sdk/src/users/UserEntity.js';

export class ConsistentEvaluationLearnerContextBar extends (EntityMixinLit(LitElement)) {

	static get properties() {
		return {
			_displayName: {
				attribute: false,
				type: String
			},
			_firstName: {
				attribute: false,
				type: String
			},
			_lastName: {
				attribute: false,
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
				height: 100%;
				margin: 1rem;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();

		this._displayName = undefined;
		this._firstName = undefined;
		this._lastName = undefined;

		this._setEntityType(UserEntity);
	}

	set _entity(entity) {
		if (this._entityHasChanged(entity)) {
			this._onUserEntityChanged(entity);
			super._entity = entity;
		}
	}

	_onUserEntityChanged(userEntity, error) {
		if (error || userEntity === null) {
			return;
		}

		this._displayName = userEntity.getDisplayName();
		this._firstName = userEntity.getFirstName();
		this._lastName = userEntity.getLastName();
	}

	get _colourId() {
		return 9;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-lcb-user-context
				profile-image-href=""
				first-name="${ifDefined(this._firstName)}"
				last-name="${ifDefined(this._lastName)}"
				colour-id="${this._colourId}"
				display-name="${ifDefined(this._displayName)}"
			></d2l-consistent-evaluation-lcb-user-context>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-learner-context-bar', ConsistentEvaluationLearnerContextBar);
