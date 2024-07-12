
"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {  Modal } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles
import { Button } from './ui/button';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (pathname === '/auth') {
    return null;
  }

  const showConfirmModal = () => {
    setIsModalVisible(true);
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    router.push('/auth');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    handleLogout();
    setIsModalVisible(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-teal-400 to-teal-600 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-bold text-xl text-white">Energy Forecasting Dashboard</span>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={showConfirmModal}
                className='text-red-500 bg-white hover:bg-red-500 hover:text-white'
               
                size={'lg'}
              >
                <svg className="h-5 w-5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <Modal
        title="Confirm Logout"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Logout"
        cancelText="Cancel"
        centered
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </>
  );
};

export default Navbar;
