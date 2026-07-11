const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
    findStudiesByUserId,
    createStudy,
    findStudyByIdAndUserId,
    updateStudy,
    deleteStudy,
} = require("../models/studyModel");

const requireUser = require("../middleware/requireUser");


const router = express.Router();

function parseStudyMinutes(value) {
    const minutes = Number(value);

    if (!Number.isFinite(minutes) || minutes < 0) {
        return null;
    }

    return Math.floor(minutes);
}

router.get("/", requireAuth, requireUser, (req, res) => {
    const studies = findStudiesByUserId(req.user.id);

    res.json(studies);
});

router.post("/", requireAuth, requireUser, (req, res) => {
    const { title, studyMinutes, understanding, memo } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "학습 주제는 필수입니다.",
        });
    }

    const parsedStudyMinutes = parseStudyMinutes(studyMinutes);

    if (parsedStudyMinutes === null) {
        return res.status(400).json({
            message: "학습 시간은 0분 이상이어야 합니다.",
        });
    }

    const newStudy = createStudy(req.user.id, {
        title,
        studyMinutes: parsedStudyMinutes,
        understanding,
        memo,
    });

    res.status(201).json(newStudy);
});

router.put("/:id", requireAuth, requireUser, (req, res) => {
    const { id } = req.params;
    const { title, studyMinutes, understanding, memo } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "학습 주제는 필수입니다.",
        });
    }

    const parsedStudyMinutes = parseStudyMinutes(studyMinutes);

    if (parsedStudyMinutes === null) {
        return res.status(400).json({
            message: "학습 시간은 0분 이상이어야 합니다.",
        });
    }

    const existingStudy = findStudyByIdAndUserId(id, req.user.id);

    if (!existingStudy) {
        return res.status(404).json({
            message: "수정할 학습 기록을 찾을 수 없습니다.",
        });
    }

    const updatedStudy = updateStudy(id, req.user.id, {
        title,
        studyMinutes: parsedStudyMinutes,
        understanding,
        memo,
    });

    res.json(updatedStudy);
});

router.delete("/:id", requireAuth, requireUser, (req, res) => {
    const { id } = req.params;

    const existingStudy = findStudyByIdAndUserId(id, req.user.id);

    if (!existingStudy) {
        return res.status(404).json({
            message: "삭제할 학습 기록을 찾을 수 없습니다.",
        });
    }

    deleteStudy(id, req.user.id);

    res.json({
        message: "학습 기록이 삭제되었습니다.",
        deletedId: Number(id),
    });
});

module.exports = router;