import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import MemberLogin from './MemberLogin';
import StaffLogin from './StaffLogin';

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const tab = (searchParams.get('tab') || searchParams.get('type') || '').toLowerCase();
  const isStaff = 
    tab === 'staff' || 
    tab === 'employee' || 
    tab === 'admin' || 
    location.hash.toLowerCase() === '#staff' || 
    location.hash.toLowerCase() === '#employee' ||
    location.pathname.toLowerCase().includes('/staff');

  if (isStaff) {
    return <StaffLogin />;
  }

  return <MemberLogin />;
}
