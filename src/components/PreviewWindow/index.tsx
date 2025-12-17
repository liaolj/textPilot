/**
 * 预览编辑窗口
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/app';
import './styles.css';

const PreviewWindow: React.FC = () => {
  const { t } = useTranslation();
  const { previewData, setCurrentView } = useAppStore();
  const [editedResult, setEditedResult] = useState(previewData?.result || '');
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!previewData) {
    return null;
  }

  // 确认并复制到剪贴板
  const handleConfirm = async () => {
    try {
      await window.electronAPI.clipboard.write(editedResult);
      window.electronAPI.window.hide();
      setCurrentView('main');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // 取消
  const handleCancel = () => {
    setCurrentView('main');
  };

  // 重新生成
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // TODO: 调用 AI 重新生成
      // 这里需要重新调用模板执行逻辑
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="preview-window">
      <div className="preview-header">
        <span className="preview-title">
          {previewData.templateName} - {t('preview.title')}
        </span>
      </div>

      <div className="preview-content">
        <textarea
          value={editedResult}
          onChange={(e) => setEditedResult(e.target.value)}
          className="preview-editor"
          autoFocus
        />
      </div>

      <div className="preview-footer">
        <button
          className="btn btn-secondary"
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          🔄 {t('preview.regenerate')}
        </button>
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={handleCancel}>
            {t('preview.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            ✅ {t('preview.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewWindow;
