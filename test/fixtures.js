'use strict';

module.exports = function () {

    return {

        emptyIssue: [
            '+------------------------------------------------------------------------------+',
            '|                                                                              |',
            '+-----------+------------------------------------------------------------------+',
            '| signature | someguy @ 2015-06-27T19:42:56.000+0000                           |',
            '|                                                                              |',
            '|                                                                              |',
            '+------------------------------------------------------------------------------+',
            ''
        ].join('\n'),

        simpleIssue: [
            '## The issue title',
            '+ created: 2012-03-04T10:22:03.000+0000',
            '+ creator: Some Guy',
            '',
            'Just a simple issue',
            '',
            ''
        ].join('\n'),

        simpleIssueJson: JSON.stringify({
            original: {
                title: 'The issue title',
                created: '2012-03-04T10:22:03.000+0000',
                creator: 'Some Guy',
                meta: [],
                body: 'Just a simple issue'
            },
            updates: []
        }),

        simpleIssueWithMeta: [
            '## The issue title',
            '+ created: 2012-03-04T10:22:03.000+0000',
            '+ creator: Some Guy',
            '+ labels: important, easy',
            '',
            'Just a simple issue with meta',
            '',
            ''
        ].join('\n'),

        simpleIssueWithMetaJson: JSON.stringify({
            original: {
                title: 'The issue title',
                created: '2012-03-04T10:22:03.000+0000',
                creator: 'Some Guy',
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
            '+   created: 2012-03-04T10:22:03.000+0000',
            '+    creator: Some Guy',
            '+ labels: important, easy',
            '',
            'Just a simple issue with meta',
            '',
            ''
        ].join('\n'),

        issueWithComments: [
            '## The issue title',
            '+ created: 2012-03-04T10:22:03.000+0000',
            '+ creator: Some Guy',
            '',
            'Just a simple issue',
            '',
            '---',
            '+ modified: 2012-03-04T10:25:00.000+0000',
            '+ modifier: Some Guy',
            '+ type: comment',
            '',
            'Just a little comment',
            '',
            '---',
            '+ modified: 2012-03-04T10:26:00.000+0000',
            '+ modifier: Some Other Guy',
            '+ type: comment',
            '',
            'Some Other Guy says...',
            '',
            ''
        ].join('\n'),

        issueWithCommentsJson: JSON.stringify({
            original: {
                title: 'The issue title',
                created: '2012-03-04T10:22:03.000+0000',
                creator: 'Some Guy',
                meta: [],
                body: 'Just a simple issue'
            },
            updates: [{
                modified: '2012-03-04T10:25:00.000+0000',
                modifier: 'Some Guy',
                type: 'comment',
                meta: [],
                body: 'Just a little comment'
            }, {
                modified: '2012-03-04T10:26:00.000+0000',
                modifier: 'Some Other Guy',
                type: 'comment',
                meta: [],
                body: 'Some Other Guy says...'
            }]
        })

    };

}();