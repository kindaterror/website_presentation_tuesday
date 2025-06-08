import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar, BarChart3, ChevronRight, ChevronLeft, ArrowUpRight, TrendingUp, GraduationCap, Target, Star} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs";

export default function StudentProgress() {
  const [activeTab, setActiveTab] = useState("overview");

  // Format subject display
  const formatSubject = (subject: string) => {
    if (!subject) return null;
    const subjectMap = {
      'filipino-literature': '📚 Filipino Literature',
      'philippine-folklore': '🏛️ Philippine Folklore',
      'reading-comprehension': '📖 Reading Comprehension',
      'creative-writing': '✍️ Creative Writing',
      'general-education': '🎓 General Education'
    };
    return subjectMap[subject as keyof typeof subjectMap] || subject;
  };

  // Fetch user progress
  const { data: progressData, isLoading } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const response = await fetch("/api/progress", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      
      return response.json();
    }
  });

  // Helper function to remove duplicates and keep latest progress per book
  const getUniqueProgress = (progressArray: any[]) => {
    if (!progressArray) return [];
    
    return progressArray.reduce((unique: any[], progress: any) => {
      const existingIndex = unique.findIndex(p => p.bookId === progress.bookId);
      if (existingIndex === -1) {
        // Book not in array yet, add it
        unique.push(progress);
      } else {
        // Book already exists, keep the one with more recent lastReadAt
        if (new Date(progress.lastReadAt) > new Date(unique[existingIndex].lastReadAt)) {
          unique[existingIndex] = progress;
        }
      }
      return unique;
    }, []);
  };

  // Format reading time to handle seconds and display H:MM:SS format
  const formatReadingTime = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds === 0) return "0:00:00";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate overview stats
  const getStats = () => {
    if (!progressData?.progress) {
      return {
        booksCompleted: 0,
        booksInProgress: 0,
        totalReadingTime: 0,
        completionRate: 0
      };
    }

    // Use unique progress data for stats calculation
    const uniqueProgress = getUniqueProgress(progressData.progress);
    
    const completed = uniqueProgress.filter((p: any) => p.percentComplete === 100).length;
    const inProgress = uniqueProgress.filter((p: any) => p.percentComplete > 0 && p.percentComplete < 100).length;
    
    // Keep totalReadingTime in seconds for proper formatting
    const totalSeconds = uniqueProgress.reduce((sum: number, p: any) => sum + (p.totalReadingTime || 0), 0);
    
    // Calculate completion rate as percentage of started books that are completed
    const totalStarted = completed + inProgress;
    const completionRate = totalStarted > 0 ? Math.round((completed / totalStarted) * 100) : 0;

    return {
      booksCompleted: completed,
      booksInProgress: inProgress,
      totalReadingTime: totalSeconds,
      completionRate
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-navy-50 to-ilaw-white">
      <Header variant="student" />
      
      <main className="flex-grow p-4 md:p-6">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-ilaw-navy to-brand-navy-800 rounded-2xl p-8 mb-8 text-ilaw-white shadow-navy">
            <div className="flex items-center mb-4">
              <Target className="h-10 w-10 text-ilaw-gold mr-4" />
              <div>
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-gold-200">
                  Learning Progress
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">My Reading Journey</h1>
                <p className="text-xl text-brand-gold-100 leading-relaxed">
                  Track your learning achievements and celebrate your progress on the path to knowledge.
                </p>
                <div className="mt-6 flex items-center text-ilaw-gold">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-medium italic">Liwanag, Kaalaman, Paglilingkod</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <Link href="/student">
                  <Button variant="outline" className="border-2 border-ilaw-gold text-ilaw-gold hover:bg-ilaw-gold hover:text-ilaw-navy font-heading font-bold px-6 py-3">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-brand-gold-100 border-2 border-brand-gold-200">
              <TabsTrigger 
                value="overview" 
                className="font-heading font-bold text-ilaw-navy data-[state=active]:bg-ilaw-gold data-[state=active]:text-ilaw-navy"
              >
                📊 Overview
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="font-heading font-bold text-ilaw-navy data-[state=active]:bg-ilaw-gold data-[state=active]:text-ilaw-navy"
              >
                📚 Reading History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-gradient-to-br from-ilaw-white to-brand-gold-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-semibold">Books Completed</p>
                        <h3 className="text-3xl font-heading font-bold mt-1 text-ilaw-navy">{stats.booksCompleted}</h3>
                      </div>
                      <div className="bg-gradient-to-br from-amber-200 to-yellow-200 h-12 w-12 rounded-full flex items-center justify-center shadow-md">
                        <BookOpen className="h-6 w-6 text-ilaw-navy" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-yellow-600">
                      <span className="text-green-600 flex items-center inline-flex font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stats.booksInProgress} books in progress
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-gradient-to-br from-ilaw-white to-brand-gold-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-semibold">Reading Time</p>
                        <h3 className="text-3xl font-heading font-bold mt-1 text-ilaw-navy">{formatReadingTime(stats.totalReadingTime)}</h3>
                      </div>
                      <div className="bg-gradient-to-br from-ilaw-gold to-brand-amber h-12 w-12 rounded-full flex items-center justify-center shadow-md">
                        <Clock className="h-6 w-6 text-ilaw-navy" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-yellow-600">
                      <span className="text-green-600 flex items-center inline-flex font-medium">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Keep up the great work!
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-gradient-to-br from-ilaw-white to-brand-gold-50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-semibold">Completion Rate</p>
                        <h3 className="text-3xl font-heading font-bold mt-1 text-ilaw-navy">{stats.completionRate}%</h3>
                      </div>
                      <div className="bg-gradient-to-br from-green-200 to-emerald-200 h-12 w-12 rounded-full flex items-center justify-center shadow-md">
                        <BarChart3 className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-yellow-600">
                      <span className="text-green-600 flex items-center inline-flex font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Steadily improving
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Reading Progress Chart */}
              <div className="mb-8 border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-ilaw-white rounded-2xl">
                <div className="bg-gradient-to-r from-ilaw-navy to-brand-navy-800 p-6 rounded-t-xl">
                  <h3 className="text-xl font-heading font-bold text-ilaw-gold flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3" />
                    📈 Reading Activity
                  </h3>
                </div>
                <div className="p-8">
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-amber-200 to-yellow-200 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="h-12 w-12 text-ilaw-navy" />
                      </div>
                      <h4 className="text-2xl font-heading font-bold text-ilaw-navy mb-4">Your Reading Journey Awaits!</h4>
                      <p className="text-yellow-600 font-medium mb-2">Your reading activity chart will appear here</p>
                      <p className="text-sm text-yellow-600">Track your reading time and books completed over time</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current Progress */}
              <div className="border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-ilaw-white rounded-2xl">
                <div className="bg-gradient-to-r from-ilaw-navy to-brand-navy-800 p-6 rounded-t-xl">
                  <h3 className="text-xl font-heading font-bold text-ilaw-gold flex items-center">
                    <GraduationCap className="h-6 w-6 mr-3" />
                    📖 Current Reading Progress
                  </h3>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">
                        <div className="bg-gradient-to-br from-amber-200 to-yellow-200 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-8 w-8 text-ilaw-navy" />
                        </div>
                        <p className="text-yellow-600 font-medium">Loading your progress...</p>
                      </div>
                    </div>
                  ) : (() => {
                    // Remove duplicates for current progress
                    const uniqueProgress = getUniqueProgress(progressData?.progress || []);
                    const inProgressBooks = uniqueProgress.filter((p: any) => p.percentComplete < 100);
                    
                    return inProgressBooks.length > 0 ? (
                      <div className="space-y-6">
                        {inProgressBooks
                          .sort((a: any, b: any) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
                          .slice(0, 3)
                          .map((progress: any) => (
                            <div key={progress.bookId} className="flex items-start p-6 bg-gradient-to-r from-brand-gold-50 to-ilaw-white rounded-xl border-2 border-brand-gold-200 hover:border-ilaw-gold hover:shadow-md transition-all duration-300">
                              <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-lg flex items-center justify-center mr-4 shadow-md">
                                {progress.book.coverImage ? (
                                  <img 
                                    src={progress.book.coverImage} 
                                    alt={progress.book.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <BookOpen className="h-6 w-6 text-ilaw-navy" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-heading font-bold text-ilaw-navy text-lg mb-2">{progress.book.title}</h4>
                                
                                {/* Subject and type badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge 
                                    variant="outline"
                                    className={`border-2 font-bold text-xs ${
                                      progress.book.type === 'storybook' 
                                        ? 'border-brand-gold-300 bg-brand-gold-100 text-yellow-600' 
                                        : 'border-ilaw-navy-300 bg-ilaw-navy-100 text-ilaw-navy'
                                    }`}
                                  >
                                    {progress.book.type === 'storybook' ? '📚 Storybook' : '🎓 Educational'}
                                  </Badge>
                                  {progress.book.subject && (
                                    <Badge 
                                      variant="outline"
                                      className="border-2 border-amber-300 bg-amber-50 text-yellow-600 font-bold text-xs"
                                    >
                                      {formatSubject(progress.book.subject)}
                                    </Badge>
                                  )}
                                  {progress.book.grade && (
                                    <Badge 
                                      variant="outline"
                                      className="border-2 border-brand-gold-300 text-yellow-600 font-bold text-xs"
                                    >
                                      Grade {progress.book.grade === 'K' ? 'K' : progress.book.grade}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-yellow-600 font-medium mb-3">
                                  {progress.currentChapter || "Chapter 1"} • Last read: {new Date(progress.lastReadAt).toLocaleDateString()}
                                </p>
                                <div className="mb-4">
                                  <div className="flex justify-between text-xs text-yellow-600 mb-2 font-medium">
                                    <span>Progress</span>
                                    <span>{progress.percentComplete}%</span>
                                  </div>
                                  <Progress value={progress.percentComplete} className="h-3" />
                                </div>
                                <div>
                                  <Link href={
                                    progress.book.type === 'educational' 
                                      ? `/student/educational-books/${progress.book.id}`
                                      : `/student/storybooks/${progress.book.id}`
                                  }>
                                    <Button 
                                      variant="link" 
                                      className="p-0 h-auto text-ilaw-navy hover:text-ilaw-gold font-heading font-bold flex items-center transition-colors duration-200"
                                    >
                                      Continue Reading <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-amber-200 to-yellow-200 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <BookOpen className="h-12 w-12 text-ilaw-navy" />
                        </div>
                        <h4 className="text-2xl font-heading font-bold text-ilaw-navy mb-4">Ready to Start Your Learning Journey?</h4>
                        <p className="text-yellow-600 font-medium mb-2">No books in progress yet</p>
                        <p className="text-sm text-yellow-600">Choose a book from our collection to begin tracking your progress</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="border-2 border-brand-gold-200 hover:border-ilaw-gold transition-all duration-300 shadow-lg bg-ilaw-white rounded-2xl">
                <div className="bg-gradient-to-r from-ilaw-navy to-brand-navy-800 p-6 rounded-t-xl">
                  <h3 className="text-xl font-heading font-bold text-ilaw-gold flex items-center">
                    <BookOpen className="h-6 w-6 mr-3" />
                    📚 Reading History
                  </h3>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">
                        <div className="bg-gradient-to-br from-amber-200 to-yellow-200 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-8 w-8 text-ilaw-navy" />
                        </div>
                        <p className="text-yellow-600 font-medium">Loading your history...</p>
                      </div>
                    </div>
                  ) : (() => {
                    // Remove duplicates for reading history
                    const uniqueProgress = getUniqueProgress(progressData?.progress || []);
                    
                    return uniqueProgress.length > 0 ? (
                      <Table>
                       <TableHeader>
                          <TableRow className="border-brand-gold-200">
                            <TableHead className="text-ilaw-navy font-heading font-bold">📖 Book</TableHead>
                            <TableHead className="text-ilaw-navy font-heading font-bold">📋 Details</TableHead>
                            <TableHead className="text-ilaw-navy font-heading font-bold">📊 Progress</TableHead>
                            <TableHead className="text-ilaw-navy font-heading font-bold text-center w-28 whitespace-nowrap">⏱️ Reading Time</TableHead>
                            <TableHead className="text-ilaw-navy font-heading font-bold">📅 Last Read</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uniqueProgress
                            .sort((a: any, b: any) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
                            .map((progress: any) => (
                              <TableRow key={progress.bookId} className="border-brand-gold-100 hover:bg-brand-gold-50 transition-colors duration-200">
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="w-12 h-16 bg-gradient-to-br from-amber-200 to-yellow-200 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                      {progress.book.coverImage ? (
                                        <img 
                                          src={progress.book.coverImage} 
                                          alt={progress.book.title}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <BookOpen className="h-5 w-5 text-ilaw-navy" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-heading font-bold text-ilaw-navy">{progress.book.title}</div>
                                      <div className="text-xs text-yellow-600 font-medium">{progress.currentChapter || "Chapter 1"}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge 
                                      variant="outline"
                                      className={`border font-bold text-xs ${
                                        progress.book.type === 'storybook' 
                                          ? 'border-brand-gold-300 bg-brand-gold-100 text-yellow-600' 
                                          : 'border-ilaw-navy-300 bg-ilaw-navy-100 text-ilaw-navy'
                                      }`}
                                    >
                                      {progress.book.type === 'storybook' ? '📚 Story' : '🎓 Educational'}
                                    </Badge>
                                    {progress.book.subject && (
                                      <Badge 
                                        variant="outline"
                                        className="border border-amber-300 bg-amber-50 text-yellow-600 font-bold text-xs"
                                      >
                                        {formatSubject(progress.book.subject)?.split(' ')[0]} {/* Just emoji + first word */}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="w-full max-w-[100px]">
                                    <div className="text-xs text-yellow-600 mb-1 flex justify-between font-medium">
                                      <span>{progress.percentComplete}%</span>
                                      {progress.percentComplete === 100 && (
                                        <span className="text-green-600 font-bold">✓ Done</span>
                                      )}
                                    </div>
                                    <Progress value={progress.percentComplete} className="h-2" />
                                  </div>
                                </TableCell>
                                <TableCell className="text-yellow-600 font-medium text-center w-24">
                                  {formatReadingTime(progress.totalReadingTime || 0)}
                                </TableCell>
                                <TableCell className="text-yellow-600 font-medium">
                                  {new Date(progress.lastReadAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {progress.percentComplete === 100 ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700 font-heading font-bold"
                                      disabled
                                    >
                                      ✓ Completed
                                    </Button>
                                  ) : (
                                    <Link href={
                                      progress.book.type === 'educational' 
                                        ? `/student/educational-books/${progress.book.id}`
                                        : `/student/storybooks/${progress.book.id}`
                                    }>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-ilaw-navy hover:text-ilaw-gold hover:bg-brand-gold-50 font-heading font-bold transition-colors duration-200"
                                      >
                                        Continue →
                                      </Button>
                                    </Link>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-br from-amber-200 to-yellow-200 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <BookOpen className="h-12 w-12 text-ilaw-navy" />
                        </div>
                        <h4 className="text-2xl font-heading font-bold text-ilaw-navy mb-4">Your Reading Adventure Begins Here!</h4>
                        <p className="text-yellow-600 font-medium mb-2">No reading history found yet</p>
                        <p className="text-sm text-yellow-600">Start reading to build your learning journey</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}