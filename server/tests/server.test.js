const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const dummyTodos = [{
    text: "dummy one", 
    _id:new ObjectID()
},{
    text: "dummy two",
    _id:new ObjectID()
}];

beforeEach((done)=>{
    Todo.remove({}).then(()=>{
        return Todo.insertMany(dummyTodos);
    }).then(()=>done());
});

describe('POST /todos',()=>{
    it('Should create a new todo',(done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/id',()=>{
    it('Should return todo with requested ID',(done)=>{
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)//HexString converts object item to string
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('Should return 404 on todo not found',(done)=>{
        var dummyID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${dummyID}`)
            .expect(404)
            .end(done);
    });

    it('Should return 404 on non-object IDs',(done)=>{
        request(app)
            .get('/todos/qwerty12345')
            .expect(404)
            .end(done)
    });
});

describe('DELETE/todos/id tests',()=>{
    it('Should delete todo with passed id',(done)=>{
        request(app)
            .delete(`/todos/${dummyTodos[1]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(dummyTodos[1].text);
            })
            .end(done);
            
    });

    it('Should return 404 on todo not found',(done)=>{
        var dummyID = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${dummyID}`)
            .expect(404)
            .end(done);
    });

    it('Should return 404 on non-object IDs',(done)=>{
        request(app)
            .delete('/todos/qwerty12345')
            .expect(404)
            .end(done);
    });
});