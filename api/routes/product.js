const express = require("express");
const router = express.Router();
const ProductModel = require("../model/ProductModel");
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
  ProductModel.find()
    .populate("category", "categoryName categoryCode")
    .select("productName productCode perCaseQuantity _id category")
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
  ProductModel.findById(id)
    .populate("category")
    .select("productName productCode perCaseQuantity _id category")
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
    const product = new ProductModel({
      _id: new mongoose.Types.ObjectId(),
      productName: req.body.productName,
      productCode: req.body.productCode,
      perCaseQuantity: req.body.perCaseQuantity,
      category: req.body.categoryId,
    });
    const savedDocument = await product.save();
    res.status(201).json({
      message: "Created product successfully",
      product: {
        _id: savedDocument._id,
        productName: savedDocument.productName,
        productCode: savedDocument.productCode,
        perCaseQuantity: savedDocument.perCaseQuantity,
        category: savedDocument.category,
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
    const product = await ProductModel.findById(id).exec();
    product.set(req.body);
    const updatedDocument = await product.save();
    res.send(updatedDocument);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleteDocument = await ProductModel.findByIdAndRemove(id).exec();
    res.status(200).json(deleteDocument);
  } catch (error) {
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
