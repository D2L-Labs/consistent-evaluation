// import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { anonymousMarkingRel, checkedClassName, editActivityRel, editSpecialAccessApplicationRel, emailRel,
	evaluationRel, nextRel, pagerRel, previousRel, publishedClassName, rubricRel,
	userProgressAssessmentsRel, viewMembersRel } from '../components/controllers/constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { ConsistentEvaluationHrefController, ConsistentEvaluationHrefControllerErrors } from '../components/controllers/ConsistentEvaluationHrefController';
import { assert } from '@open-wc/testing';
import sinon from 'sinon';

describe('ConsistentEvaluationHrefController', () => {
	describe('instantiates properly and throws the correct errors', () => {
		it('accepts a proper href and token string', () => {
			assert.doesNotThrow(() => {
				new ConsistentEvaluationHrefController('href', 'token');
			});
		});

		it('throws an error when empty string given for href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController('', 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		});

		it('throws an error for null href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController(null, 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_BASE_HREF);
		});

		it('throws an error for non string href', () => {
			assert.throws(() => {
				new ConsistentEvaluationHrefController(20, 'token');
			}, ConsistentEvaluationHrefControllerErrors.INVALID_TYPE_BASE_HREF);
		});
	});

	describe('getHrefs works properly and will set the correct hrefs', () => {
		const relations = [
			{ key: 'evaluationHref', rel: evaluationRel },
			{ key: 'nextHref', rel: nextRel },
			{ key: 'previousHref', rel: previousRel },
		];

		// testing that each href is solely set
		relations.forEach(({ key, rel }) => {
			it(`sets only the ${key} properly`, async() => {

				const controller = new ConsistentEvaluationHrefController('href', 'token');
				const href = 'the_href_to_find';
				const expectedSpecialAcessPath = 'the_special_access_path';

				sinon.stub(controller, '_getRootEntity').returns({
					entity: {
						hasLinkByRel: (r) => r === rel,
						getLinkByRel: (r) => (r === rel ? { href } : undefined),
						hasSubEntityByRel: (r) => r === editSpecialAccessApplicationRel,
						getSubEntityByRel: (r) => (r === editSpecialAccessApplicationRel ? { properties: {path: expectedSpecialAcessPath}} : undefined)
					}
				});

				const hrefs = await controller.getHrefs(true);

				// make sure that only the current key is assigned an href
				relations.forEach(relation => {
					assert.equal(hrefs[relation.key], relation.key === key ? href : undefined);
				});

				controller._getRootEntity.restore();
			});
		});

	});

	describe('getSubmissionInfo works', () => {
		it('sets the submission info', async() => {
			const assignmentHref = 'expected_assignment_href';
			const expectedSubmissions = ['link1', 'link2'];
			const expectedEvaluationState = 'Draft';
			const expectedSubmissionType = 0;

			const controller = new ConsistentEvaluationHrefController('href', 'token');
			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.assignment,
					getLinkByRel: (r) => (r === Rels.assignment ? { href: assignmentHref } : undefined),
					getSubEntityByClass: (r) => (r === Classes.assignments.submissionList ? { links: expectedSubmissions } : undefined),
					getSubEntityByRel: (r) => (r === Rels.evaluation ? { properties: {state: expectedEvaluationState}} : undefined)
				}
			});
			sinon.stub(controller, '_getEntityFromHref').returns({
				entity: {
					properties: {submissionType: {title: 'File Submission', value : expectedSubmissionType}}
				}
			});
			const submissionInfo = await controller.getSubmissionInfo();
			assert.equal(submissionInfo.submissionList, expectedSubmissions);
			assert.equal(submissionInfo.evaluationState, expectedEvaluationState);
			assert.equal(submissionInfo.submissionType, expectedSubmissionType);
		});
	});

	describe('getGradeItemInfo gets correct grade item info', () => {
		it('sets the gradeItem info', async() => {
			const activityUsageHref = 'expected_activity_usage_href';
			const gradeHref = 'expected_grade_href';
			const evaluationUrl = 'expectedEvaluationUrl';
			const statsUrl = 'expectedStatsUrl';
			const gradeItemName = 'expectedGradeItemName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.Activities.activityUsage,
					getLinkByRel: (r) => (r === Rels.Activities.activityUsage ? { href: activityUsageHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(activityUsageHref, false).returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.Grades.grade,
					getLinkByRel: (r) => (r === Rels.Grades.grade ? { href: gradeHref } : undefined)
				}
			});

			getHrefStub.withArgs(gradeHref, false).returns({
				entity: {
					properties: {
						evaluationUrl: evaluationUrl,
						statsUrl: statsUrl,
						name: gradeItemName
					}
				}
			});

			const gradeItemInfo = await controller.getGradeItemInfo();
			assert.equal(gradeItemInfo.evaluationUrl, evaluationUrl);
			assert.equal(gradeItemInfo.statsUrl, statsUrl);
			assert.equal(gradeItemInfo.gradeItemName, gradeItemName);
		});
	});

	describe('getGroupInfo gets correct group info', async() => {
		const groupInfoHref = 'groupInfoHref';
		const viewMembersPath = 'viewMembersPath';
		const emailPath = 'emailPath';
		const pagerPath = 'pagerPath';

		const controller = new ConsistentEvaluationHrefController('href', 'token');

		sinon.stub(controller, '_getRootEntity').returns ({
			entity: { }
		});

		sinon.stub(controller, '_getHref').returns(groupInfoHref);

		sinon.stub(controller, '_getEntityFromHref').returns({
			entity: {
				getSubEntityByRel: (r) => {
					if (r === viewMembersRel) {
						return { properties: { path: viewMembersPath }};
					} else if (r === emailRel) {
						return { properties: { path: emailPath } };
					} else if (r === pagerRel) {
						return { properties: { path: pagerPath } };
					}
				}
			}
		});

		const groupInfo = await controller.getGroupInfo();

		assert.equal(groupInfo.viewMembersPath, viewMembersPath);
		assert.equal(groupInfo.emailPath, emailPath);
		assert.equal(groupInfo.pagerPath, pagerPath);
	});

	describe('getEnrolledUser gets correct enrolled user info', () => {
		it('sets the enrolled user info', async() => {
			const enrolledUserHref = 'enrolledUserHref';
			const emailPath = 'emailPath';
			const pagerPath = 'pagerPath';
			const userProgressPath = 'userProgress';
			const userProfilePath = 'userProfilePath';
			const displayName = 'displayName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					getSubEntityByRel: (r) => {
						if (r === userProgressAssessmentsRel) {
							return { properties: { path: userProgressPath } };
						}
					}
				}
			});

			sinon.stub(controller, '_getHref').returns(enrolledUserHref);
			sinon.stub(controller, '_getEntityFromHref').returns({
				entity: {
					getSubEntityByRel: (r) => {
						if (r === pagerRel) {
							return { properties: { path: pagerPath } };
						} else if (r === emailRel) {
							return { properties: { path: emailPath } };
						} else if (r === Rels.displayName) {
							return { properties: { name: displayName } };
						} else {
							return { properties: { path: userProfilePath } };
						}
					}
				}
			});

			const enrolledUser = await controller.getEnrolledUser();
			assert.equal(enrolledUser.enrolledUserHref, enrolledUserHref);
			assert.equal(enrolledUser.pagerPath, pagerPath);
			assert.equal(enrolledUser.userProgressPath, userProgressPath);
			assert.equal(enrolledUser.userProfilePath, userProfilePath);
			assert.equal(enrolledUser.emailPath, emailPath);
			assert.equal(enrolledUser.displayName, displayName);
		});
	});

	describe('getEditActivityPath gets correct enrolled path', () => {
		it('sets the edit activity path', async() => {
			const activityUsageHref = 'activity-usage-href';
			const editActivityPath = 'editActivityPath';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.Activities.activityUsage,
					getLinkByRel: (r) => (r === Rels.Activities.activityUsage ? { href: activityUsageHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(activityUsageHref, false).returns({
				entity: {
					getSubEntityByRel: (r) => (r === editActivityRel ? { properties: {path: editActivityPath}} : undefined)
				}
			});

			const actualActivityPath = await controller.getEditActivityPath();
			assert.equal(actualActivityPath, editActivityPath);
		});
	});

	describe('getAssignmentOrganizationName gets correct info', () => {
		it('sets the assignment name', async() => {
			const assignmentHref = 'expected_assignment_href';
			const expectedAssignmentName = 'expectedAssignmentName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.assignment,
					getLinkByRel: (r) => (r === Rels.assignment ? { href: assignmentHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(assignmentHref, false).returns({
				entity: {
					properties: {
						name: expectedAssignmentName
					}
				}
			});

			const actualAssignmentName = await controller.getAssignmentOrganizationName('assignment');
			assert.equal(actualAssignmentName, expectedAssignmentName);
		});

		it('sets the organization name', async() => {
			const organizationHref = 'expected_organization_href';
			const expectedOrganizationName = 'expectedOrganizationName';

			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {
					hasLinkByRel: (r) => r === Rels.organization,
					getLinkByRel: (r) => (r === Rels.organization ? { href: organizationHref } : undefined)
				}
			});

			const getHrefStub = sinon.stub(controller, '_getEntityFromHref');

			getHrefStub.withArgs(organizationHref, false).returns({
				entity: {
					properties: {
						name: expectedOrganizationName
					}
				}
			});

			const actualOrganizationName = await controller.getAssignmentOrganizationName('organization');
			assert.equal(actualOrganizationName, expectedOrganizationName);
		});
	});

	describe('getAnonymousInfo gets correct group info', async() => {
		const assignmentHref = 'assignmentHref';

		const controller = new ConsistentEvaluationHrefController('href', 'token');

		sinon.stub(controller, '_getRootEntity').returns ({
			entity: { }
		});

		sinon.stub(controller, '_getHref').returns(assignmentHref);

		sinon.stub(controller, '_getEntityFromHref').returns({
			entity: {
				hasSubEntityByRel: () => true,
				getSubEntityByRel: (r) => {
					if (r === anonymousMarkingRel) {
						return { hasClass: (e) => {
							if (e === checkedClassName || e === publishedClassName) {
								return true;
							}
						} };
					}
				}
			}
		});

		const anonymousInfo = await controller.getAnonymousInfo();

		assert.equal(anonymousInfo.isAnonymous, true);
		assert.equal(anonymousInfo.assignmentHasPublishedSubmission, true);
	});

	describe('getRubricInfos gets correct rubric info', () => {

		it('sets all the rubricinfos correctly', async() => {
			const expectedAssessmentHrefOne = 'the_assessment_href_to_find_one';
			const expectedAssessmentHrefTwo = 'the_assessment_href_to_find_two';
			const expectedRubricHrefOne = 'the_rubric_href_to_find_one';
			const expectedRubricHrefTwo = 'the_rubric_href_to_find_two';
			const assessmentEntityOne = {
				name:'entity1',
				hasClass: () => true
			};
			const assessmentEntityTwo = {
				name:'entity2',
				hasClass: () => false
			};
			const rubricEntityOne = {
				properties: {
					name: 'rubric_one',
					rubricId: 1,
					outOf: 10,
					scoringMethod: 100
				}
			};
			const rubricEntityTwo = {
				properties: {
					name: 'rubric_two',
					rubricId: 2,
					outOf: 20,
					scoringMethod: 200
				}
			};
			const controller = new ConsistentEvaluationHrefController('href', 'token');

			sinon.stub(controller, '_getRootEntity').returns({
				entity: {}
			});

			sinon.stub(controller, '_getHrefs').returns([
				expectedAssessmentHrefOne,
				expectedAssessmentHrefTwo
			]);

			sinon.stub(controller, '_getEntityFromHref')
				.withArgs(expectedAssessmentHrefOne, false)
				.returns({
					entity: assessmentEntityOne
				})
				.withArgs(expectedAssessmentHrefTwo, false)
				.returns({
					entity: assessmentEntityTwo
				})
				.withArgs(expectedRubricHrefOne, false)
				.returns({
					entity: rubricEntityOne
				})
				.withArgs(expectedRubricHrefTwo, false)
				.returns({
					entity: rubricEntityTwo
				});

			sinon.stub(controller, '_getHref')
				.withArgs(assessmentEntityOne, rubricRel)
				.returns(
					expectedRubricHrefOne
				)
				.withArgs(assessmentEntityTwo, rubricRel)
				.returns(
					expectedRubricHrefTwo
				);

			const rubricInfos = await controller.getRubricInfos(false);

			assert.equal(rubricInfos.length, 2);
			assert.equal(rubricInfos[0].rubricHref, expectedRubricHrefOne);
			assert.equal(rubricInfos[1].rubricHref, expectedRubricHrefTwo);

			assert.equal(rubricInfos[0].rubricAssessmentHref, expectedAssessmentHrefOne);
			assert.equal(rubricInfos[1].rubricAssessmentHref, expectedAssessmentHrefTwo);

			assert.equal(rubricInfos[0].rubricTitle, rubricEntityOne.properties.name);
			assert.equal(rubricInfos[0].rubricId, rubricEntityOne.properties.rubricId);
			assert.equal(rubricInfos[0].rubricOutOf, rubricEntityOne.properties.outOf);
			assert.equal(rubricInfos[0].rubricScoringMethod, rubricEntityOne.properties.scoringMethod);
			assert.equal(rubricInfos[1].rubricTitle, rubricEntityTwo.properties.name);
			assert.equal(rubricInfos[1].rubricId, rubricEntityTwo.properties.rubricId);
			assert.equal(rubricInfos[1].rubricOutOf, rubricEntityTwo.properties.outOf);
			assert.equal(rubricInfos[1].rubricScoringMethod, rubricEntityTwo.properties.scoringMethod);

			assert.equal(rubricInfos[0].hasUnscoredCriteria, assessmentEntityOne.hasClass('incomplete'));
			assert.equal(rubricInfos[1].hasUnscoredCriteria, assessmentEntityTwo.hasClass('incomplete'));
		});
	});
});
