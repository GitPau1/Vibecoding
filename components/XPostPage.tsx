

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XPost } from '../types';
import { Card } from './ui/Card';
import { CalendarIcon } from './icons/CalendarIcon';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from './icons/UserIcon';
import { Button } from './ui/Button';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (tweetId: string, element: HTMLElement, options: object) => Promise<any>;
      };
    };
  }
}

interface XPostPageProps {
  xPosts: XPost[];
  onDelete: (postId: string) => void;
}

const XPostPage: React.FC<XPostPageProps> = ({ xPosts, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();

  const post = xPosts.find(p => p.id === id);
  const isAuthor = session?.user.id === post?.author?.id;

  useEffect(() => {
    if (!post && xPosts.length > 0) {
      navigate('/', { replace: true });
    }
  }, [post, xPosts, navigate]);

  useEffect(() => {
    const embedContainer = embedContainerRef.current;
    if (!embedContainer || !post) return;

    let isMounted = true;
    embedContainer.innerHTML = '<div class="text-center py-6"><p class="text-sm text-gray-400">Loading Tweet...</p></div>';

    const renderTweet = () => {
      if (window.twttr && window.twttr.widgets) {
        embedContainer.innerHTML = ''; // Clear previous

        const tweetIdMatch = post.postUrl.match(/\/status\/(\d+)/);
        const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

        if (tweetId) {
          window.twttr.widgets.createTweet(
            tweetId,
            embedContainer,
            { theme: 'light', dnt: true }
          ).then(el => {
            if (isMounted && !el) {
              embedContainer.innerHTML = `<a href="${post.postUrl}" target="_blank" rel="noopener noreferrer" class="block text-sm text-center text-red-500 py-6">트윗을 불러올 수 없습니다. X에서 확인하기.</a>`;
            }
          });
        } else {
          embedContainer.innerHTML = `<p class="text-sm text-red-500 py-6 text-center">유효하지 않은 X 포스트 URL입니다.</p>`;
        }
      }
    };

    if (window.twttr && window.twttr.widgets) {
      renderTweet();
    } else {
      const interval = setInterval(() => {
        if (window.twttr && window.twttr.widgets) {
          clearInterval(interval);
          renderTweet();
        }
      }, 100);
    }
    
    return () => { isMounted = false; };
  }, [post]);

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-6 md:p-8">
          <span className="text-sm font-semibold text-gray-700">최신 소식</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">{post.description}</h2>
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1.5"/>
                <span>{post.author?.nickname || '익명'}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5"/>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div ref={embedContainerRef} className="p-0 sm:p-2 md:p-4 border-t border-gray-100 flex justify-center">
             <div className="text-center py-6">
                <p className="text-sm text-gray-400">Loading Tweet...</p>
            </div>
        </div>

        {isAuthor && (
            <div className="bg-gray-50 px-6 py-6 md:px-8 border-t border-gray-200 flex justify-center items-center gap-4">
                <Button onClick={() => navigate(`/edit/x-post/${post.id}`)} variant="outline" size="lg" className="min-w-[140px]">수정하기</Button>
                <Button onClick={() => onDelete(post.id)} variant="primary" size="lg" className="min-w-[140px] bg-red-600 hover:bg-red-700 focus:ring-red-500">삭제하기</Button>
            </div>
        )}
      </Card>
    </div>
  );
};

export default XPostPage;