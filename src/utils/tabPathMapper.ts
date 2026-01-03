export const createTabPathMapper = (translations?: any) => {
  const staticTabPathMapping: Record<string, string> = {
    'Organization Schedule': 'organization-schedule',
    'Employee Schedule': 'employee-schedule',
    'Permissions': 'permissions',
    'Leaves': 'leaves',
    'Missing Punches': 'missing-punches',
    'My Request': 'my-request',
    'Team Request': 'team-request',
    'Manage': 'manage',
    'My Punches': 'my-punches',
    'Team Punches': 'team-punches',
  };

  const translatedTabPathMapping: Record<string, string> = {};
  
  if (translations?.modules?.scheduling) {
    const t = translations.modules.scheduling;
    
    if (t.organization_schedule) {
      translatedTabPathMapping[t.organization_schedule] = 'organization-schedule';
      translatedTabPathMapping[t.organization_schedule.toLowerCase()] = 'organization-schedule';
    }
    
    if (t.employee_schedule) {
      translatedTabPathMapping[t.employee_schedule] = 'employee-schedule';
      translatedTabPathMapping[t.employee_schedule.toLowerCase()] = 'employee-schedule';
    }
  }

  if (translations?.modules?.manageApprovals) {
    const t = translations.modules.manageApprovals;
    
    if (t.permissions) {
      translatedTabPathMapping[t.permissions] = 'permissions';
      translatedTabPathMapping[t.permissions.toLowerCase()] = 'permissions';
    }
    
    if (t.leaves) {
      translatedTabPathMapping[t.leaves] = 'leaves';
      translatedTabPathMapping[t.leaves.toLowerCase()] = 'leaves';
    }

    if (t.missing_punches) {
      translatedTabPathMapping[t.missing_punches] = 'missing-punches';
      translatedTabPathMapping[t.missing_punches.toLowerCase()] = 'missing-punches';
    }
  }

  if (translations?.modules?.selfServices) {
    const t = translations.modules.selfServices;
    
    if (t.my_requests) {
      translatedTabPathMapping[t.my_request] = 'my-request';
      translatedTabPathMapping[t.my_request.toLowerCase()] = 'my-request';
    }
    
    if (t.team_request) {
      translatedTabPathMapping[t.team_request] = 'team-request';
      translatedTabPathMapping[t.team_request.toLowerCase()] = 'team-request';
    }

    if (t.manage) {
      translatedTabPathMapping[t.manage] = 'manage';
      translatedTabPathMapping[t.manage.toLowerCase()] = 'manage';
    }

    if (t.my_punches) {
      translatedTabPathMapping[t.my_punches] = 'my-punches';
      translatedTabPathMapping[t.my_punches.toLowerCase()] = 'my-punches';
    }

    if (t.team_punches) {
      translatedTabPathMapping[t.team_punches] = 'team-punches';
      translatedTabPathMapping[t.team_punches.toLowerCase()] = 'team-punches';
    }

    if (t.missing_punches_tab) {
      translatedTabPathMapping[t.missing_punches_tab] = 'missing-punches';
      translatedTabPathMapping[t.missing_punches_tab.toLowerCase()] = 'missing-punches';
    }
  }

  return (tabName: string): string => {
    if (staticTabPathMapping[tabName]) {
      return staticTabPathMapping[tabName];
    }
    
    if (translatedTabPathMapping[tabName]) {
      return translatedTabPathMapping[tabName];
    }
    
    const lowerTabName = tabName.toLowerCase().trim();
    if (translatedTabPathMapping[lowerTabName]) {
      return translatedTabPathMapping[lowerTabName];
    }
    
    if (lowerTabName.includes('organization') || lowerTabName.includes('organisasi')) {
      return 'organization-schedule';
    }
    
    if (lowerTabName.includes('employee') && lowerTabName.includes('schedule')) {
      return 'employee-schedule';
    }

    if (lowerTabName.includes('permission') && lowerTabName.includes('approval')) {
      return 'permissions';
    }

    if (lowerTabName.includes('leave') && lowerTabName.includes('approval')) {
      return 'leaves';
    }

    if (lowerTabName.includes('missing') && lowerTabName.includes('punch') && lowerTabName.includes('approval')) {
      return 'missing-punches';
    }

    if (lowerTabName.includes('my') && lowerTabName.includes('request')) {
      return 'my-request';
    }

    if (lowerTabName.includes('team') && lowerTabName.includes('request')) {
      return 'team-request';
    }

    if (lowerTabName === 'manage' || lowerTabName.includes('إدارة')) {
      return 'manage';
    }

    if (lowerTabName.includes('my') && lowerTabName.includes('punch')) {
      return 'my-punches';
    }

    if (lowerTabName.includes('team') && lowerTabName.includes('punch')) {
      return 'team-punches';
    }

    if (lowerTabName.includes('missing') && lowerTabName.includes('punch') && !lowerTabName.includes('approval')) {
      return 'missing-punches';
    }
    
    return tabName.toLowerCase().replace(/\s+/g, "-");
  };
};

export const getTabLabel = (tabName: string, translations?: any): string => {
  const normalizedTabName = tabName.toLowerCase().trim();
  
  const schedulingT = translations?.modules?.scheduling || {};
  
  if (normalizedTabName === 'organization schedule' || normalizedTabName.includes('organization')) {
    return schedulingT.organization_schedule || tabName;
  }
  
  if (normalizedTabName === 'employee schedule' || 
      (normalizedTabName.includes('employee') && normalizedTabName.includes('schedule'))) {
    return schedulingT.employee_schedule || tabName;
  }
  
  const approvalsT = translations?.modules?.manageApprovals || {};
  
  if (normalizedTabName === 'permissions' || 
      (normalizedTabName.includes('permission') && !normalizedTabName.includes('my') && !normalizedTabName.includes('team'))) {
    return approvalsT.permissions || tabName;
  }
  
  if (normalizedTabName === 'leaves' || 
      (normalizedTabName === 'leave' && !normalizedTabName.includes('my') && !normalizedTabName.includes('team'))) {
    return approvalsT.leaves || tabName;
  }

  if (normalizedTabName === 'missing punches' && normalizedTabName.includes('approval')) {
    return approvalsT.missing_punches || tabName;
  }

  const selfServicesT = translations?.modules?.selfServices || {};

  if (normalizedTabName === 'my request' || 
      (normalizedTabName.includes('my') && normalizedTabName.includes('request'))) {
    return selfServicesT.my_request || tabName;
  }

  if (normalizedTabName === 'team request' || 
      (normalizedTabName.includes('team') && normalizedTabName.includes('request'))) {
    return selfServicesT.team_request || tabName;
  }

  if (normalizedTabName === 'manage') {
    return selfServicesT.manage || tabName;
  }

  if (normalizedTabName === 'my punches' || 
      (normalizedTabName.includes('my') && normalizedTabName.includes('punch'))) {
    return selfServicesT.my_punches || tabName;
  }

  if (normalizedTabName === 'team punches' || 
      (normalizedTabName.includes('team') && normalizedTabName.includes('punch'))) {
    return selfServicesT.team_punches || tabName;
  }

  if (normalizedTabName === 'missing punches' && !normalizedTabName.includes('approval')) {
    return selfServicesT.missing_punches_tab || tabName;
  }
  
  return tabName;
};