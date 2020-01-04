/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  status_text: { type: String },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, required: true, default: true }
});
const Issue = mongoose.model("Issue", issueSchema);

module.exports = app => {
  app
    .route("/api/issues/:project")
    
    // POST new issues
    .post((req, res) => {
      const project = req.params.project;
      if (!project) {
        res.send("No project provided");
        return;
      }

      // return an error if one or more of the required inputs isn't provided
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        res.send("missing inputs");
        return;
      }
    
      const newIssue = new Issue({
        project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || ""
      });

      newIssue.save((err, data) => {
        if (err) {
          console.log(err);
          res.json({ error: err.name });
        } else {
          res.json(data);
        }
      });
    })

    // GET an array of optionally filtered issues
    .get(async (req, res) => {
      const project = req.params.project;

      if (!project) {
        res.send("no project provided");
        return;
      }

      // create filter object from project and query parameters
      const filter = { ...req.query, project };

      try {
        const issues = await Issue.find(filter, { __v: 0 });
        res.json(issues);
      } catch (err) {
        console.log(err);
        res.send("Error finding issues for " + project);
      }
    })

    // Update issues from PUT requests
    .put(async (req, res) => {
      const project = req.params.project;
      const issueUpdates = { ...req.body };
      const _id = req.body._id;

      if (!project || !_id) {
        res.send("Missing project or issue ID");
        return;
      }

      // remove _id from the list of fields to update
      delete issueUpdates["_id"];
    
      // remove any empty fields submitted
      for (let key in issueUpdates) {
        if (issueUpdates[key] === "") {
          delete issueUpdates[key];
        }
      }

      // If there are no non-empty keys left to update, return error
      if (Object.keys(issueUpdates).length === 0) {
        res.send("no updated field sent");
        return;
      }
      issueUpdates["updated_on"] = Date.now();

      try {
        const updatedIssue = await Issue.findOneAndUpdate(
          { _id: _id },
          issueUpdates,
          { new: true }
        );
        res.send("successfully updated");
      } catch (err) {
        console.log(err);
        res.send("could not update " + _id);
      }
    })

    // DELETE issues by _id
    .delete(async (req, res) => {
      console.log("Delete request received...", req.body);
      const project = req.params.project;
      const _id = req.body._id;
      if (!project) {
        res.send("Missing project");
        return;
      }
      if (!_id) {
        res.send("_id error");
        return;
      }

      try {
        let results = await Issue.findByIdAndRemove(_id);
        if (results) {
          res.send("deleted " + _id);
        } else {
          res.send("could not delete " + _id);
        }
      } catch (err) {
        console.log(err);
        res.send("could not delete " + _id);
      }
    });
};
