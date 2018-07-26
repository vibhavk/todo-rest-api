const expect = require('expect');
const request = require('supertest');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {User} = require('./../models/user.js');
const {dummyTodos,populateTodos,dummyUsers,populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos',()=>{
    it('Should create a new todo',(done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .send({
                text:text
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.find({text:text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e)=>done(e));
            });
    });

    it('Should not make garbage input notes',(done)=>{
        request(app)
            .post('/todos')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(2); //since 2 dummy feeds
                    done();
                }).catch((e)=>done(e));
            });
    });
});

describe('GET /todos',()=>{
    it('Should return all todos',(done)=>{
        request(app)
            .get('/todos')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(1); // 1 since both dummy users have posted only 1 todo each
            })
            .end(done);
    });
});

describe('GET /todos/id',()=>{
    it('Should return todo with requested ID',(done)=>{
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)//HexString converts object item to string
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('Should not return todo with ID of that of a different user',(done)=>{
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)//HexString converts object item to string
            .set('x-auth',dummyUsers[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('Should return 404 on todo not found',(done)=>{
        var dummyID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${dummyID}`)
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('Should return 404 on non-object IDs',(done)=>{
        request(app)
            .get('/todos/qwerty12345')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
      var hexId = dummyTodos[1]._id.toHexString();
  
      request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', dummyUsers[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
  
          Todo.findById(hexId).then((todo) => {
            expect(todo).toNotExist();
            done();
          }).catch((e) => done(e));
        });
    });
  
    it('should remove a todo', (done) => {
      var hexId = dummyTodos[0]._id.toHexString();
  
      request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', dummyUsers[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
  
          Todo.findById(hexId).then((todo) => {
            expect(todo).toExist();
            done();
          }).catch((e) => done(e));
        });
    });
  
    it('should return 404 if todo not found', (done) => {
      var hexId = new ObjectID().toHexString();
  
      request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', dummyUsers[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
  
    it('should return 404 if object id is invalid', (done) => {
      request(app)
        .delete('/todos/123abc')
        .set('x-auth', dummyUsers[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });


describe('PATCH/todos/id tests',()=>{
    it('Should update todo with passed id',(done)=>{
        var updatingBody = {
            text:"Updated",
            completed:true
        }
        request(app)
            .patch(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .send(updatingBody)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(updatingBody.text);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
            
    });
    it('Should not update todo unknown to me',(done)=>{
        var updatingBody = {
            text:"Updated",
            completed:true
        }
        request(app)
            .patch(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .set('x-auth',dummyUsers[1].tokens[0].token)
            .send(updatingBody)
            .expect(404)
            .end(done);
            
    });

    it('Should clear completedAt when completed is set to false',(done)=>{
        var updatingBody = {
            text:"Updated",
            completed:false
        }
        request(app)
            .patch(`/todos/${dummyTodos[1]._id.toHexString()}`)
            .set('x-auth',dummyUsers[1].tokens[0].token)
            .send(updatingBody)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(updatingBody.text);
                expect(res.body.todo.completedAt).toNotBe('number');
            })
            .end(done);
    });
});


describe('GET /users/me',()=>{
    it('should return user if authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(dummyUsers[0]._id.toHexString()); //HexString() because _id is an ObjectID object!
                expect(res.body.email).toBe(dummyUsers[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({}); //used to equal instead of toBe because we are comparing objects!
            })
            .end(done);
    });
});

describe('POST /users',()=>{
    it('should create a user when all credentials valid',(done)=>{
        var email  = "xcv@mnb.com";
        var password = "!!voodoo!!"

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist(); //be careful how we access x-auth in the header
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err)=>{
                if(err){
                    return done(err);
                }
                User.findOne({email}).then((user)=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done()
                    })
                    .catch((e)=>{
                        done(e);
                });
            });
    });

    it('should return validation error on invalid email or password entry',(done)=>{
        var email = 'xyz';
        var password ='456'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });

    it('should return error on requesting account with pre-existent email ID record',(done)=>{
        var email = dummyUsers[0].email;
        var password = '123456789'

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(400)
            .end(done);
    });

});

describe('POST /users/login', ()=>{
    it('Should login user and return auth token',(done)=>{
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].email,
                password: dummyUsers[1].password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toExist();
            })
            .end((err,res)=>{ //here we are passing a custom async function to end() instead of directly passing done()
                if(err){
                    return done(err);
                }

                User.findById({_id: dummyUsers[1]._id}).then((user)=>{ //checking if 2nd dummy user got the auth token attached to it.
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token:res.headers['x-auth']
                    });
                    done();
                }).catch((e)=>{
                    done(e);
                });
            });     
    });


    it('Should not login on sending wrong credentials',(done)=>{
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[0].email,
                password: 'dumdumdum'
            })
            .expect(400)
            .expect((res)=>{
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err,res)=>{ //here we are passing a custom async function to end() instead of directly passing done()
                if(err){
                    return done(err);
                }

                User.findById(dummyUsers[0]._id).then((user)=>{ //checking if 2nd dummy user got the auth token attached to it.
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((e)=>done(e));
            });
            done();
    });        

});

describe('DELETE /users/me/token',()=>{
    it('Should delete auth token on logout',(done)=>{
        request(app)
            .delete('/users/me/token')
            .set('x-auth',dummyUsers[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }
                User.findById(dummyUsers[0]._id).then((user)=>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e)=>done(e));
            });
    });
});