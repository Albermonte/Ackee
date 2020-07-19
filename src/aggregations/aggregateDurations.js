'use strict'

const intervals = require('../constants/intervals')
const matchDomains = require('../stages/matchDomains')
const projectDuration = require('../stages/projectDuration')
const projectMinInterval = require('../stages/projectMinInterval')
const matchLimit = require('../stages/matchLimit')

module.exports = (ids, interval, limit, dateDetails) => {

	const aggregation = [
		matchDomains(ids),
		projectDuration(),
		projectMinInterval(),
		matchLimit(),
		{
			$group: {
				_id: {},
				count: {
					$avg: '$duration'
				}
			}
		},
		{
			$sort: {
				'_id.year': -1,
				'_id.month': -1,
				'_id.day': -1
			}
		}
	]

	const dateExpression = { date: '$created', timezone: dateDetails.timeZone }

	if (interval === intervals.INTERVALS_DAILY) {
		aggregation[0].$match.created = { $gte: dateDetails.includeDays(limit) }
		aggregation[4].$group._id.day = { $dayOfMonth: dateExpression }
		aggregation[4].$group._id.month = { $month: dateExpression }
		aggregation[4].$group._id.year = { $year: dateExpression }
	}

	if (interval === intervals.INTERVALS_MONTHLY) {
		aggregation[0].$match.created = { $gte: dateDetails.includeMonths(limit) }
		aggregation[4].$group._id.month = { $month: dateExpression }
		aggregation[4].$group._id.year = { $year: dateExpression }
	}

	if (interval === intervals.INTERVALS_YEARLY) {
		aggregation[0].$match.created = { $gte: dateDetails.includeYears(limit) }
		aggregation[4].$group._id.year = { $year: dateExpression }
	}

	return aggregation

}