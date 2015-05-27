## totally different issue
+ created: 2015-05-04 18:52:29
+ creator: Luka
+ labels: red, green
+ aprettylonglabel: ok ok
+ number: 12

really, this is a totally different
issue which has a description here

Here we also use parenthesis, though this time not to capture the text matched, but because we want an either/or, i.e. we want to match one of two things: either we match one or more spaces, expressed with a literal space followed by + to denote one or more matches, or (expressed with the | operator) we want to match the end of the line (indicated by $) optionally followed by a newline, indicated by a \n and a question mark to make it optional.

The reason why we make the newline optional is that we could be faced with the last line of the text, and while there is an end of that line, there is not necessarily a newline.

So this part will match a consecutive run of spaces, or end of line. The magic happens when we combine that with the previous pattern, which matched 1-80 non-newline characters, because this additional match requires that the 1-80 non-newline characters are followed either by the consecutive run of spaces, or end of the line.

---
+ modified: 2015-05-04 18:53:29
+ modifier: Luka

just a little comment here

---
+ modified: 2015-05-04 18:53:29
+ modifier: Luka
+ labels: blue, silver
+ somesuperlongawesomelabel: an extremely great value

---
+ modified: 2015-05-04 18:53:29
+ modifier: Luka
+ importance: high
+ number: 14

really, this is a totally different asd asdasdasd asdasd asd asdasdasd asdasdasd asdasd asd asd asd asd asdasdasd asd asdasdasd asd asdasd
issue which has a description here

## totally different issue with a significantly longer title, which really drags on and on for quite a while...
+ created: 2015-05-04 18:52:29
+ creator: Luka
+ labels: red, green
+ aprettylonglabel: ok ok

really, this is a totally different asd asdasdasd asdasd asd asdasdasd asdasdasd asdasd asd asd asd asd asdasdasd asd asdasdasd asd asdasd
issue which has a description here

Here we also use parenthesis, though this time not to capture the text matched, but because we want an either/or, i.e. we want to match one of two things: either we match one or more spaces, expressed with a literal space followed by + to denote one or more matches, or (expressed with the | operator) we want to match the end of the line (indicated by $) optionally followed by a newline, indicated by a \n and a question mark to make it optional.

The reason why we make the newline optional is that we could be faced with the last line of the text, and while there is an end of that line, there is not necessarily a newline.

So this part will match a consecutive run of spaces, or end of line. The magic happens when we combine that with the previous pattern, which matched 1-80 non-newline characters, because this additional match requires that the 1-80 non-newline characters are followed either by the consecutive run of spaces, or end of the line.

---
+ modified: 2015-05-04 18:53:29
+ modifier: Luka
+ labels: blue, silver
+ prettylonglabel: an extremely great value