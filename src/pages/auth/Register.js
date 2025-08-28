import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout 
      title="Get Started" 
      subtitle="Create your company account"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
