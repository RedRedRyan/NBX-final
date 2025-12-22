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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      if (key === 'otherDocs') {
        setFiles((prev) => ({
          ...prev,
          otherDocs: [...(prev.otherDocs || []), ...Array.from(e.target.files || [])],
        }));
      } else {
        setFiles((prev) => ({
          ...prev,
          [key]: e.target.files![0],
        }));
      }
    }
  };

  const removeFile = (key: string, index?: number) => {
    if (key === 'otherDocs' && index !== undefined) {
      setFiles((prev) => ({
        ...prev,
        otherDocs: prev.otherDocs?.filter((_, i) => i !== index),
      }));
    } else {
      setFiles((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token || !user) {
      setError('Not authenticated');
      return;
    }

    // Validate required files
    if (!files.certificateOfIncorporation || !files.cr12 || !files.memArts) {
      setError('All required incorporation documents must be uploaded');
      return;
    }

    try {
      setIsLoading(true);

      // Construct FormData for multipart upload
      const payload = new FormData();

      // Add text fields
      payload.append('name', formData.name);
      payload.append('ticker', formData.ticker.toUpperCase());
      payload.append('sector', formData.sector);
      payload.append('description', formData.description);
      payload.append('marketCap', formData.marketCap);
      payload.append('price', formData.price || '0');
      payload.append('useremail', user.useremail); // Use authenticated user's email

      // Add required files
      payload.append('certificateOfIncorporation', files.certificateOfIncorporation);
      payload.append('cr12', files.cr12);
      payload.append('memArts', files.memArts);

      // Add optional files
      if (files.otherDocs && files.otherDocs.length > 0) {
        files.otherDocs.forEach((file) => {
          payload.append('otherDocs', file);
        });
      }

      // Submit to API
      const response: any = await ApiClient.createCompany(payload, token);

      setSuccess('Company profile created successfully!');

      // Store company ID and redirect
      const companyId = response.data?._id || response._id;
      
      setTimeout(() => {
        if (companyId) {
          router.push(`/company/dashboard/${companyId}`);
        } else {
          router.push('/company/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Company creation error:', err);
      setError(err.message || 'Failed to create company profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Company Setup</h1>
            <p className="mt-2 text-light-100">
              Register your SME on NBX with official incorporation documents
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/10 text-green-500 p-4 rounded-md border border-green-500/20">
              <p className="font-medium">Success!</p>
              <p className="text-sm mt-1">{success}</p>
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
                <p className="mt-1 text-xs text-light-200">
                  This will also be used as your token symbol
                </p>
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

            {/* Document Uploads Section */}
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Incorporation Documents (Required)
              </h2>
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
                    <p className="mt-2 text-sm text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {files.certificateOfIncorporation.name}
                      <button
                        type="button"
                        onClick={() => removeFile('certificateOfIncorporation')}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
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
                    <p className="mt-2 text-sm text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {files.cr12.name}
                      <button
                        type="button"
                        onClick={() => removeFile('cr12')}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
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
                    <p className="mt-2 text-sm text-green-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {files.memArts.name}
                      <button
                        type="button"
                        onClick={() => removeFile('memArts')}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-100">
                    Additional Documents (Optional)
                  </label>
                  <p className="text-xs text-light-200 mb-2">
                    Business license, tax certificates, audited financials, etc.
                  </p>
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
                        <p key={i} className="text-sm text-green-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {file.name}
                          <button
                            type="button"
                            onClick={() => removeFile('otherDocs', i)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
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
                className="flex-1 py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Profile...
                  </span>
                ) : (
                  'Submit Company Profile'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-dark-100 text-white border border-border rounded-md hover:bg-dark-200 font-medium transition-colors disabled:opacity-50"
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