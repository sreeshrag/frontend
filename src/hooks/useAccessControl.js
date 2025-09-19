import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

export const useAccessControl = () => {
  const [companyAccess, setCompanyAccess] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.companyId) {
      fetchCompanyAccess();
    }
  }, [user?.companyId]);

  const fetchCompanyAccess = async () => {
    try {
      const response = await api.get(`/access/companies/${user.companyId}`);
      setCompanyAccess(response.data);
    } catch (error) {
      console.error('Failed to fetch company access:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (sectionKey, permissionKey) => {
    const section = companyAccess[sectionKey];
    if (!section) return false;
    
    return section.permissions?.some(permission => 
      permission.key === `${sectionKey}.${permissionKey}`
    ) || false;
  };

  const hasSectionAccess = (sectionKey) => {
    return !!companyAccess[sectionKey];
  };

  const getAccessibleSections = () => {
    return Object.keys(companyAccess);
  };

  return {
    companyAccess,
    loading,
    hasAccess,
    hasSectionAccess,
    getAccessibleSections,
    refreshAccess: fetchCompanyAccess
  };
};
