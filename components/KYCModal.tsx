import React, { useState } from 'react';

const KYCModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    frontImage: null as File | null,
    backImage: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [`${side}Image`]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement KYC submission to your backend
    console.log('KYC Data:', formData);
    alert('KYC verification submitted successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">KYC Verification</h2>
            <button onClick={onClose} className="text-light-200 hover:text-light-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-primary text-dark-300' : 'bg-dark-200 text-light-200'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-dark-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-dark-200 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  className="w-full bg-dark-200 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter your ID/Passport number"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.idNumber}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Upload Front of ID */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Front of ID</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {formData.frontImage ? (
                    <div>
                      <p className="text-primary mb-2">{formData.frontImage.name}</p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, frontImage: null }))}
                        className="text-sm text-light-200 hover:text-light-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-2 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-light-200">Click to upload front of ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-dark-200 text-light-100 py-2 rounded-lg hover:bg-dark-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.frontImage}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Back of ID */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Back of ID</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {formData.backImage ? (
                    <div>
                      <p className="text-primary mb-2">{formData.backImage.name}</p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, backImage: null }))}
                        className="text-sm text-light-200 hover:text-light-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-2 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-light-200">Click to upload back of ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-dark-200 text-light-100 py-2 rounded-lg hover:bg-dark-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.backImage}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default KYCModal;