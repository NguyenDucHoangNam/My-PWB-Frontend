// Utility function for smooth scrolling with browser scrollbar
export const smoothScrollToElement = (elementId: string, offset: number = 100) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    console.log(`Scrolling to ${elementId}:`, {
      elementPosition,
      offsetPosition,
      currentScrollY: window.pageYOffset,
      targetScrollY: offsetPosition
    });
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    console.warn(`Element with id "${elementId}" not found`);
  }
};

// Alternative method using scrollIntoView with proper options
export const smoothScrollToElementAlternative = (elementId: string, offset: number = 100) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
    
    // Adjust for header offset after scroll
    setTimeout(() => {
      window.scrollBy(0, -offset);
    }, 100);
  }
};
