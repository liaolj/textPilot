/**
 * App 根组件
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './stores/app';
import MainWindow from './components/MainWindow';
import PreviewWindow from './components/PreviewWindow';
import './styles/global.css';

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const { currentView, loadInitialData, setPreviewData, config } = useAppStore();

  // 加载初始数据
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 监听语言变化
  useEffect(() => {
    if (config) {
      i18n.changeLanguage(config.language);
    }
  }, [config, i18n]);

  // 监听主进程事件
  useEffect(() => {
    // 监听预览事件
    const handleShowPreview = (data: any) => {
      setPreviewData(data);
    };

    window.electronAPI.on('show-preview', handleShowPreview);

    return () => {
      window.electronAPI.off('show-preview', handleShowPreview);
    };
  }, [setPreviewData]);

  // 根据当前视图渲染
  const renderView = () => {
    switch (currentView) {
      case 'main':
        return <MainWindow />;
      case 'preview':
        return <PreviewWindow />;
      case 'settings':
        return <div style={{ padding: 20 }}>设置界面 (开发中)</div>;
      case 'history':
        return <div style={{ padding: 20 }}>历史记录 (开发中)</div>;
      default:
        return <MainWindow />;
    }
  };

  return (
    <div className="app">
      {renderView()}
    </div>
  );
};

export default App;
