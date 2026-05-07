const express = require("express");
const router = express.Router();
const projectService = require("../services/project.service");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user.id);
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

module.exports = router;