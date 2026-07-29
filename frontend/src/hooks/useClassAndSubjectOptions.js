import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';

export function useClassAndSubjectOptions() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [classToSubjects, setClassToSubjects] = useState({});
  const [subjectToChapters, setSubjectToChapters] = useState({});
  const [classSubjectToChapters, setClassSubjectToChapters] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setChapters(data.chapters || []);
        setClassToSubjects(data.classToSubjects || {});
        setSubjectToChapters(data.subjectToChapters || {});
        setClassSubjectToChapters(data.classSubjectToChapters || {});
      } catch (err) {
        console.error("Failed to fetch class and subject options", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { classes, subjects, chapters, classToSubjects, subjectToChapters, classSubjectToChapters, loading };
}
