const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
let importExcel = require('convert-excel-to-json');
// multer

 const storage = multer.diskStorage({
    destination: (req, res, callback) => {
      callback(null, 'uploads');
    },
    filename: (req, file, callback) => {
      callback(null, 'excel/'+file.originalname);
    }
  });
  
  let upload = multer({ 
    storage: storage ,
    fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.csv' && ext !== '.xlsx') {
        req.fileValidationError= 'goes wrong on the mimetype';
           return callback(null, false, new Error('File must be CSV or XLSX format mimetype'))
      }
      callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
  });

app.get('/', (req, res) => {
    res.send('Hello');
})

app.post('/', upload.single('file'), (req, res) => {
    console.log(req.file)
    let filename = req.file.originalname;
    let students = [];
    if(req.fileValidationError) {        
        return res.status(303).send({
          message: 'File must be mimetype CSV or XLSX.'
        }) 
    }
    let filePath = './uploads/excel/'+ filename;

    let result = importExcel({
        sourceFile: filePath,
        header: { rows: 1 },
        columnToKey: { A: 'name', B: 'value' },
        sheets: ['Sheet1']
    });

    for(let i = 0; result.Sheet1.length > i; i++) {
        students.push({
            name: result.Sheet1[i].name,
            value: result.Sheet1[i].value
        });
    }
    res.send(students);
    console.log(students);
    fs.unlinkSync(filePath);

});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running on port 3000')
});