
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { ArticleCreationData } from '../App';

interface CreateArticlePageProps {
  onCreateArticle: (articleData: ArticleCreationData) => void;
}

const CreateArticlePage: React.FC<CreateArticlePageProps> = ({ onCreateArticle }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const { addToast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    h2: false,
    h3: false,
    p: true,
  });

  const updateToolbar = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current?.contains(selection.anchorNode)) {
      return;
    }

    const isBold = document.queryCommandState('bold');
    
    let node = selection.anchorNode;
    let isH2 = false, isH3 = false, isP = false;

    while (node && node !== editorRef.current) {
      const nodeName = node.nodeName.toUpperCase();
      if (nodeName === 'H2') isH2 = true;
      if (nodeName === 'H3') isH3 = true;
      if (nodeName === 'P') isP = true;
      node = node.parentNode;
    }
    
    // Default to P if no other block element is found
    if (!isH2 && !isH3 && !isP) isP = true;


    setActiveFormats({ bold: isBold, h2: isH2, h3: isH3, p: isP && !isH2 && !isH3 });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateToolbar();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateToolbar]);

  const formatDoc = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // After executing a command, immediately update the toolbar
    updateToolbar();
  };
  
  const handleBodyChange = (e: React.FormEvent<HTMLDivElement>) => {
    setBody(e.currentTarget.innerHTML);
    updateToolbar();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plainTextBody = body.replace(/<[^>]*>?/gm, '').trim();

    if (title.trim() === '' || plainTextBody === '') {
      addToast('제목과 본문을 모두 입력해주세요.', 'error');
      return;
    }
    onCreateArticle({
      title: title.trim(),
      body: body,
      imageUrl: imageUrl?.trim() || undefined,
    });
  };

  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">새로운 아티클 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="아티클의 제목을 입력하세요" required />
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
            data-placeholder="아티클 내용을 입력하세요..."
            // By removing dangerouslySetInnerHTML, we prevent React from re-rendering
            // the content on every input, which was causing the cursor to jump.
            // The browser now manages the content, and React just reads it via onInput.
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
              <img src={imageUrl} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md border" />
              <button
                type="button"
                onClick={() => setImageUrl(undefined)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                이미지 링크 삭제
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
          <Button type="submit">아티클 게시하기</Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateArticlePage;
