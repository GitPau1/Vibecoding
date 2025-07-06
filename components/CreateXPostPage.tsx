
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { XPostCreationData } from '../App';

interface CreateXPostPageProps {
  onCreateXPost: (postData: XPostCreationData) => void;
}

const CreateXPostPage: React.FC<CreateXPostPageProps> = ({ onCreateXPost }) => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (description.trim() === '' || postUrl.trim() === '') {
      addToast('설명과 URL을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      new URL(postUrl);
    } catch (_) {
      addToast('유효한 URL을 입력해주세요.', 'error');
      return;
    }
    
    onCreateXPost({
      description: description.trim(),
      postUrl: postUrl.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-1">최신 소식 등록</h2>
        <p className="text-gray-500 mb-6">X(트위터)의 포스트 링크와 간단한 설명을 등록합니다.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="포스트에 대한 간단한 설명을 입력하세요." required />
          </div>

          <div>
            <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700 mb-1">X 포스트 URL</label>
            <Input id="postUrl" type="url" value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="https://x.com/username/status/12345" required />
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
            <Button type="submit">소식 등록하기</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateXPostPage;
