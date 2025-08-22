import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { faDesktop, faDownload } from '@fortawesome/free-solid-svg-icons';

const baseStyle: React.CSSProperties = { 
  width: 32, 
  height: 32, 
  borderRadius: 8, 
  display:'flex', 
  alignItems:'center', 
  justifyContent:'center', 
  fontSize: 14, 
  fontWeight: 600, 
  color: '#ffffff',
  background: '#475569'
};

export function osIcon(vendor?: string, version?: string) {
  if(!vendor) return <div style={{...baseStyle, background:'#64748b'}}>OS</div>;
  const v = vendor.toLowerCase();
  if (v.includes('microsoft') || v.includes('windows')) {
    if (version?.includes('11')) return <FontAwesomeIcon icon={faWindows} color="#4f46e5" size="2x" />;
    if (version?.includes('10')) return <FontAwesomeIcon icon={faWindows} color="#3b82f6" size="2x" />;
    if (version?.includes('7')) return <FontAwesomeIcon icon={faWindows} color="#6366f1" size="2x" />;
    return <FontAwesomeIcon icon={faWindows} color="#4f46e5" size="2x" />;
  }
  return <FontAwesomeIcon icon={faDesktop} color="#475569" size="2x" />;
}

export const downloadIcon = <FontAwesomeIcon icon={faDownload} color="#059669" size="lg" />;
