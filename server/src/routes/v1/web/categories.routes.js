import categoriesController from "../../../controller/v1/web/categories.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import express from "express";
const router = express.Router();

router.get("/categories", categoriesController.getCategories);
router.post("/category", authMiddleware, categoriesController.createCategory);
router.delete("/category", authMiddleware, categoriesController.deleteCategory);
router.patch("/category", authMiddleware, categoriesController.updateCategory);

// NEW routes
router.get("/category-templates", categoriesController.getCategoryTemplates);
router.post("/category/from-template", authMiddleware, categoriesController.createFromTemplate);
router.post("/categories/bulk-from-templates", authMiddleware, categoriesController.bulkCreateFromTemplates);
router.post("/category/as-template", authMiddleware, categoriesController.createCategoryAsTemplate);

export default router;
