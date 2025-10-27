import React from 'react';

export const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, callback?: () => void) => {
  e.preventDefault();
  const href = e.currentTarget.getAttribute('href');
  if (href && href.startsWith('#')) {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      if (callback) {
        callback();
      }
    }
  }
};
