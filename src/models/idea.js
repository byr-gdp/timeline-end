import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const IdeaSchema = new Schema({
  content: String,
  author: String,
  updateTime: {
    type: Date,
    default: Date.now
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  appendList: {
    type: Array,
    default: []
  },
});

export default mongoose.model('Idea', IdeaSchema);
