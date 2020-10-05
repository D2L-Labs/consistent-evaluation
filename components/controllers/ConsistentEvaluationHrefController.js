import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { actorRel, alignmentsRel, assessmentRel, checkpointItemType, evaluationRel, nextRel, previousRel, rubricRel, userProgressOutcomeActivitiesRel, userProgressOutcomeRel, userRel} from './constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';

export const ConsistentEvaluationHrefControllerErrors = {
	INVALID_BASE_HREF: 'baseHref was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_BASE_HREF: 'baseHref must be a string when initializing ConsistentEvaluationHrefController',
	INVALID_TOKEN: 'token was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_TOKEN: 'token must be a string when initializing ConsistentEvaluationHrefController'
};

export class ConsistentEvaluationHrefController {
	constructor(baseHref, token) {
		if (!baseHref) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		}

		if (typeof baseHref !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
		}

		if (!token) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TOKEN);
		}

		if (typeof token !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_TOKEN);
		}

		this.baseHref = baseHref;
		this.token = token;
	}
	_getHref(root, rel) {
		if (root.hasLinkByRel(rel)) {
			return root.getLinkByRel(rel).href;
		}
		return undefined;
	}

	// these are in their own methods so that they can easily be stubbed in testing
	async _getRootEntity(bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(this.baseHref, this.token, bypassCache);
	}

	async _getEntityFromHref(targetHref, bypassCache) {
		return await window.D2L.Siren.EntityStore.fetch(targetHref, this.token, bypassCache);
	}

	async getHrefs(bypassCache = false) {
		let root = await this._getRootEntity(bypassCache);

		let evaluationHref = undefined;
		let nextHref = undefined;
		let previousHref = undefined;
		let rubricAssessmentHref = undefined;
		let rubricHref = undefined;
		let alignmentsHref = undefined;
		let userHref = undefined;
		let actorHref = undefined;
		let userProgressOutcomeHref = undefined;
		let coaDemonstrationHref = undefined;

		if (root && root.entity) {
			root = root.entity;

			evaluationHref = this._getHref(root, evaluationRel);
			nextHref = this._getHref(root, nextRel);
			previousHref = this._getHref(root, previousRel);
			rubricAssessmentHref = this._getHref(root, assessmentRel);
			actorHref = this._getHref(root, actorRel);
			userHref = this._getHref(root, userRel);
			alignmentsHref = this._getHref(root, alignmentsRel);
			userProgressOutcomeHref = this._getHref(root, userProgressOutcomeRel);

			if (rubricAssessmentHref) {
				const assessmentEntity = await this._getEntityFromHref(rubricAssessmentHref, bypassCache);
				if (assessmentEntity && assessmentEntity.entity) {
					rubricHref = this._getHref(assessmentEntity.entity, rubricRel);
				}
			}

			if (alignmentsHref) {
				const alignmentsEntity = await this._getEntityFromHref(alignmentsHref, bypassCache);
				if (alignmentsEntity && alignmentsEntity.entity) {
					if (alignmentsEntity.entity.entities && alignmentsEntity.entity.entities.length > 0) {
						alignmentsHref = actorHref;
					} else {
						alignmentsHref = undefined;
					}
				}
			}

			if (userProgressOutcomeHref) {
				const userProgressOutcomeEntity = await this._getEntityFromHref(userProgressOutcomeHref, bypassCache);
				if (userProgressOutcomeEntity && userProgressOutcomeEntity.entity) {
					const userProgressOutcomeActivitiesHref = this._getHref(userProgressOutcomeEntity.entity, userProgressOutcomeActivitiesRel);

					if (userProgressOutcomeActivitiesHref) {
						const userProgressOutcomeActivitiesEntity = await this._getEntityFromHref(userProgressOutcomeActivitiesHref, bypassCache);

						if (userProgressOutcomeActivitiesEntity && userProgressOutcomeActivitiesEntity.entity) {
							const checkpointActivityEntity = userProgressOutcomeActivitiesEntity.entity.getSubEntitiesByClass(Classes.userProgress.outcomes.activity).find((activityEntity) => {
								return activityEntity.properties && activityEntity.properties.type === checkpointItemType;
							});

							if (checkpointActivityEntity) {
								const demonstrationEntity = checkpointActivityEntity.getSubEntityByClass(Classes.outcomes.demonstration);
								if (demonstrationEntity) {
									coaDemonstrationHref = this._getHref(demonstrationEntity, 'self');
								}
							}
						}
					}
				}
			}
		}

		return {
			root,
			evaluationHref,
			nextHref,
			alignmentsHref,
			previousHref,
			rubricAssessmentHref,
			rubricHref,
			userHref,
			userProgressOutcomeHref,
			coaDemonstrationHref
		};
	}

	async getSubmissionInfo() {
		let root = await this._getRootEntity(false);
		let submissionList, evaluationState, submissionType;
		if (root && root.entity) {
			root = root.entity;
			if (root.getSubEntityByClass(Classes.assignments.submissionList)) {
				submissionList = root.getSubEntityByClass(Classes.assignments.submissionList).links;
			}
			if (root.getSubEntityByRel(Rels.evaluation)) {
				evaluationState = root.getSubEntityByRel(Rels.evaluation).properties.state;
			}
			const assignmentHref = this._getHref(root, Rels.assignment);
			if (assignmentHref) {
				const assignmentEntity = await this._getEntityFromHref(assignmentHref, false);
				if (assignmentEntity && assignmentEntity.entity) {
					submissionType = assignmentEntity.entity.properties.submissionType.title;
				}
			}
		}
		return {
			submissionList,
			evaluationState,
			submissionType
		};
	}

	async getGradeItemInfo() {
		const root = await this._getRootEntity(false);
		let evaluationUrl, statsUrl, gradeItemName;
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.Activities.activityUsage)) {
				const activityUsageLink = root.entity.getLinkByRel(Rels.Activities.activityUsage).href;
				const activityUsageResponse = await this._getEntityFromHref(activityUsageLink, false);

				if (activityUsageResponse && activityUsageResponse.entity && activityUsageResponse.entity.getLinkByRel(Rels.Grades.grade)) {
					const gradeLink = activityUsageResponse.entity.getLinkByRel(Rels.Grades.grade).href;
					const gradeResponse = await this._getEntityFromHref(gradeLink, false);

					if (gradeResponse && gradeResponse.entity  && gradeResponse.entity.properties) {
						evaluationUrl = gradeResponse.entity.properties.evaluationUrl;
						statsUrl  = gradeResponse.entity.properties.statsUrl;
						gradeItemName = gradeResponse.entity.properties.name;
					}
				}
			}
		}

		return {
			evaluationUrl,
			statsUrl,
			gradeItemName
		};
	}

	async getAssignmentOrganizationName(domainName) {
		let domainRel;

		switch (domainName) {
			case 'assignment':
				domainRel = Rels.assignment;
				break;
			case 'organization':
				domainRel = Rels.organization;
				break;
			default:
				return undefined;
		}
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(domainRel)) {
				const domainLink = root.entity.getLinkByRel(domainRel).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					return domainResponse.entity.properties.name;
				}
			}
		}
		return undefined;
	}

	async getIteratorInfo(iteratorProperty) {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			switch (iteratorProperty) {
				case 'total':
					return root.entity.properties.iteratorTotal;
				case 'index':
					return root.entity.properties.iteratorIndex;
				default:
					break;
			}
		}
		return undefined;
	}
}
