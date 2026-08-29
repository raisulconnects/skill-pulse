'use strict';

/**
 * Progress controller with strict security, enrollment validation, and dynamic progress calculation.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::progress.progress', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view progress');
    }

    const role = user.user_role;
    const query = { ...ctx.query };

    query.populate = query.populate || {
      student: { fields: ['id', 'username', 'email'] },
      course: {
        fields: ['id', 'title', 'course_status'],
        populate: {
          instructor: { fields: ['id', 'username'] },
          lessons: { fields: ['id', 'title', 'lesson_order'] },
        },
      },
      completed_lessons: { fields: ['id', 'title', 'lesson_order'] },
    };

    if (role === 'student') {
      // Students can ONLY view their own progress
      query.filters = {
        ...(query.filters || {}),
        student: { id: user.id },
      };
    } else if (role === 'instructor') {
      // Instructors can only view progress for courses they own
      const courseId = query.filters?.course?.id || query.filters?.course;
      if (courseId) {
        let course = null;
        try {
          course = await strapi.documents('api::course.course').findOne({
            documentId: courseId,
            populate: ['instructor'],
          });
        } catch {
          course = await strapi.db.query('api::course.course').findOne({
            where: { id: courseId },
            populate: ['instructor'],
          });
        }

        if (course && course.instructor?.id !== user.id) {
          return ctx.forbidden('You can only view student progress for your own courses');
        }
      }
    }

    ctx.query = query;
    const response = await super.find(ctx);

    if (response && Array.isArray(response.data)) {
      response.data = response.data.map((item) => {
        const course = item.course;
        const totalLessons = Array.isArray(course?.lessons) ? course.lessons.length : 0;
        const completedLessons = Array.isArray(item.completed_lessons) ? item.completed_lessons : [];
        const completedCount = completedLessons.length;
        const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          ...item,
          completed_count: completedCount,
          total_lessons: totalLessons,
          percentage: percentage,
        };
      });
    }

    return response;
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view progress');
    }

    const role = user.user_role;
    const { id } = ctx.params;

    let progress = null;
    try {
      progress = await strapi.documents('api::progress.progress').findOne({
        documentId: id,
        populate: {
          student: { fields: ['id', 'username'] },
          course: { populate: ['instructor', 'lessons'] },
          completed_lessons: { fields: ['id', 'title'] },
        },
      });
    } catch {
      progress = await strapi.db.query('api::progress.progress').findOne({
        where: { id },
        populate: {
          student: { fields: ['id', 'username'] },
          course: { populate: ['instructor', 'lessons'] },
          completed_lessons: { fields: ['id', 'title'] },
        },
      });
    }

    if (!progress) {
      return ctx.notFound('Progress record not found');
    }

    // Role security checks
    if (role === 'student' && progress.student?.id !== user.id) {
      return ctx.forbidden('You can only view your own progress');
    }

    if (role === 'instructor' && progress.course?.instructor?.id !== user.id) {
      return ctx.forbidden('You can only view student progress for your own courses');
    }

    const totalLessons = Array.isArray(progress.course?.lessons) ? progress.course.lessons.length : 0;
    const completedCount = Array.isArray(progress.completed_lessons) ? progress.completed_lessons.length : 0;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      data: {
        ...progress,
        completed_count: completedCount,
        total_lessons: totalLessons,
        percentage: percentage,
      },
    };
  },

  async getCourseProgress(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to view course progress');
    }

    const role = user.user_role;
    const { courseId } = ctx.params;

    // Fetch target course details
    let course = null;
    try {
      course = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['instructor', 'lessons'],
      });
    } catch {
      course = await strapi.db.query('api::course.course').findOne({
        where: { id: courseId },
        populate: ['instructor', 'lessons'],
      });
    }

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;
    const cNumericId = course.id;
    const cDocId = course.documentId;

    if (role === 'student') {
      // Find single progress record for this student and course
      const progresses = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: { id: user.id },
          $or: [
            { course: { id: cNumericId } },
            ...(cDocId ? [{ course: { documentId: cDocId } }] : []),
          ],
        },
        populate: ['completed_lessons'],
      });

      const pRecord = progresses[0] || null;
      const completedLessons = Array.isArray(pRecord?.completed_lessons) ? pRecord.completed_lessons : [];
      const completedCount = completedLessons.length;
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return {
        data: {
          progress_id: pRecord?.documentId || pRecord?.id || null,
          student_id: user.id,
          course_id: cNumericId,
          completed_lessons: completedLessons.map((l) => l.documentId || l.id),
          completed_count: completedCount,
          total_lessons: totalLessons,
          percentage: percentage,
          is_completed: totalLessons > 0 && completedCount === totalLessons,
        },
      };
    }

    // Instructor check
    if (role === 'instructor' && course.instructor?.id !== user.id) {
      return ctx.forbidden('You can only view student progress for your own courses');
    }

    // Instructor / CM / Admin view across students for course
    const allProgresses = await strapi.db.query('api::progress.progress').findMany({
      where: {
        $or: [
          { course: { id: cNumericId } },
          ...(cDocId ? [{ course: { documentId: cDocId } }] : []),
        ],
      },
      populate: ['student', 'completed_lessons'],
    });

    const result = allProgresses.map((p) => {
      const cCount = Array.isArray(p.completed_lessons) ? p.completed_lessons.length : 0;
      const pct = totalLessons > 0 ? Math.round((cCount / totalLessons) * 100) : 0;
      return {
        progress_id: p.documentId || p.id,
        student: { id: p.student?.id, username: p.student?.username, email: p.student?.email },
        completed_count: cCount,
        total_lessons: totalLessons,
        percentage: pct,
      };
    });

    return { data: result };
  },

  async completeLesson(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated to mark a lesson as completed');
    }

    const role = user.user_role;
    if (role !== 'student') {
      return ctx.forbidden('Only students can mark lessons as completed');
    }

    const body = ctx.request.body || {};
    const data = body.data || body;
    const { course: courseId, lesson: lessonId } = data;

    if (!courseId || !lessonId) {
      return ctx.badRequest('Both course ID and lesson ID are required');
    }

    // 1. Fetch Course & check existence
    let course = null;
    try {
      course = await strapi.documents('api::course.course').findOne({
        documentId: courseId,
        populate: ['lessons'],
      });
    } catch {
      course = await strapi.db.query('api::course.course').findOne({
        where: { id: courseId },
        populate: ['lessons'],
      });
    }

    if (!course) {
      return ctx.notFound('Specified course was not found');
    }

    const cNumericId = course.id;
    const cDocId = course.documentId;
    const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;

    // 2. Validate Student Enrollment in Course
    const enrollments = await strapi.db.query('api::enrollment.enrollment').findMany({
      where: {
        student: { id: user.id },
        $or: [
          { course: { id: cNumericId } },
          ...(cDocId ? [{ course: { documentId: cDocId } }] : []),
        ],
      },
    });

    if (!enrollments || enrollments.length === 0) {
      return ctx.forbidden('You must be enrolled in this course to mark lessons as completed');
    }

    // 3. Fetch Lesson & verify it belongs to this course
    let lesson = null;
    try {
      lesson = await strapi.documents('api::lesson.lesson').findOne({
        documentId: lessonId,
        populate: ['course'],
      });
    } catch {
      lesson = await strapi.db.query('api::lesson.lesson').findOne({
        where: { id: lessonId },
        populate: ['course'],
      });
    }

    if (!lesson) {
      return ctx.notFound('Specified lesson was not found');
    }

    const lessonCourseId = lesson.course?.id || lesson.course?.documentId || lesson.course;
    if (
      String(lessonCourseId) !== String(cNumericId) &&
      String(lessonCourseId) !== String(cDocId) &&
      String(lessonCourseId) !== String(courseId)
    ) {
      return ctx.badRequest('The specified lesson does not belong to this course');
    }

    const lNumericId = lesson.id;

    // 4. Find or Create Progress record for (student, course)
    const existingProgresses = await strapi.db.query('api::progress.progress').findMany({
      where: {
        student: { id: user.id },
        $or: [
          { course: { id: cNumericId } },
          ...(cDocId ? [{ course: { documentId: cDocId } }] : []),
        ],
      },
      populate: ['completed_lessons'],
    });

    let progressRecord = existingProgresses[0] || null;
    let completedLessonIds = [];

    if (progressRecord && Array.isArray(progressRecord.completed_lessons)) {
      completedLessonIds = progressRecord.completed_lessons.map((l) => l.id);
    }

    // Safe & Idempotent check: check if lesson already completed
    const alreadyCompleted = completedLessonIds.includes(lNumericId);

    if (!alreadyCompleted) {
      completedLessonIds.push(lNumericId);

      if (!progressRecord) {
        // Create new progress record
        progressRecord = await strapi.db.query('api::progress.progress').create({
          data: {
            student: user.id,
            course: cNumericId,
            completed_lessons: completedLessonIds,
            publishedAt: new Date(),
          },
          populate: ['completed_lessons'],
        });
      } else {
        // Update existing progress record
        progressRecord = await strapi.db.query('api::progress.progress').update({
          where: { id: progressRecord.id },
          data: {
            completed_lessons: completedLessonIds,
          },
          populate: ['completed_lessons'],
        });
      }
    }

    const finalCompletedCount = completedLessonIds.length;
    const finalPercentage = totalLessons > 0 ? Math.round((finalCompletedCount / totalLessons) * 100) : 0;

    return {
      data: {
        progress_id: progressRecord?.documentId || progressRecord?.id,
        student_id: user.id,
        course_id: cNumericId,
        completed_lessons: completedLessonIds,
        completed_count: finalCompletedCount,
        total_lessons: totalLessons,
        percentage: finalPercentage,
        is_completed: totalLessons > 0 && finalCompletedCount === totalLessons,
        already_completed: alreadyCompleted,
      },
    };
  },
}));
