module.exports = function(){

  return {

    simple_issue: [
      '## The issue title',
      '+ created: 2012-03-04 10:22:03',
      '+ creator: Some Guy',
      '',
      'Just a simple issue'
    ].join('\n'),

    simple_issue_json: JSON.stringify({
      original: {
        title: 'The issue title',
        creator: 'Some Guy',
        created: '2012-03-04 10:22:03',
        meta: [],
        body: 'Just a simple issue'
      },
      updates: []
    }),

    simple_issue_with_meta: [
      '## The issue title',
      '+ created: 2012-03-04 10:22:03',
      '+ creator: Some Guy',
      '+ labels: important, easy',
      '',
      'Just a simple issue with meta'
    ].join('\n'),

    simple_issue_with_meta_json: JSON.stringify({
      original: {
        title: 'The issue title',
        creator: 'Some Guy',
        created: '2012-03-04 10:22:03',
        meta: [
          {
            key: 'labels',
            val: 'important, easy'
          }
        ],
        body: 'Just a simple issue with meta'
      },
      updates: []
    }),

    simple_issue_with_meta_malformed: [
      '##     The issue title',
      '+   created: 2012-03-04 10:22:03',
      '+    creator: Some Guy',
      '+ labels: important, easy',
      '',
      'Just a simple issue with meta'
    ].join('\n'),

    issue_with_comments: [
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

    issue_with_comments_json: JSON.stringify({
      original: {
        title: 'The issue title',
        creator: 'Some Guy',
        created: '2012-03-04 10:22:03',
        meta: [],
        body: 'Just a simple issue'
      },
      updates:[
        {
          meta: [],
          modified: '2012-03-04 10:25:00',
          modifier: 'Some Guy',
          body: 'Just a little comment'
        }, {
          meta: [],
          modified: '2012-03-04 10:26:00',
          modifier: 'Some Other Guy',
          body: 'Some Other Guy says...'
        }
      ]
    })

  };

}();