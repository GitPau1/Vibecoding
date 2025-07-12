

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { Article, ArticleUpdateData } from '../types';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

interface EditArticlePageProps {
  articles: Article[];
  onUpdateArticle: (id: string, articleData: ArticleUpdateData) => void;
}

const EditArticlePage: React.FC<EditArticlePageProps> = ({ articles, onUpdateArticle }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { session } = useAuth();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, h2: false, h3: false, p: true });

  useEffect(() => {
    const articleToEdit = articles.find(a => a.id === id);
    if (articleToEdit) {
      // Authorization check
      if (articleToEdit.author?.id !== session?.user.id) {
        addToast('수정 권한이 없습니다.', 'error');
        navigate(`/article/${id}`, { replace: true });
        return;
      }
      setTitle(articleToEdit.title);
      setBody(articleToEdit.body);
      setImageUrl(articleToEdit.imageUrl);
      
      if(editorRef.current) {
        editorRef.current.innerHTML = articleToEdit.body;
      }
      setIsLoaded(true);

    } else if (articles.length > 0) {
      addToast('존재하지 않는 아티클입니다.', 'error');
      navigate('/', { replace: true });
    }
  }, [id, articles, session, navigate, addToast]);
  
  const updateToolbar = useCallback(() => {
    if (!isLoaded || !editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || !editorRef.current?.contains(selection.anchorNode)) {
      return;
    }

    const isBold = document.queryCommandState('bold');
    const blockFormat = document.queryCommandValue('formatBlock').toLowerCase();
    const isH2 = blockFormat === 'h2';
    const isH3 = blockFormat === 'h3';
    
    setActiveFormats({ bold: isBold, h2: isH2, h3: isH3, p: !isH2 && !isH3 });
  }, [isLoaded]);

  useEffect(() => {
    const handleSelectionChange = () => updateToolbar();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateToolbar]);

  const formatDoc = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbar();
  };
  
  const handleBodyChange = (e: React.FormEvent<HTMLDivElement>) => {
    setBody(e.currentTarget.innerHTML);
    updateToolbar();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plainTextBody = body.replace(/<[^>]*>?/gm, '').trim();

    if (!id || title.trim() === '' || plainTextBody === '') {
      addToast('제목과 본문을 모두 입력해주세요.', 'error');
      return;
    }
    onUpdateArticle(id, {
      title: title.trim(),
      body: body,
      imageUrl: imageUrl?.trim() || undefined,
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
        <h2 className="text-2xl font-bold mb-6">아티클 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="body-editor" className="block text-sm font-medium text-gray-700 mb-1">본문</label>
            <div className="wysiwyg-toolbar">
              <button type="button" onClick={() => formatDoc('bold')} className={activeFormats.bold ? 'active' : ''}><b>B</b></button>
              <button type="button" onClick={() => formatDoc('formatBlock', 'H2')} className={activeFormats.h2 ? 'active' : ''}>H2</button>
              <button type="button" onClick={() => formatDoc('formatBlock', 'H3')} className={activeFormats.h3 ? 'active' : ''}>H3</button>
              <button type="button" onClick={() => formatDoc('formatBlock', 'p')} className={activeFormats.p ? 'active' : ''}>P</button>
            </div>
            <div
              id="body-editor"
              ref={editorRef}
              className="wysiwyg-editor article-body"
              contentEditable="true"
              onInput={handleBodyChange}
              onFocus={updateToolbar}
              onClick={updateToolbar}
              onKeyUp={updateToolbar}
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">대표 이미지 URL (선택)</label>
            <Input
              id="imageUrl"
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
            />
            {imageUrl && (
              <div className="mt-4 text-center">
                <ImageWithFallback src={imageUrl} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md border" />
                <button type="button" onClick={() => setImageUrl(undefined)} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500">이미지 링크 삭제</button>
              </div>
            )}
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

export default EditArticlePage;