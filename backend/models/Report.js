const reportSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    examTitle: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);