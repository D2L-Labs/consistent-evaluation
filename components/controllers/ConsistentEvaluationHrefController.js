import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { actorRel, alignmentsRel, anonymousMarkingRel, assessmentRel,
	assessmentRubricApplicationRel, assessorUserRel, assignmentRel, assignmentSubmissionListRel,
	checkedClassName, demonstrationRel, editActivityRel, editSpecialAccessApplicationRel, emailRel,
	enrolledUserRel, evaluationRel, groupRel, nextRel, pagerRel, previousRel, publishedClassName,
	rubricRel, userProgressAssessmentsRel, userProgressOutcomeRel, userRel,  viewMembersRel } from './constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';

export const ConsistentEvaluationHrefControllerErrors = {
	INVALID_BASE_HREF: 'baseHref was not defined when initializing ConsistentEvaluationHrefController',
	INVALID_TYPE_BASE_HREF: 'baseHref must be a string when initializing ConsistentEvaluationHrefController'
};

export class ConsistentEvaluationHrefController {
	constructor(baseHref, token) {
		if (!baseHref) {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		}

		if (typeof baseHref !== 'string') {
			throw new Error(ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
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

	_getHrefs(root, rel) {
		if (root.hasLinkByRel(rel)) {
			return root.getLinksByRel(rel).map(x => x.href);
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
		let alignmentsHref = undefined;
		let userHref = undefined;
		let groupHref = undefined;
		let actorHref = undefined;
		let userProgressOutcomeHref = undefined;
		let coaDemonstrationHref = undefined;
		let specialAccessHref = undefined;
		let rubricPopoutLocation = undefined;
		let downloadAllSubmissionLink = undefined;

		if (root && root.entity) {
			root = root.entity;

			evaluationHref = this._getHref(root, evaluationRel);
			nextHref = this._getHref(root, nextRel);
			previousHref = this._getHref(root, previousRel);
			actorHref = this._getHref(root, actorRel);
			userHref = this._getHref(root, userRel);
			alignmentsHref = this._getHref(root, alignmentsRel);
			groupHref = this._getHref(root, groupRel);
			userProgressOutcomeHref = this._getHref(root, userProgressOutcomeRel);

			if (alignmentsHref) {
				const alignmentsEntity = await this._getEntityFromHref(alignmentsHref, bypassCache);
				if (alignmentsEntity && alignmentsEntity.entity) {
					if (userProgressOutcomeHref) {
						alignmentsHref = undefined;
						const referencedAlignmentEntity = alignmentsEntity.entity.getSubEntityByRel('item');
						if (referencedAlignmentEntity) {
							const alignmentEntity = await this._getEntityFromHref(referencedAlignmentEntity.href, bypassCache);
							if (alignmentEntity && alignmentEntity.entity) {
								const demonstrationLink = alignmentEntity.entity.getLinkByRel(demonstrationRel);
								if (demonstrationLink) {
									coaDemonstrationHref = demonstrationLink.href;
								}
							}
						}
					} else {
						if (alignmentsEntity.entity.entities && alignmentsEntity.entity.entities.length > 0) {
							alignmentsHref = actorHref;
						} else {
							alignmentsHref = undefined;
						}
					}
				}
			}

			if (root.hasSubEntityByRel(editSpecialAccessApplicationRel)) {
				specialAccessHref = root.getSubEntityByRel(editSpecialAccessApplicationRel).properties.path;
			}

			if (root.hasSubEntityByRel(assessmentRubricApplicationRel)) {
				rubricPopoutLocation = root.getSubEntityByRel(assessmentRubricApplicationRel).properties.path;
			}

			if (root.hasSubEntityByRel(assignmentSubmissionListRel)) {
				if (root.getSubEntityByRel(assignmentSubmissionListRel).properties) {
					downloadAllSubmissionLink = root.getSubEntityByRel(assignmentSubmissionListRel).properties.downloadAll;
				}
			}
		}

		return {
			root,
			evaluationHref,
			nextHref,
			alignmentsHref,
			previousHref,
			userHref,
			groupHref,
			userProgressOutcomeHref,
			coaDemonstrationHref,
			specialAccessHref,
			rubricPopoutLocation,
			downloadAllSubmissionLink
		};
	}

	async getSubmissionInfo() {
		let root = await this._getRootEntity(false);
		let submissionList, evaluationState, submissionType;
		let isExempt = false;
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
					submissionType = assignmentEntity.entity.properties.submissionType.value.toString();
				}
			}
			const evaluationHref = this._getHref(root, evaluationRel);
			if (evaluationHref) {
				const evaluationEntity = await this._getEntityFromHref(evaluationHref, false);
				if (evaluationEntity && evaluationEntity.entity) {
					isExempt = evaluationEntity.entity.properties.isExempt;
				}
			}
		}
		return {
			submissionList,
			evaluationState,
			submissionType,
			isExempt
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

					if (gradeResponse && gradeResponse.entity && gradeResponse.entity.properties) {
						evaluationUrl = gradeResponse.entity.properties.evaluationUrl;
						statsUrl = gradeResponse.entity.properties.statsUrl;
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

	async getUserName() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.user)) {
				const domainLink = root.entity.getLinkByRel(Rels.user).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					const displayEntity = domainResponse.entity.getSubEntityByRel(Rels.displayName);
					return displayEntity && displayEntity.properties && displayEntity.properties.name;
				}
			}
		}
		return undefined;
	}

	async getGroupName() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.group)) {
				const domainLink = root.entity.getLinkByRel(Rels.group).href;
				const domainResponse = await this._getEntityFromHref(domainLink, false);

				if (domainResponse && domainResponse.entity) {
					const displayEntity = domainResponse.entity.getSubEntityByRel(Rels.displayName);
					return displayEntity && displayEntity.properties && displayEntity.properties.name;
				}
			}
		}
		return undefined;
	}

	async getGroupInfo() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const groupHref = this._getHref(root.entity, Rels.group);
			if (groupHref) {
				const groupEntity = await this._getEntityFromHref(groupHref, false);
				const viewMembersEntity = groupEntity.entity.getSubEntityByRel(viewMembersRel);
				const viewMembersPath = viewMembersEntity ? viewMembersEntity.properties.path : undefined;

				const pagerEntity = groupEntity.entity.getSubEntityByRel(pagerRel);
				const pagerPath = pagerEntity ? pagerEntity.properties.path : undefined;

				const emailEntity = groupEntity.entity.getSubEntityByRel(emailRel);
				const emailPath = emailEntity ? emailEntity.properties.path : undefined;

				return {
					viewMembersPath,
					pagerPath,
					emailPath
				};
			}
			return undefined;
		}
	}

	async getEnrolledUser() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const enrolledUserHref = this._getHref(root.entity, enrolledUserRel);
			const groupHref = this._getHref(root.entity, groupRel);
			if (enrolledUserHref) {
				const enrolledUserEntity = await this._getEntityFromHref(enrolledUserHref, false);
				const pagerEntity = enrolledUserEntity.entity.getSubEntityByRel(pagerRel);
				const emailEntity = enrolledUserEntity.entity.getSubEntityByRel(emailRel, false);
				const userProfileEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.userProfile);
				const displayNameEntity = enrolledUserEntity.entity.getSubEntityByRel(Rels.displayName);
				const userProgressEntity = root.entity.getSubEntityByRel(userProgressAssessmentsRel, false);

				let displayName = undefined;
				let pagerPath = undefined;
				let userProgressPath = undefined;
				let emailPath = undefined;
				let userProfilePath = undefined;

				if (displayNameEntity) {
					displayName = displayNameEntity.properties.name;
				}
				if (pagerEntity) {
					pagerPath = pagerEntity.properties.path;
				}
				if (userProgressEntity) {
					userProgressPath = userProgressEntity.properties.path;
				}
				if (emailEntity) {
					emailPath = emailEntity.properties.path;
				}
				if (userProfileEntity) {
					userProfilePath = userProfileEntity.properties.path;
				}
				return {
					displayName,
					enrolledUserHref,
					emailPath,
					pagerPath,
					userProgressPath,
					userProfilePath
				};
			} else if (groupHref) {
				const groupEntity = await this._getEntityFromHref(groupHref, false);
				const pagerEntity = groupEntity.entity.getSubEntityByRel(pagerRel);
				let pagerPath = undefined;
				if (pagerEntity) {
					pagerPath = pagerEntity.properties.path;
				}
				return {
					groupHref,
					pagerPath
				};
			}

			return undefined;
		}
	}

	async getIteratorInfo(iteratorProperty) {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			switch (iteratorProperty) {
				case 'total':
					return root.entity.properties?.iteratorTotal;
				case 'index':
					return root.entity.properties?.iteratorIndex;
				default:
					break;
			}
		}
		return undefined;
	}

	async getAnonymousInfo() {
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const assignmentHref = this._getHref(root.entity, assignmentRel);
			if (assignmentHref) {
				const assignmentEntity = await this._getEntityFromHref(assignmentHref);
				if (assignmentEntity.entity.hasSubEntityByRel(anonymousMarkingRel)) {
					const anonymousAssignmentEntity = assignmentEntity.entity.getSubEntityByRel(anonymousMarkingRel);
					const isAnonymous = anonymousAssignmentEntity.hasClass(checkedClassName);
					const assignmentHasPublishedSubmission = anonymousAssignmentEntity.hasClass(publishedClassName);
					return {
						isAnonymous,
						assignmentHasPublishedSubmission
					};
				} else {
					return {
						isAnonymous: false
					};
				}
			}
		}
		return undefined;
	}

	async getRubricInfos(refreshRubric) {
		let rubricInfos = [];
		const root = await this._getRootEntity(false);
		if (root && root.entity) {
			const rubricHrefs = this._getHrefs(root.entity, assessmentRel);
			if (rubricHrefs) {
				rubricInfos = await Promise.all(rubricHrefs.map(async rubricAssessmentHref => {
					const assessmentEntity = await this._getEntityFromHref(rubricAssessmentHref, refreshRubric);
					if (refreshRubric) {
						await this._refreshRubricAssessment(assessmentEntity);
					}
					if (assessmentEntity && assessmentEntity.entity) {
						const rubricHref = this._getHref(assessmentEntity.entity, rubricRel);
						const rubricEntity = await this._getEntityFromHref(rubricHref, false);
						const rubricTitle = rubricEntity.entity.properties.name;
						const rubricId = rubricEntity.entity.properties.rubricId.toString();
						const rubricOutOf = rubricEntity.entity.properties.outOf;
						const rubricScoringMethod = rubricEntity.entity.properties.scoringMethod;

						const hasUnscoredCriteria = assessmentEntity.entity.hasClass('incomplete');

						let assessorDisplayName = null;
						const assessorUserHref = this._getHref(assessmentEntity.entity, assessorUserRel);
						if (assessorUserHref) {
							const assessorUserEntity = await this._getEntityFromHref(assessorUserHref, false);
							assessorDisplayName = assessorUserEntity.entity.getSubEntityByRel(Rels.displayName).properties.name;
						}

						return {
							rubricHref,
							rubricAssessmentHref,
							rubricTitle,
							rubricId,
							rubricOutOf,
							rubricScoringMethod,
							assessorDisplayName,
							hasUnscoredCriteria
						};
					}
				}));
			}
		}

		return rubricInfos.filter(rubricInfo => rubricInfo !== undefined);
	}

	async getEditActivityPath() {
		const root = await this._getRootEntity(false);
		let editActivityPath = undefined;
		if (root && root.entity) {
			if (root.entity.hasLinkByRel(Rels.Activities.activityUsage)) {
				const activityUsageLink = root.entity.getLinkByRel(Rels.Activities.activityUsage).href;
				const activityUsageResponse = await this._getEntityFromHref(activityUsageLink, false);
				if (activityUsageResponse && activityUsageResponse.entity) {
					const editAcitivityEntity = activityUsageResponse.entity.getSubEntityByRel(editActivityRel);
					editActivityPath = editAcitivityEntity ? editAcitivityEntity.properties.path : undefined;
				}
			}
		}
		return editActivityPath;
	}

	async _refreshRubricAssessment(assessmentEntity) {
		if (assessmentEntity && assessmentEntity.entity) {
			const criterion = assessmentEntity.entity.getSubEntitiesByClass('criterion-assessment-links');
			criterion.map(async x => {
				const criterionAssessmentHref = x.getLinkByRel('https://assessments.api.brightspace.com/rels/assessment-criterion');
				if (criterionAssessmentHref) {
					await this._getEntityFromHref(criterionAssessmentHref, true);
				}
			});
		}
	}
}
