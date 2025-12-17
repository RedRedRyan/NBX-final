"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';

const CompanySetupPage = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    sector: '',
    description: '',
    marketCap: '',
    price: '0',
  });

  const [files, setFiles] = useState<{
    certificateOfIncorporation?: File;
    cr12?: File;
    memArts?: File;
    otherDocs?: File[];
  }>({});

  // Redirect if not a company user
  React.useEffect(() => {
    if (user && user.role !== 'company') {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      if (key === 'otherDocs') {
        setFiles(prev => ({
          ...prev,
          otherDocs: [...(prev.otherDocs || []), ...Array.from(e.target.files || [])],
        }));
      } else {
        setFiles(prev => ({
          ...prev,
          [key]: e.target.files![0],
        }));
      }
    }
  };

  const removeFile = (key: string, index?: number) => {
    if (key === 'otherDocs' && index !== undefined) {
      setFiles(prev => ({
        ...prev,
        otherDocs: prev.otherDocs?.filter((_, i) => i !== index),
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);

      // Construct FormData for multipart upload (files + data)
      const payload = new FormData();

      // Required fields
      payload.append('name', formData.name);
      payload.append('ticker', formData.ticker.toUpperCase());
      // Maintain same backend schema: symbol = ticker
      payload.append('symbol', formData.ticker.toUpperCase());
      payload.append('sector', formData.sector);
      payload.append('description', formData.description);
      payload.append('marketCap', formData.marketCap);
      payload.append('price', formData.price || '0');

      // Default or placeholder values for removed fields (adjust as needed)
      payload.append('totalSupply', '0');
      payload.append('circulatingSupply', '0');
      payload.append('useremail', user?.useremail || '');

      // Append files
      if (files.certificateOfIncorporation) {
        payload.append('certificateOfIncorporation', files.certificateOfIncorporation);
      }
      if (files.cr12) {
        payload.append('cr12', files.cr12);
      }
      if (files.memArts) {
        payload.append('memArts', files.memArts);
      }
      if (files.otherDocs) {
        files.otherDocs.forEach((file) => {
          payload.append('otherDocs', file);
        });
      }

      // Note: You may need to update ApiClient.createCompany to support FormData
      const response = await ApiClient.createCompany(payload, token);

      setSuccess('Company profile created successfully!');

      setTimeout(() => {
        router.push(`/company/dashboard/${response._id || response.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create company profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Company Setup</h1>
            <p className="mt-2 text-light-100">Register your SME on NBX with official incorporation documents</p>
          </div>

          {error && (
            <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/10 text-green-500 p-4 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-100">
                  Company Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="ticker" className="block text-sm font-medium text-light-100">
                  Ticker Symbol *
                </label>
                <input
                  id="ticker"
                  name="ticker"
                  type="text"
                  value={formData.ticker}
                  onChange={handleChange}
                  maxLength={6}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  placeholder="e.g., TECH"
                  required
                />
                <p className="mt-1 text-xs text-light-200">This will also be used as your token symbol</p>
              </div>

              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-light-100">
                  Sector *
                </label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a sector</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Energy">Energy</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="marketCap" className="block text-sm font-medium text-light-100">
                  Estimated Market Cap *
                </label>
                <input
                  id="marketCap"
                  name="marketCap"
                  type="text"
                  value={formData.marketCap}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., KES 50M or $500K"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-light-100">
                  Company Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Briefly describe your business, products/services, and market..."
                  required
                />
              </div>
            </div>

            {/* Document Uploads Section - Kenya Companies Act Compliance */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Incorporation Documents (Required)</h2>
              <p className="text-sm text-light-200 mb-6">
                Upload clear scanned copies or PDFs of the following official documents.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-light-100">
                    Certificate of Incorporation *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'certificateOfIncorporation')}
                    className="mt-1 block w-full text-sm text-light-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                    required
                  />
                  {files.certificateOfIncorporation && (
                    <p className="mt-2 text-sm text-green-400">
                      ✓ {files.certificateOfIncorporation.name}
                      <button type="button" onClick={() => removeFile('certificateOfIncorporation')} className="ml-2 text-red-400">Remove</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-100">
                    CR12 (Official Search Report) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'cr12')}
                    className="mt-1 block w-full text-sm text-light-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                    required
                  />
                  {files.cr12 && (
                    <p className="mt-2 text-sm text-green-400">
                      ✓ {files.cr12.name}
                      <button type="button" onClick={() => removeFile('cr12')} className="ml-2 text-red-400">Remove</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-100">
                    Memorandum & Articles of Association *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'memArts')}
                    className="mt-1 block w-full text-sm text-light-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                    required
                  />
                  {files.memArts && (
                    <p className="mt-2 text-sm text-green-400">
                      ✓ {files.memArts.name}
                      <button type="button" onClick={() => removeFile('memArts')} className="ml-2 text-red-400">Remove</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-100">
                    Additional Documents (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'otherDocs')}
                    className="mt-1 block w-full text-sm text-light-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {files.otherDocs && files.otherDocs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.otherDocs.map((file, i) => (
                        <p key={i} className="text-sm text-green-400">
                          ✓ {file.name}
                          <button type="button" onClick={() => removeFile('otherDocs', i)} className="ml-2 text-red-400">Remove</button>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Creating Profile...' : 'Submit Company Profile'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-4 bg-dark-100 text-white border border-border rounded-md hover:bg-dark-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySetupPage;