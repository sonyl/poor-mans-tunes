import express from 'express';
import mongodb from 'mongodb';
import bodyParser from 'body-parser';

const PORT = 8080;
const dbUrl = 'mongodb://localhost/crudwithredux';

const app = express();
app.use(bodyParser.json());

function validate(data) {

    const errors = {};
    const { title, cover} = data;
    if(!title) errors.title = 'Can\'t be empty;';
    if(!cover) errors.cover = 'Can\'t be empty;';
    const isValid = Object.keys(errors).length === 0;
    return {isValid, errors};
}

mongodb.MongoClient.connect(dbUrl, (err, db) => {

    if(err) {
        console.log('Error connecting to mongo:', err);
        return;
    }


    app.get('/api/games', (req, res) => {
        db.collection('games').find({}).toArray((err, games) => {
            res.json({games});
        });
    });

    app.get('/api/games/:_id', (req, res) => {
        db.collection('games').findOne({_id: new mongodb.ObjectId(req.params._id)}, (err, game) => {
            if(err) {
                res.status(500).json({errors: {global: 'Something went wrong'}});
            } else {
                res.json({game});
            }
        });
    });

    app.put('/api/games/:_id', (req, res) => {
        const { errors, isValid } = validate(req.body);
        if(isValid) {
            const { title, cover} = req.body;
            db.collection('games').findOneAndUpdate(
                { _id: mongodb.ObjectId(req.params._id) },
                { $set: {title, cover} },
                { returnOriginal: false },
                (err, result) => {
                    if(err) {
                        res.status(500).json({errors: {global: err}});
                    } else {
                        res.json({game: result.value});
                    }
                }
            );
        } else {
            res.status(400).json({errors});
        }
    });

    app.delete('/api/games/:_id', (req, res) => {
        db.collection('games').deleteOne({_id: new mongodb.ObjectId(req.params._id)}, (err, result) => {
            if(err) {
                res.status(500).json({errors: {global: err}});
            } else {
                res.json({});
            }

        });
    });



    app.post('/api/games', (req, res) => {
        const { errors, isValid } = validate(req.body);
        if(isValid) {
            const { title, cover} = req.body;
            db.collection('games').insert({title, cover}, (err, result) => {
                if(err) {
                    res.status(500).json({errors: {global: 'Something went wrong'}});
                } else {
                    res.json({game: result.ops[0]});
                }
            });
        } else {
            res.status(400).json({errors});
        }
    });


    app.use((req, res) => {
        res.status(404).json({
            errors: {
                global: 'Still working on it. Please try later'
            }
        });

    });
    app.listen(PORT, () => console.log('server is running on localhost:', PORT));

});


