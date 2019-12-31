/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');

//var MongoClient = require('mongodb');
//var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

const issueSchema = new mongoose.Schema({
  project: { type: String, required: true},
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  status_text: { type: String },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, required: true, default: true }
})
const Issue = mongoose.model('Issue', issueSchema);

module.exports = (app) => {
  
  app.route('/api/issues/:project')
    .post((req, res) => {
        const project = req.params.project;
        if(!project) {
          res.send("No project provided");
          return;
        }
        console.log("New issue received for " + project);
        console.log(req.body);

        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          res.send("missing inputs");
          return;
        }
        const newIssue = new Issue({
          project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || "",
          status_text: req.body.status_text || "",
        });
    
        newIssue.save((err, data) => {
          if(err) {
            console.log(err);
            res.json({ "error": err.name });
          } else {
            console.log("New issue (" + req.body.issue_title + ") saved successfully");
            res.json(data);
          }
        })
    })
    .get(async (req, res) => { 
      const project = req.params.project;
      console.log("GET request received for " + project);
      if (project) {
        try {
          const issues = await Issue.find({ project }, { _id: 0, __v: 0 });
          res.json(issues);
        } catch (err) {
          console.log(err);
          res.send("Error finding issues for " + project);
        }
      }
  });
          
    
      
}

/*
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
    });
    
};
*/