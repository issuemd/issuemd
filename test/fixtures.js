'use strict';

module.exports = function () {

    return {

        emptyIssue: [
            '+------------------------------------------------------------------------------+',
            '|                                                                              |',
            '+-----------+------------------------------------------------------------------+',
            '| created   | 2015-06-27 19:42:56                                              |',
            '| creator   |                                                                  |',
            '|                                                                              |',
            '|                                                                              |',
            '+------------------------------------------------------------------------------+',
            ''
        ].join('\n'),

        simpleIssue: [
            '## The issue title',
            '+ created: 2012-03-04 10:22:03',
            '+ creator: Some Guy',
            '',
            'Just a simple issue'
        ].join('\n'),

        simpleIssueJson: JSON.stringify({
            original: {
                title: 'The issue title',
                creator: 'Some Guy',
                created: '2012-03-04 10:22:03',
                meta: [],
                body: 'Just a simple issue'
            },
            updates: []
        }),

        simpleIssueWithMeta: [
            '## The issue title',
            '+ created: 2012-03-04 10:22:03',
            '+ creator: Some Guy',
            '+ labels: important, easy',
            '',
            'Just a simple issue with meta'
        ].join('\n'),

        simpleIssueWithMetaJson: JSON.stringify({
            original: {
                title: 'The issue title',
                creator: 'Some Guy',
                created: '2012-03-04 10:22:03',
                meta: [{
                    key: 'labels',
                    value: 'important, easy'
                }],
                body: 'Just a simple issue with meta'
            },
            updates: []
        }),

        simpleIssueWithMetaMalformed: [
            '##     The issue title',
            '+   created: 2012-03-04 10:22:03',
            '+    creator: Some Guy',
            '+ labels: important, easy',
            '',
            'Just a simple issue with meta'
        ].join('\n'),

        issueWithComments: [
            '## The issue title',
            '+ created: 2012-03-04 10:22:03',
            '+ creator: Some Guy',
            '',
            'Just a simple issue',
            '',
            '---',
            '+ modified: 2012-03-04 10:25:00',
            '+ modifier: Some Guy',
            '',
            'Just a little comment',
            '',
            '---',
            '+ modified: 2012-03-04 10:26:00',
            '+ modifier: Some Other Guy',
            '',
            'Some Other Guy says...'
        ].join('\n'),

        issueWithCommentsJson: JSON.stringify({
            original: {
                title: 'The issue title',
                creator: 'Some Guy',
                created: '2012-03-04 10:22:03',
                meta: [],
                body: 'Just a simple issue'
            },
            updates: [{
                meta: [],
                modified: '2012-03-04 10:25:00',
                modifier: 'Some Guy',
                body: 'Just a little comment'
            }, {
                meta: [],
                modified: '2012-03-04 10:26:00',
                modifier: 'Some Other Guy',
                body: 'Some Other Guy says...'
            }]
        })

    };

}();