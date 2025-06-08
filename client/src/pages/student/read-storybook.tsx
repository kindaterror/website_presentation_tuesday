import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Menu,  BookOpen,  AlertCircle,  ArrowLeft,  Lightbulb, Heart, Sparkles} from 'lucide-react';
import { BookReader } from '@/components/ui/book-reader';
import { Skeleton } from '@/components/ui/skeleton';

// Fallback image if needed
import fallbackIllustration from '@/assets/books/book2.svg';

export default function ReadStorybook() {
  // Get book ID from URL
  const params = useParams<{id: string}>();
  const bookId = params?.id;

  // Fetch book details
  const { data: bookData, isLoading: bookLoading, error: bookError } = useQuery<{book: any}>({
    queryKey: [`/api/books/${bookId}`],
    enabled: !!bookId
  });

  // Fetch book pages
  const { data: pagesData, isLoading: pagesLoading, error: pagesError } = useQuery<{pages: any[]}>({
    queryKey: [`/api/books/${bookId}/pages`],
    enabled: !!bookId
  });

  const isLoading = bookLoading || pagesLoading;
  const error = bookError || pagesError;
  
  // Combine the book and pages data
  const book = bookData?.book;
  const pages = pagesData?.pages || [];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-navy-50 to-ilaw-white">
        <header className="bg-ilaw-white shadow-lg border-b-2 border-brand-gold-200">
          <div className="container mx-auto py-4 px-6 flex justify-between items-center">
            <div className="flex items-center">
              <Logo className="h-16 w-auto" variant="student" />
            </div>
            <div className="text-center flex-grow">
              <Skeleton className="h-8 w-64 mx-auto bg-brand-gold-200" />
            </div>
            <div className="flex items-center text-ilaw-gold">
              <Lightbulb className="h-6 w-6 mr-2" />
              <span className="font-heading font-semibold">Reading Portal</span>
            </div>
          </div>
        </header>
        
        <main className="flex-grow p-4 md:p-8">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-ilaw-white rounded-2xl shadow-lg border-2 border-brand-gold-200 p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center text-ilaw-gold mb-4">
                  <BookOpen className="h-8 w-8 mr-3 animate-pulse" />
                  <span className="text-xl font-heading font-semibold">Loading your magical story...</span>
                </div>
                
                <Skeleton className="h-12 w-48 bg-brand-gold-200" />
                
                <div className="relative bg-gradient-to-br from-ilaw-navy to-brand-navy-800 w-full max-w-4xl rounded-2xl p-8 mb-4 h-[600px] shadow-navy">
                  <Skeleton className="h-full w-full rounded-xl bg-brand-gold-200/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-ilaw-white">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 animate-spin text-ilaw-gold" />
                      <p className="text-lg font-medium">Preparing your reading adventure...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handle error state
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-navy-50 to-ilaw-white">
        <header className="bg-ilaw-white shadow-lg border-b-2 border-brand-gold-200">
          <div className="container mx-auto py-4 px-6 flex justify-between items-center">
            <div className="flex items-center">
              <Logo className="h-16 w-auto" variant="student" />
            </div>
            <div className="text-center flex-grow">
              <h1 className="text-2xl font-heading font-bold text-ilaw-navy">Oops! Story Not Found</h1>
            </div>
            <div className="flex items-center text-ilaw-gold">
              <Lightbulb className="h-6 w-6 mr-2" />
              <span className="font-heading font-semibold">Reading Portal</span>
            </div>
          </div>
        </header>
        
        <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-ilaw-white p-10 rounded-2xl shadow-lg border-2 border-brand-gold-200 text-center">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 text-brand-gold-400 mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold text-ilaw-navy mb-4">Story Adventure Paused</h2>
                <p className="text-lg text-brand-gold-600 mb-6 leading-relaxed">
                  Don't worry, young reader! This story seems to be hiding. Let's go back and find another amazing adventure waiting for you!
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-ilaw-gold hover:bg-brand-amber text-ilaw-navy font-semibold px-8 py-3 text-lg shadow-ilaw"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Story Collection
                </Button>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                  <p className="text-purple-700 font-medium italic">
                    "Every great reader was once a beginner. Keep exploring!" ✨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Handle no pages state
  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-navy-50 to-ilaw-white">
        <header className="bg-ilaw-white shadow-lg border-b-2 border-brand-gold-200">
          <div className="container mx-auto py-4 px-6 flex justify-between items-center">
            <div className="flex items-center">
              <Logo className="h-16 w-auto" variant="student" />
            </div>
            <div className="text-center flex-grow">
              <h1 className="text-2xl font-heading font-bold text-ilaw-navy">{book.title}</h1>
            </div>
            <div className="flex items-center text-ilaw-gold">
              <Lightbulb className="h-6 w-6 mr-2" />
              <span className="font-heading font-semibold">Reading Portal</span>
            </div>
          </div>
        </header>
        
        <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-ilaw-white p-10 rounded-2xl shadow-lg border-2 border-brand-gold-200 text-center">
              <div className="mb-6">
                <BookOpen className="h-16 w-16 text-brand-gold-400 mx-auto mb-4" />
                <h2 className="text-3xl font-heading font-bold text-ilaw-navy mb-4">Story Coming Soon!</h2>
                <p className="text-lg text-brand-gold-600 mb-6 leading-relaxed">
                  This wonderful story is still being prepared for you! Our storytellers are working hard to bring you an amazing reading experience.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-ilaw-gold hover:bg-brand-amber text-ilaw-navy font-semibold px-8 py-3 text-lg shadow-ilaw"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Explore Other Stories
                </Button>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-ilaw-gold to-brand-amber rounded-xl">
                  <p className="text-ilaw-navy font-medium italic">
                    "Great stories are worth the wait! Check back soon!" 📚✨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-navy-50 to-ilaw-white">
      {/* Header */}
      <header className="bg-ilaw-white shadow-lg border-b-2 border-brand-gold-200">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Logo className="h-16 w-auto" variant="student" />
          </div>
          <div className="text-center flex-grow">
            <h1 className="text-2xl font-heading font-bold text-ilaw-navy">{book.title}</h1>
            <p className="text-sm text-brand-gold-600 font-medium">Now Reading</p>
          </div>
          <div className="flex items-center text-ilaw-gold">
            <Heart className="h-6 w-6 mr-2" />
            <span className="font-heading font-semibold">Reading Portal</span>
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="container mx-auto max-w-5xl">
          <BookReader 
            title={book.title}
            pages={pages}
            returnPath="/student/storybooks"
            musicUrl={book.musicUrl}
            bookId={book.id}
          />
        </div>
      </main>
    </div>
  );
}