function ready(){

	superagent.get('sample-issues.md').end(function(e, data){
		window.issues = issuemd(data.text);
		console.log(issues.html());
		console.log(issues.md());
		console.log(issues.toString());
		console.log(issues.toString(120));
	});

}