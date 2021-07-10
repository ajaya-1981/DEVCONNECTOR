const mongoose = require('mongoose');

const config = require('config');

const db = config.get('mongoURI');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify :false
     
    });
    console.log('Mongo DB connected');
  } catch (err) {
    console.error(err.message);
    //exit process with failure
    process.exit(1);
  }
};

module.exports = connectMongoDB;
