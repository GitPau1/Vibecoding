
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';

interface BugReportPageProps {
  onSubmit: (data: { title: string; description: string; url: string; screenshotFile: File | null }) => Promise<void>;
}

const BugReportPage: React.FC<BugReportPageProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const getUrlFromState = () => {
    const fromPath = location.state?.from || '/';
    // For HashRouter, the path is in the hash
    return `${window.location.origin}${window.location.pathname}#${fromPath}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState(getUrlFromState());
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUrl(getUrlFromState());
  }, [location.state]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast('파일 크기는 5MB를 초과할 수 없습니다.', 'error');
        e.target.value = ''; // Reset file input
        setScreenshotFile(null);
        return;
      }
      setScreenshotFile(file);
    } else {
      setScreenshotFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('제목과 현상을 모두 입력해주세요.', 'error');
      return;
    }
    setIsSubmitting(true);
    await onSubmit({ title: title.trim(), description: description.trim(), url, screenshotFile });
    // Do not set isSubmitting to false here, as the parent component will navigate away on success.
    // If it fails, the user should be able to try again, so we'll let the parent handler logic dictate this.
    // For simplicity, we'll let it be clickable again after an error toast.
    setIsSubmitting(false); 
  };

  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">오류 제보하기</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 투표 결과가 보이지 않습니다" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">자세한 현상</label>
          <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="오류가 발생하는 상황을 최대한 자세히 설명해주세요." required />
        </div>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">발생 URL</label>
          <Input id="url" value={url} onChange={e => setUrl(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">스크린샷 첨부 (선택)</label>
          <Input id="screenshot" type="file" onChange={handleFileChange} accept="image/*" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-[#6366f1] hover:file:bg-indigo-100"/>
          {screenshotFile && <p className="text-sm text-gray-500 mt-2">선택된 파일: {screenshotFile.name}</p>}
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>취소</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '제출 중...' : '제보 제출하기'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BugReportPage;
