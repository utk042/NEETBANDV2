import { useState, useEffect } from 'react';
import { getSongs, getCourses } from '../services/api';

export function useClassAndSubjectOptions() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [classToSubjects, setClassToSubjects] = useState({});
  const [subjectToChapters, setSubjectToChapters] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [songsRes, coursesRes] = await Promise.all([
          getSongs().catch(() => []),
          getCourses().catch(() => [])
        ]);
        
        const allClasses = new Set();
        const allSubjects = new Set();
        const allChapters = new Set();
        const classMap = {};
        const subjectMap = {};
        
        songsRes.forEach(s => {
          const c = s.class?.trim();
          const sub = s.subject?.trim();
          const ch = s.chapter?.trim();

          if (c) allClasses.add(c);
          if (sub) {
            allSubjects.add(sub);
            if (c) {
              if (!classMap[c]) classMap[c] = new Set();
              classMap[c].add(sub);
            }
          }
          if (ch) {
            allChapters.add(ch);
            if (sub) {
              if (!subjectMap[sub]) subjectMap[sub] = new Set();
              subjectMap[sub].add(ch);
            }
          }
        });
        
        coursesRes.forEach(c => {
          const courseClass = c.class?.trim();
          const courseSubject = c.subject?.trim();

          if (courseClass) allClasses.add(courseClass);
          if (courseSubject) {
            allSubjects.add(courseSubject);
            if (courseClass) {
              if (!classMap[courseClass]) classMap[courseClass] = new Set();
              classMap[courseClass].add(courseSubject);
            }
          }

          if (c.subjects && Array.isArray(c.subjects)) {
            c.subjects.forEach(sub => {
              if (sub.chapters && Array.isArray(sub.chapters)) {
                sub.chapters.forEach(ch => {
                  if (ch.title) {
                    const chapterTitle = ch.title.trim();
                    allChapters.add(chapterTitle);
                    if (courseSubject) {
                      if (!subjectMap[courseSubject]) subjectMap[courseSubject] = new Set();
                      subjectMap[courseSubject].add(chapterTitle);
                    }
                  }
                });
              }
            });
          }
        });

        const formattedClassMap = {};
        for (const [k, v] of Object.entries(classMap)) {
          formattedClassMap[k] = Array.from(v).filter(Boolean).sort();
        }

        const formattedSubjectMap = {};
        for (const [k, v] of Object.entries(subjectMap)) {
          formattedSubjectMap[k] = Array.from(v).filter(Boolean).sort();
        }
        
        setClasses(Array.from(allClasses).filter(Boolean).sort());
        setSubjects(Array.from(allSubjects).filter(Boolean).sort());
        setChapters(Array.from(allChapters).filter(Boolean).sort());
        setClassToSubjects(formattedClassMap);
        setSubjectToChapters(formattedSubjectMap);
      } catch (err) {
        console.error("Failed to fetch class and subject options", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { classes, subjects, chapters, classToSubjects, subjectToChapters, loading };
}
