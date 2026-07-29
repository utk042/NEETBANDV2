import Song from '../models/Song.js';
import Course from '../models/Course.js';

export const getCategories = async (req, res) => {
  try {
    // For Songs:
    const songsAggregation = await Song.aggregate([
      {
        $group: {
          _id: null,
          classes: { $addToSet: "$class" },
          subjects: { $addToSet: "$subject" },
          chapters: { $addToSet: "$chapter" },
          classSubjectPairs: { $addToSet: { class: "$class", subject: "$subject" } },
          subjectChapterPairs: { $addToSet: { subject: "$subject", chapter: "$chapter" } },
          classSubjectChapterTriplets: { $addToSet: { class: "$class", subject: "$subject", chapter: "$chapter" } }
        }
      }
    ]);

    // For Courses (top level):
    const coursesTopAggregation = await Course.aggregate([
      {
        $group: {
          _id: null,
          classes: { $addToSet: "$class" },
          subjects: { $addToSet: "$subject" },
          classSubjectPairs: { $addToSet: { class: "$class", subject: "$subject" } }
        }
      }
    ]);
    
    // For Courses (embedded chapters):
    const coursesEmbeddedAggregation = await Course.aggregate([
      { $unwind: "$subjects" },
      { $unwind: { path: "$subjects.chapters", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          chapters: { $addToSet: "$subjects.chapters.title" },
          subjectChapterPairs: { $addToSet: { subject: "$subject", chapter: "$subjects.chapters.title" } },
          classSubjectChapterTriplets: { $addToSet: { class: "$class", subject: "$subject", chapter: "$subjects.chapters.title" } }
        }
      }
    ]);

    const allClasses = new Set();
    const allSubjects = new Set();
    const allChapters = new Set();
    const classMap = {};
    const subjectMap = {};
    const classSubjectToChaptersMap = {};
    
    const processClassSubject = (c, s) => {
      const cStr = typeof c === 'string' ? c.trim() : c;
      const sStr = typeof s === 'string' ? s.trim() : s;
      
      if (cStr) allClasses.add(cStr);
      if (sStr) {
        allSubjects.add(sStr);
        if (cStr) {
          if (!classMap[cStr]) classMap[cStr] = new Set();
          classMap[cStr].add(sStr);
        }
      }
    };
    
    const processSubjectChapter = (s, ch) => {
      const sStr = typeof s === 'string' ? s.trim() : s;
      const chStr = typeof ch === 'string' ? ch.trim() : ch;
      
      if (sStr) allSubjects.add(sStr);
      if (chStr) {
        allChapters.add(chStr);
        if (sStr) {
          if (!subjectMap[sStr]) subjectMap[sStr] = new Set();
          subjectMap[sStr].add(chStr);
        }
      }
    };

    const processTriplet = (c, s, ch) => {
      const cStr = typeof c === 'string' ? c.trim() : c;
      const sStr = typeof s === 'string' ? s.trim() : s;
      const chStr = typeof ch === 'string' ? ch.trim() : ch;
      if (cStr && sStr && chStr) {
        const key = `${cStr}|${sStr}`;
        if (!classSubjectToChaptersMap[key]) classSubjectToChaptersMap[key] = new Set();
        classSubjectToChaptersMap[key].add(chStr);
      }
    };

    if (songsAggregation.length > 0) {
      const { classes, subjects, chapters, classSubjectPairs, subjectChapterPairs, classSubjectChapterTriplets } = songsAggregation[0];
      classes.forEach(c => { if (c) allClasses.add(typeof c === 'string' ? c.trim() : c); });
      subjects.forEach(s => { if (s) allSubjects.add(typeof s === 'string' ? s.trim() : s); });
      chapters.forEach(ch => { if (ch) allChapters.add(typeof ch === 'string' ? ch.trim() : ch); });
      classSubjectPairs.forEach(p => processClassSubject(p.class, p.subject));
      subjectChapterPairs.forEach(p => processSubjectChapter(p.subject, p.chapter));
      if (classSubjectChapterTriplets) classSubjectChapterTriplets.forEach(p => processTriplet(p.class, p.subject, p.chapter));
    }

    if (coursesTopAggregation.length > 0) {
      const { classes, subjects, classSubjectPairs } = coursesTopAggregation[0];
      classes.forEach(c => { if (c) allClasses.add(typeof c === 'string' ? c.trim() : c); });
      subjects.forEach(s => { if (s) allSubjects.add(typeof s === 'string' ? s.trim() : s); });
      classSubjectPairs.forEach(p => processClassSubject(p.class, p.subject));
    }
    
    if (coursesEmbeddedAggregation.length > 0) {
      const { chapters, subjectChapterPairs, classSubjectChapterTriplets } = coursesEmbeddedAggregation[0];
      chapters.forEach(ch => { if (ch) allChapters.add(typeof ch === 'string' ? ch.trim() : ch); });
      subjectChapterPairs.forEach(p => processSubjectChapter(p.subject, p.chapter));
      if (classSubjectChapterTriplets) classSubjectChapterTriplets.forEach(p => processTriplet(p.class, p.subject, p.chapter));
    }

    const formattedClassMap = {};
    for (const [k, v] of Object.entries(classMap)) {
      formattedClassMap[k] = Array.from(v).filter(Boolean).sort();
    }

    const formattedSubjectMap = {};
    for (const [k, v] of Object.entries(subjectMap)) {
      formattedSubjectMap[k] = Array.from(v).filter(Boolean).sort();
    }
    
    const formattedClassSubjectToChaptersMap = {};
    for (const [k, v] of Object.entries(classSubjectToChaptersMap)) {
      formattedClassSubjectToChaptersMap[k] = Array.from(v).filter(Boolean).sort();
    }

    res.json({
      classes: Array.from(allClasses).filter(Boolean).sort(),
      subjects: Array.from(allSubjects).filter(Boolean).sort(),
      chapters: Array.from(allChapters).filter(Boolean).sort(),
      classToSubjects: formattedClassMap,
      subjectToChapters: formattedSubjectMap,
      classSubjectToChapters: formattedClassSubjectToChaptersMap
    });

  } catch (error) {
    console.error("Error generating categories:", error);
    res.status(500).json({ message: "Failed to load categories" });
  }
};
