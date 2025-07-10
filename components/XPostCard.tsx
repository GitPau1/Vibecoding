import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { XPost } from '../types';
import { Card } from './ui/Card';
import { XSocialIcon } from './icons/XSocialIcon';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (tweetId: string, element: HTMLElement, options: object) => Promise<any>;
      };
    };
  }
}

interface XPostCardProps {
  post: XPost;
}

const XPostCard: React.FC<XPostCardProps> = ({ post }) => {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const embedContainer = embedContainerRef.current;
    if (!embedContainer) return;

    let isMounted = true;
    embedContainer.innerHTML = '<div class="text-center py-6"><p class="text-sm text-gray-400">Loading Tweet...</p></div>';


    const renderTweet = () => {
      if (window.twttr && window.twttr.widgets) {
        embedContainer.innerHTML = ''; // Clear previous content
        
        const tweetIdMatch = post.postUrl.match(/\/status\/(\d+)/);
        const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

        if (tweetId) {
          window.twttr.widgets.createTweet(
            tweetId,
            embedContainer,
            { theme: 'light', dnt: true, conversation: 'none' }
          ).then(el => {
            if (isMounted && !el) {
              // Tweet failed to load (e.g., deleted, protected)
              embedContainer.innerHTML = `<a href="${post.postUrl}" target="_blank" rel="noopener noreferrer" class="block text-sm text-center text-red-500 py-6">트윗을 불러올 수 없습니다. X에서 확인하기.</a>`;
            }
          });
        } else {
          embedContainer.innerHTML = `<p class="text-sm text-red-500 py-6 text-center">유효하지 않은 X 포스트 URL입니다.</p>`;
        }
      }
    };

    // Twitter's script is loaded asynchronously. We poll for it to be ready.
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
  }, [post.postUrl]);

  const handleCardClick = () => {
    navigate(`/x-post/${post.id}`);
  };

  const handleEmbedClick = (e: React.MouseEvent) => {
    // Prevent navigating away when clicking on links within the tweet
    e.stopPropagation();
  };

  return (
    <Card 
        className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden p-0 cursor-pointer"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
    >
        <div className="px-6 pt-6 pb-2">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center">
                  <XSocialIcon className="w-3 h-3 mr-1.5" />
                  최신 소식
                </span>
                <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-base text-gray-700 mt-3">{post.description}</p>
        </div>
        
        <div 
            ref={embedContainerRef} 
            className="tweet-embed-container mt-2 px-6 pb-4"
            onClick={handleEmbedClick}
        >
            <div className="text-center py-6">
                <p className="text-sm text-gray-400">Loading Tweet...</p>
            </div>
        </div>
    </Card>
  );
};

export default XPostCard;
