const express = require("express");
const router = express.Router();
const CategoryModel = require("../model/CategoryModel");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  CategoryModel.find()
    .select("categoryName categoryCode _id")
    .exec()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  CategoryModel.findById(id)
    .select("categoryName categoryCode _id")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", async (req, res, next) => {
  try {
    const category = new CategoryModel({
      _id: new mongoose.Types.ObjectId(),
      categoryName: req.body.categoryName,
      categoryCode: req.body.categoryCode,
    });
    const savedDocument = await category.save();
    res.status(201).json({
      message: "Created category successfully",
      category: {
        _id: savedDocument._id,
        categoryName: savedDocument.categoryName,
        categoryCode: savedDocument.categoryCode,
      },
    });
  } catch {
    console.log(error);
    res.status(400).json({ error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await CategoryModel.findById(id).exec();
    category.set(req.body);
    const updatedDocument = await category.save();
    res.send(updatedDocument);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleteDocument = await CategoryModel.findByIdAndRemove(id).exec();
    res.status(200).json(deleteDocument);
  } catch (error) {
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
