/**
 * Raycast 风格主窗口
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/app';
import './styles.css';

const MainWindow: React.FC = () => {
  const { t } = useTranslation();
  const { templates, searchQuery, setSearchQuery, config } = useAppStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 过滤模板
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return templates;
    }
    const query = searchQuery.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.prompt.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // 最近使用的模板
  const recentTemplates = useMemo(() => {
    if (!config?.recentActions) return [];
    return config.recentActions
      .map(id => templates.find(t => t.id === id))
      .filter(Boolean) as typeof templates;
  }, [config, templates]);

  // 执行模板
  const executeTemplate = async (templateId: string) => {
    try {
      await window.electronAPI.ai.process({
        prompt: '',
        modelId: templateId,
        systemPrompt: ''
      });
    } catch (error) {
      console.error('Failed to execute template:', error);
    }
  };

  // 键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredTemplates.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const template = filteredTemplates[selectedIndex];
        if (template) {
          executeTemplate(template.id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        window.electronAPI.window.hide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTemplates, selectedIndex]);

  // 重置选中索引当搜索变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <div className="main-window">
      {/* 搜索框 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={t('main.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* 动作列表 */}
      <div className="action-list">
        {/* 最近使用 */}
        {!searchQuery && recentTemplates.length > 0 && (
          <div className="action-section">
            <div className="section-title">{t('main.recentActions')}</div>
            {recentTemplates.slice(0, 5).map((template, index) => (
              <div
                key={template.id}
                className={`action-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => executeTemplate(template.id)}
              >
                <span className="action-icon">{template.icon}</span>
                <span className="action-name">{template.name}</span>
                {template.hotkey && (
                  <span className="action-hotkey">{template.hotkey}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 全部动作 */}
        <div className="action-section">
          <div className="section-title">
            {searchQuery ? t('common.search') : t('main.allActions')}
          </div>
          {filteredTemplates.length === 0 ? (
            <div className="no-actions">{t('main.noActions')}</div>
          ) : (
            filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className={`action-item ${
                  index + (searchQuery ? 0 : recentTemplates.slice(0, 5).length) === selectedIndex
                    ? 'selected'
                    : ''
                }`}
                onClick={() => executeTemplate(template.id)}
              >
                <span className="action-icon">{template.icon}</span>
                <span className="action-name">{template.name}</span>
                {template.hotkey && (
                  <span className="action-hotkey">{template.hotkey}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MainWindow;
