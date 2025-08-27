'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DOMPurify from 'dompurify';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/application/get`, {
          application_id: [params.id]
        });

        if (response.data?.code === 200 && response.data.applications?.length > 0) {
          setJob(response.data.applications[0]);
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchJobDetails();
    }
  }, [params?.id]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleShare = async (platform) => {
    if (!job) return;

    try {
      const jobUrl = `${window.location.origin}/jobs/${params.id}`;
      const title = job.seoTitle || 'Job Opening';
      const hashtags = 'maritimejobs,shipping,careers';

      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(title)}&hashtags=${hashtags}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${jobUrl}`)}`,
      };

      if (platform === 'copy') {
        await navigator.clipboard.writeText(jobUrl);
        showNotification('Link copied to clipboard!', 'success');
      } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      }
    } catch (err) {
      console.error('Share error:', err);
      showNotification('Failed to share the job. Please try again.', 'error');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'Job Not Found'}</h2>
          <Button onClick={() => router.push('/company/job')}>
            <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/company/job')}
              className="mb-4"
            >
              <LucideIcons.ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{job.uniqueCode || 'Job Code Not Available'}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={job.status === 'active' ? 'success' : 'secondary'}>
                {job.status || 'status unknown'}
              </Badge>
              <div className="flex items-center text-gray-500 text-sm">
                <LucideIcons.Eye className="h-4 w-4 mr-1" />
                {job.viewed_count || 0} views
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <LucideIcons.Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  <LucideIcons.Facebook className="h-4 w-4 mr-2" /> Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  <LucideIcons.Twitter className="h-4 w-4 mr-2" /> Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                  <LucideIcons.Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                  <LucideIcons.MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  <LucideIcons.Copy className="h-4 w-4 mr-2" /> Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => router.push(`/company/job/${params.id}/edit`)}
            >
              Edit Job
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.jobDescription || 'No description available') }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ships & Ranks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Ships:</h3>
                    <div className="flex flex-wrap gap-2">
                      {(job.ships || []).map((ship) => (
                        <Badge key={ship} variant="outline">
                          <LucideIcons.Ship className="h-3 w-3 mr-1" />
                          {ship}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Ranks:</h3>
                    <div className="flex flex-wrap gap-2">
                      {(job.ranks || []).map((rank) => (
                        <Badge key={rank} variant="outline">
                          <LucideIcons.Users className="h-3 w-3 mr-1" />
                          {rank}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <LucideIcons.CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Duration</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(job.startDate)} - {formatDate(job.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {job.currency	}
                  <div>
                    <h3 className="text-sm font-medium">Wages</h3>
                    <p className="text-sm text-gray-500">
                      {job.wages || 'Not specified'}  {job.wagesType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <LucideIcons.CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Posted Date</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(job.created_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Title</h3>
                  <p className="text-sm text-gray-500">{job.seoTitle || 'No title'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-gray-500">{job.seoDescription || 'No description'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Keywords</h3>
                  <div className="flex flex-wrap gap-1">
                    {(job.seoKeywords || '').split(',').filter(Boolean).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}