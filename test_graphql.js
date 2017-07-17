var {graphql,buildSchema} = require('graphql');

var schema = buildSchema(`
	type Query{
		hello(id: String = METER):String
	}
	`);
var root = {
	hello:(a,b,c)=>{
		// console.log(a.id)
		return {name:'hello world'}
	}
};

graphql(schema,'{hello(id: "1000")}',root).then((response)=>{
	console.log(response)
})