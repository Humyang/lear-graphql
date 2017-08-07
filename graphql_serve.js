// import koa from 'koa'; // koa@2
// import koaRouter from 'koa-router'; // koa-router@next
// import koaBody from 'koa-bodyparser'; // koa-bodyparser@next
// import { graphqlKoa } from 'graphql-server-koa';

var koa = require('koa')
var koaRouter = require('koa-router')
var koaBody = require('koa-body')
var body = require('koa-better-body')
var graphqlKoa = require('graphql-server-koa').graphqlKoa
var { buildSchema } = require('graphql');
const app = new koa();
const router = new koaRouter();
const PORT = 3300;
var serve = require('koa-static');
debugger;
// koaBody is needed just for POST.
app.use(body());

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
class Note {
  constructor() {
  }

  note_id() {
    return '1231231233'
  }

  note() {
    return '12333123123'
  }
}
// ,
//     position:Position
var myGraphQLSchema = buildSchema(`
  type RandomDie{
    numSides:Int!,
    rollOnce:Int!,
    roll(numRolls:Int!):[Int]
  }
  type Mutation {
    setMessage(message: String): String
  }
  type Position{
    x:Int!,
    y:Int!
  }
  type Note{
    note_id:String,
    note:String,
    position:Position
  }
  type Query {
    hello: String,
    rollDice(numDice:Int!,numSides:Int):[Int],
    quoteOfTheDay:String,
    random:Float!
    rollThreeDice:[Int],
    getDie(numSides:Int):RandomDie,
    getMessage:String,
    getlist:[Note]
  }
`);
var fakeDatabase = {}
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
  getDie:function({numSides},ctx,obj){
    //obj： The previous object, which for a field on the root Query type is often not used.
    return new RandomDie(numSides || 6)
  },
  setMessage:function({message}){
    fakeDatabase.message = message
    return message+"abc"
  },
  getMessage:(post, args, context, b) => {
      return 'postRepository.getBody(context.user, post)';
  },
  getlist:function(){
    return [{
      note_id:'123',
      note:'1233',
      position:{
        x:1,
        y:2
      }
    }]
    // return new Note()
    // return [new Note(),new Note()]
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
// router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
//   graphiql: true }));

router.post('/graphql',async function(ctx,next){
  // ctx.aaa = 123
  ctx.request.body=Object.assign({},ctx.request.fields)
  await next(ctx)
}, graphqlKoa((ctx) => {

  return { schema: myGraphQLSchema,rootValue: root,
  graphiql: true,operationName:'RollDice',context:ctx 
}
}));
// router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
//   graphiql: true,operationName:'RollDice2' }));
// router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
//   graphiql: true,operationName:'SetMessage' }));
// router.get('/graphql', graphqlKoa({ schema: myGraphQLSchema,rootValue: root,
//   graphiql: true }));

app.use(async function(ctx,next){
	ctx.set('Access-Control-Allow-Origin', "*");
	await next()
})
app.use(serve(".",{maxage:3153600000}))
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);

console.log('Running a GraphQL API server at localhost:3000/graphql');