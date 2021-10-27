var express = require('express');
var router = express.Router();
var request = require('request');

module.exports = function (session) {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
  });


  router.post('/user', function (req, res, next) {
    session
      .run("CREATE(n:User {name:$nameParam, id: $idParam}) RETURN n.id", { nameParam: req.body.name, idParam: req.body.id })
      .then((result) => {
        res.send({ status: 'success' });
      })
  });

  router.post('/user/connect', function (req, res, next) {
    session
      .run("MATCH(a:User {id: $from}),(b:User {id: $to}) MERGE(a)-[r:TRAINED_BY]-(b) RETURN a,b", { from: req.body.from, to: req.body.to })
      .then((result) => {
        res.send({ status: 'success' });
      })

  });

  router.get('/user/:id', function (req, res, next) {
    var id = req.params.id;
    session
      .run("MATCH (a:User)-[r:TRAINED_BY]->(b:User) WHERE a.id=$idParam RETURN b", { idParam: id.toString() })
      .then((result) => {
        session
          .run("MATCH (a:User)<-[r:TRAINED_BY]-(b:User) WHERE a.id=$idParam RETURN b", { idParam: id.toString() })
          .then((result2) => {
            request('https://fakestoreapi.com/users', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                let responseData = JSON.parse(response.body);
                let coach = result.records.map(record => {
                  return responseData.filter(fakeUser => fakeUser.id.toString() === record._fields[0].properties.id)[0];
                })
                let player = result2.records.map(record => {
                  return responseData.filter(fakeUser => fakeUser.id.toString() === record._fields[0].properties.id)[0];
                })
                res.send({ status: 'success', coach, player });
              } else {
                res.status(400).send({ status: 'error', error });
              }
            });
          })
      })
  });

  return router;
}