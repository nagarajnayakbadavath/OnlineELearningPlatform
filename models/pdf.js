const mongoose=require('mongoose');

const pdfSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    },
    uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Admin' depending on who uploads
    required: true
  },
  fileType: {
    type: String,
    default: 'pdf',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('Pdf', pdfSchema);
