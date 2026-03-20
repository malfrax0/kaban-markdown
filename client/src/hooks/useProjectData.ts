import { useState, useEffect } from 'react';
import { api } from '../api';
import type { ProjectData } from '../types';

export const useProjectData = (projectId: string | undefined) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadProject = () => {
    if (projectId) {
      // Don't set loading to true on refresh to avoid flickering if desired
      // But for initial load it is good.
      // If we are refreshing, we might keep `project` populated.
      // existing code: setProject(data).
      
      api
        .getProject(projectId)
        .then((data) => {
          setProject(data);
          setError(null);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    loadProject();
  }, [projectId]);

  return { project, setProject, loadProject, loading, error };
};
