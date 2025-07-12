

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { XPost, XPostUpdateData } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface EditXPostPageProps {
  xPosts: XPost[];
  onUpdateXPost: (id: string, postData: XPostUpdateData) => void;
}

const EditXPostPage: React.FC<EditXPostPageProps> = ({ xPosts, onUpdateXPost }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { session } = useAuth();

  const [description, setDescription] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const postToEdit = xPosts.find(p => p.id === id);
    if (postToEdit) {
      if (postToEdit.author?.id !== session?.user.id) {
        addToast('수정 권한이 없습니다.', 'error');
        navigate(`/x-post/${id}`, { replace: true });
        return;
      }
      setDescription(postToEdit.description);
      setPostUrl(postToEdit.postUrl);
      setIsLoaded(true);
    } else if (xPosts.length > 0) {
      addToast('존재하지 않는 소식입니다.', 'error');
      navigate('/', { replace: true });
    }
  }, [id, xPosts, session, navigate, addToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || description.trim() === '' || postUrl.trim() === '') {
      addToast('설명과 URL을 모두 입력해주세요.', 'error');
      return;
    }
    try {
      new URL(postUrl);
    } catch (_) {
      addToast('유효한 URL을 입력해주세요.', 'error');
      return;
    }
    
    onUpdateXPost(id, {
      description: description.trim(),
      postUrl: postUrl.trim(),
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-1">최신 소식 수정</h2>
        <p className="text-gray-500 mb-6">X(트위터) 포스트 링크와 설명을 수정합니다.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <Input as="textarea" id="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div>
            <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700 mb-1">X 포스트 URL</label>
            <Input id="postUrl" type="url" value={postUrl} onChange={e => setPostUrl(e.target.value)} required />
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
            <Button type="submit">수정 완료</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditXPostPage;