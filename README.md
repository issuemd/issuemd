# issuemd - issue tracking in hand

## Key concepts

Issue data is the heart of the issuemd library.

- A collection is an issuemd instance, which groups issues
- An issue is a single item within the collection
- An issue retains the original data used to create it
- An issue's history is recorded as a ever growing log
- The issue (including it's full history) can be viewed as a text or HTML summary, markdown format log or as template friendly JSON data

## How to use

issuemd aims to simplify working with issue data, taking influences from underscore and jQuery.

### Getting started

The easiest way to create an issue, is to call issuemd, passing an object hash representing issue data. The main fields for an issue are title, creator, created and body. If created is not specified, it will be set to now.

    var issues = issuemd({
        title: 'my funky issue',
        creator: 'some guy',
        body: 'some issue-tastic problem'
    });

... you can then convert the collection to JSON ...

    JSON.stringify(issues);
    /* ->
    [{
        "original": {
            "title": "my funky issue",
            "creator": "some guy",
            "created": "2016-02-08T19:48:51.621+0000",
            "meta": [],
            "body": "some issue-tastic problem"
        },
        "updates": []
    }]
    */

The collection is an array like object, with one issue. The issue has two main parts - original, and updates. The original part is used to create the issue, and updates are added to after that like a log file. Although it is possible to edit the original values at any time, it is discouraged, as you will lose the history. The concept of writing as a log means that information can be extracted form the history of the issue collection to generate meaningful reports, and retain a proper audit trail.

The original part of an issue has a meta array, which is used for storing unknown key/value pairs. This can be read and written with the `.attr()` method...

... with a single argument string, the attribute's current value is returned ...

    issues.attr('title');
    // -> "my funky issue"

... with two argument strings, or an arguments array, issue attribute values are set. If it is one of the main attributes (title/created/creator/body) it will be set on the `original` object directly, otherwise it will be added to the `original.meta` array. This structure is useful for templating, where traversing object keys is more tricky than iterating arrays.

    issues.attr('title','My super issue!');
    issues.attr({priority:'high',creator:'The Man'});
    /* ->
    [{
        "original": {
            "title": "my funky issue",
            "creator": "The Man",
            "created": "2016-02-08T19:48:51.621+0000",
            "meta": [{
                "key": "priority",
                "value": "high"
            }],
            "body": "some issue-tastic problem"
        },
        "updates": []
    }]
    */

Updates are similar to the original object, but take slightly different attributes...

    issues.update({type:'edit', modifier:'Another guy', priority: 'low'});
    issues.update({type:'comment', modifier:'Another guy', body: 'lets not spend too much time on this right now'});
    /* ->
    [{
        "original": {
            "title": "my funky issue",
            "creator": "The Man",
            "created": "2016-02-08T19:48:51.621+0000",
            "meta": [{
                "key": "priority",
                "value": "high"
            }],
            "body": "some issue-tastic problem"
        },
        "updates": [{
            "meta": [{
                "key": "priority",
                "value": "low"
            }],
            "type": "edit",
            "modifier": "Another guy",
            "modified": "2016-02-08T19:53:23.503+0000"
        }, {
            "meta": [],
            "type": "comment",
            "modifier": "Another guy",
            "body": "lets not spend too much time on this right now",
            "modified": "2016-02-08T19:53:23.503+0000"
        }]
    }]
    */

In this case, Another guy has changed the priority to low, and then added a comment. The full history remains, so we can see that when the issue was created the priority was high, and it has been changed to low. It is possible to use the same update to change values, and add comment too...

    issues.update({type:'comment', modifier:'The Man', body: 'actually, I think this is the top priority to work on immediately', priority: 'high'});
    /* ->
    [{
        "original": {
            "title": "my funky issue",
            "creator": "The Man",
            "created": "2016-02-08T19:48:51.621+0000",
            "meta": [{
                "key": "priority",
                "value": "high"
            }],
            "body": "some issue-tastic problem"
        },
        "updates": [{
            "meta": [{
                "key": "priority",
                "value": "low"
            }],
            "type": "edit",
            "modifier": "Another guy",
            "modified": "2016-02-08T19:53:23.503+0000"
        }, {
            "meta": [],
            "type": "comment",
            "modifier": "Another guy",
            "body": "lets not spend too much time on this right now",
            "modified": "2016-02-08T19:53:23.503+0000"
        }, {
            "meta": [{
                "key": "priority",
                "value": "high"
            }],
            "type": "comment",
            "modifier": "The Man",
            "body": "actually, I think this is the top priority to work on immediately",
            "modified": "2016-02-08T19:55:36.624+0000"
        }]
    }]
    */

Now lets see what that looks like in markdown format, ready for disk storage...

    issues.md()
    /* ->
    ## my funky issue
    + created: 2016-02-08T19:48:51.621+0000
    + creator: The Man
    + priority: high
    
    some issue-tastic problem
    
    ---
    + modified: 2016-02-08T19:53:23.503+0000
    + modifier: Another guy
    + type: edit
    + priority: low
    
    
    ---
    + modified: 2016-02-08T19:53:23.503+0000
    + modifier: Another guy
    + type: comment
    
    lets not spend too much time on this right now
    
    ---
    + modified: 2016-02-08T19:55:36.624+0000
    + modifier: The Man
    + type: comment
    + priority: high
    
    actually, I think this is the top priority to work on immediately
    
    
    */

... or as HTML ...
    
    issues.html()
    /* ->
    <div class="issue">
      <div class="original">
        <div class="head">
          <h2>my funky issue</h2>
          <ul class="original-attr">
            <li><b>creator:</b> The Man</li>
            <li><b>created:</b> 2016-02-08T19:48:51.621+0000</li>
            <li><b>priority:</b> high</li>
          </ul>
        </div>
        <div class="body">
          <p>some issue-tastic problem</p>
        </div>
      </div>
      <div class="updates">
        <hr class="update-divider">
        <div class="update">
          <ul class="update-attr">
            <li><b>type:</b> edit</li>
            <li><b>modified:</b> 2016-02-08T19:53:23.503+0000</li>
            <li><b>modifier:</b> Another guy</li>
            <li><b>priority:</b> low</li>
          </ul>
          <div class="update-body">
          </div>
        </div>
        <hr class="update-divider">
        <div class="update">
          <ul class="update-attr">
            <li><b>type:</b> comment</li>
            <li><b>modified:</b> 2016-02-08T19:53:23.503+0000</li>
            <li><b>modifier:</b> Another guy</li>
          </ul>
          <div class="update-body">
            <p>lets not spend too much time on this right now</p>
          </div>
        </div>
        <hr class="update-divider">
        <div class="update">
          <ul class="update-attr">
            <li><b>type:</b> comment</li>
            <li><b>modified:</b> 2016-02-08T19:55:36.624+0000</li>
            <li><b>modifier:</b> The Man</li>
            <li><b>priority:</b> high</li>
          </ul>
          <div class="update-body">
            <p>actually, I think this is the top priority to work on immediately</p>
          </div>
        </div>
      </div>
    </div>
    */

... or as a table formatted string (with optional width in characters specified, defaults to 80)

    issues.toString(60);
    /* ->
    +----------------------------------------------------------+
    | my funky issue                                           |
    +-----------+----------------------------------------------+
    | signature | The Man @ 2016-02-08T19:48:51.621+0000       |
    | priority  | high                                         |
    |                                                          |
    | some issue-tastic problem                                |
    |                                                          |
    +-----------+----------------------------------------------+
    | comment   | Another guy @ 2016-02-08T19:53:23.503+0000   |
    |                                                          |
    | lets not spend too much time on this right now           |
    |                                                          |
    +-----------+----------------------------------------------+
    | comment   | The Man @ 2016-02-08T19:55:36.624+0000       |
    |                                                          |
    | actually, I think this is the top priority to work on    |
    | immediately                                              |
    +----------------------------------------------------------+
    */

It is surprisingly useful to be able to search issues with text editors, and cli tools without having to rely on complex client/server system search facilities.

