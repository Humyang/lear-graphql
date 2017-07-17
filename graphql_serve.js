// import koa from 'koa'; // koa@2
// import koaRouter from 'koa-router'; // koa-router@next
// import koaBody from 'koa-bodyparser'; // koa-bodyparser@next
// import { graphqlKoa } from 'graphql-server-koa';

var koa = require('koa')
var koaRouter = require('koa-router')
var koaBody = require('koa-body')
var graphqlKoa = require('graphql-server-koa').graphqlKoa
var { buildSchema } = require('graphql');
var cors = require('koa-cors')
const app = new koa();
const router = new koaRouter();
const PORT = 3000;

// koaBody is needed just for POST.
app.use(koaBody());

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

var myGraphQLSchema = buildSchema(`
  type RandomDie{
    numSides:Int!,
    rollOnce:Int!,
    roll(numRolls:Int!):[Int]
  }
  type Query {
    hello: String,
    rollDice(numDice:Int!,numSides:Int):[Int],
    quoteOfTheDay:String,
    random:Float!
    rollThreeDice:[Int],
    getDie(numSides:Int):RandomDie
  }
`);
// resolver function
// 解析字段，返回数据
var root = {
  hello: () => {
    return 'Hello world!';
  },
  rollDice:({numDice, numSides})=>{
    return [123]
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
  },
  getDie:function({numSides}){
    return new RandomDie(numSides || 6)
  }
};

// router.get('/aabb',function(ctx,next){
// 	ctx.body = "success"
// 	console.log('aa')
// 	// next()
// })

// router.all('/*', function(ctx,next){
// 	ctx.set('Access-Control-Allow-Origin', "*");
// 	// next()
// });
router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
  graphiql: true }));
router.get('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
  graphiql: true }));

app.use(async function(ctx,next){
	ctx.set('Access-Control-Allow-Origin', "*");
	await next()
})
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);

console.log('Running a GraphQL API server at localhost:3000/graphql');