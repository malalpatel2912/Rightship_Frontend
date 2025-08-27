'use client'
import ImageCarousel from '@/components/common/carousal/company';
import ImageCarousel2 from '@/components/common/carousal/companybg';
import ListCompany from '@/components/common/carousal/listCompany';
import HeroSection2 from '@/components/common/heroic';
import React, { useEffect, useState } from 'react'

export default function page() {
  const [companies, setCompanies] = useState({
    top: [],
    standard: [],
    list: []
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/company/promo/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            limit: 100,
            is_active: true // Only fetch active companies
          }),
        });
        
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
  
        const grouped = data.companies.reduce((acc, company) => {
          if (company.is_active) { // Double check active status
            company.tags.forEach(tag => {
              if (!acc[tag]) acc[tag] = [];
              acc[tag].push({
                name: company.name,
                image: company.image_url,
                link: company.website_url
              });
            });
          }
          return acc;
        }, { top: [], standard: [], list: [] });
  
        setCompanies(grouped);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
  
    fetchCompanies();
  }, []);

  return (
    <div className="bg-gray-50">
      <HeroSection2 />
      
      <div className="container mx-auto py-6">
        <ImageCarousel
          images={companies.top}
          title="Top Companies"
          itemsPerSlide={6}
          autoPlayInterval={3000}
        />
      </div>

      <section className="bg-[#EFF7FF]">
        <div className="container mx-auto py-6">
          <ImageCarousel2
            images={companies.standard}
            title="Standard Companies"
            itemsPerSlide={12}
            autoPlayInterval={3000}
          />
        </div>
      </section>

      <div className="container mx-auto py-6">
        <ListCompany
          images={companies.list}
          title="List Companies"
          itemsPerSlide={12}
          autoPlayInterval={3000}
        />
      </div>
    </div>
  );
}
