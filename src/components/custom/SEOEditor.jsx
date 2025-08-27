import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const SEOEditor = ({ formData, onSEOChange }) => {
  const [isAutoGenerate, setIsAutoGenerate] = useState(true);
  const [seoData, setSeoData] = useState({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    slug: '',
    uniqueCode: ''
  });

  const generateSEOData = (formData) => {
    // Previous SEO generation logic
    const ships = formData.ships.map(s => s.value.trim());
    const ranks = formData.ranks.map(r => r.value.trim());
    
    const slugShips = ships.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const slugRanks = ranks.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const titleShips = ships.join(', ');
    const titleRanks = ranks.join(', ');
    
    const timestamp = Date.now();
    const jobLocation = 'India';
    
    const baseDescription = `Latest ${titleShips} job openings for ${titleRanks} positions in ${jobLocation}. ` +
      `Apply now for maritime careers on ${ships.length > 1 ? 'vessels including' : 'vessel type'} ${titleShips}.`;
    
    const keywords = [
      ...ships.map(ship => `${ship} jobs in ${jobLocation}`),
      ...ranks.map(rank => `${rank} jobs in ${jobLocation}`),
      ...ships.map(ship => `${ship} ${ranks[0]} vacancy`),
      ...ranks.map(rank => `Maritime ${rank} positions`),
      'Shipping jobs',
      'Maritime careers',
      `Seafarer jobs in ${jobLocation}`,
    ].join(', ');

    return {
      slug: `${timestamp}-${slugShips}-jobs-for-${slugRanks}-in-india`,
      uniqueCode: `JOB-${timestamp}`,
      seoTitle: `${titleShips} Jobs for ${titleRanks} in ${jobLocation} | Maritime Careers`,
      seoDescription: baseDescription.slice(0, 160),
      seoKeywords: keywords
    };
  };

  useEffect(() => {
    if (isAutoGenerate && formData.ships.length > 0 && formData.ranks.length > 0) {
      const newSEOData = generateSEOData(formData);
      setSeoData(newSEOData);
      onSEOChange(newSEOData);
    }
  }, [formData, isAutoGenerate]);

  const handleManualChange = (field, value) => {
    setIsAutoGenerate(false);
    const newSEOData = { ...seoData, [field]: value };
    setSeoData(newSEOData);
    onSEOChange(newSEOData);
  };

  const handleRegenerateClick = () => {
    setIsAutoGenerate(true);
    const newSEOData = generateSEOData(formData);
    setSeoData(newSEOData);
    onSEOChange(newSEOData);
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">SEO Settings</h3>
            <Button 
              onClick={handleRegenerateClick}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Auto Generate SEO
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">SEO Title</label>
              <Input
                value={seoData.seoTitle}
                onChange={(e) => handleManualChange('seoTitle', e.target.value)}
                className="w-full"
                placeholder="Enter SEO title"
              />
              <p className="text-xs text-gray-500 mt-1">
                {seoData.seoTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">SEO Description</label>
              <Textarea
                value={seoData.seoDescription}
                onChange={(e) => handleManualChange('seoDescription', e.target.value)}
                className="w-full"
                placeholder="Enter SEO description"
              />
              <p className="text-xs text-gray-500 mt-1">
                {seoData.seoDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">SEO Keywords</label>
              <Textarea
                value={seoData.seoKeywords}
                onChange={(e) => handleManualChange('seoKeywords', e.target.value)}
                className="w-full"
                placeholder="Enter comma-separated keywords"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">URL Slug</label>
              <Input
                value={seoData.slug}
                onChange={(e) => handleManualChange('slug', e.target.value)}
                className="w-full"
                placeholder="Enter URL slug"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOEditor;