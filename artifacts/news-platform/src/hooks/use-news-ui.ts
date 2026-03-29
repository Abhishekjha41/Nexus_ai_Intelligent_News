import { create } from 'zustand';
import { NewsArticle } from '@workspace/api-client-react';

interface NewsUIState {
  selectedArticle: NewsArticle | null;
  isOverlayOpen: boolean;
  openOverlay: (article: NewsArticle) => void;
  closeOverlay: () => void;
}

// Very simple custom store for UI state since Zustand isn't in requirements, we'll use a simple React Context 
// Wait, I can just use Zustand since I can add it, but actually React Context is safer without changing requirements.yaml
// Let's implement it with a standard React Context to be safe.
