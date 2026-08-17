import React, { useState, useEffect } from 'react';
import { Step1Personal } from '../components/forms/Step1Personal';
import { Step2Project } from '../components/forms/Step2Project';
import { Step3Confirmation } from '../components/forms/Step3Confirmation';
import { PhotographyService } from '../types';
import { subscribeToActiveServices, subscribeToSettings } from '../firebase/firestore';
import { triggerOnNewBooking } from '../services/cloudFunctions';
import { Button } from '../components/ui/Button';
import { Camera, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import vividelLogo from '../assets/vividel-logo.png';

export const BookingForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<PhotographyService[]>([]);
  const [calComUrl, setCalComUrl] = useState<string>('https://cal.com/vividel');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: '',
    shootDate: '',
    backupDate: '',
    location: '',
    specialRequirements: '',
    termsAgreed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load active services real-time
    const unsubServices = subscribeToActiveServices((sList) => {
      setServices(sList);
      if (sList.length > 0 && !formData.service) {
        setFormData((prev) => ({ ...prev, service: sList[0].name }));
      }
    });

    // Load settings for Cal.com link
    const unsubSettings = subscribeToSettings((st) => {
      if (st.calComLink) setCalComUrl(st.calComLink);
    });

    return () => {
      unsubServices();
      unsubSettings();
    };
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Valid email address is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.service) errs.service = 'Please select a service';
    if (!formData.shootDate) errs.shootDate = 'Preferred shoot date is required';
    if (!formData.location.trim()) errs.location = 'Location or venue is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.termsAgreed) {
      setErrors({ termsAgreed: 'You must confirm terms before submitting' });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedService = services.find((s) => s.name === formData.service);
      const startingPrice = selectedService ? selectedService.startingPrice : 1000;
      const depositAmount = Math.round(startingPrice * 0.5);

      // POST /api/onNewBooking creates the lead + booking + client records and
      // sends the James/client notification emails and SMS server-side.
      await triggerOnNewBooking({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        shootDate: formData.shootDate,
        backupDate: formData.backupDate,
        location: formData.location,
        specialRequirements: formData.specialRequirements,
        totalPrice: startingPrice,
        depositAmount
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting booking form:', err);
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0A0D10] text-[#F2F4F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#059669]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#171D23]/90 border border-[#2DD4BF]/40 rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md relative z-10 animate-fade-in">
          <div className="w-16 h-16 bg-[#2DD4BF]/15 border border-[#2DD4BF] rounded-full flex items-center justify-center mx-auto text-[#2DD4BF]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-serif text-[#F2F4F5]">
              Request Received
            </h1>
            <p className="text-sm text-[#8B96A0] mt-2 leading-relaxed">
              Your booking request for <strong className="text-[#2DD4BF]">{formData.service}</strong> has been successfully submitted to James Akabo Jnr at Vividel Inc.
            </p>
          </div>

          <div className="bg-[#0A0D10] p-4 rounded-xl border border-[#262D34] text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#8B96A0]">Client:</span>
              <span className="font-medium text-[#F2F4F5]">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B96A0]">Shoot Date:</span>
              <span className="font-medium text-[#F2F4F5]">{formData.shootDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B96A0]">Location:</span>
              <span className="font-medium text-[#F2F4F5]">{formData.location}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#262D34]">
              <span className="text-[#8B96A0]">Status:</span>
              <span className="font-semibold text-[#2DD4BF]">Pending Contract</span>
            </div>
          </div>

          <p className="text-xs text-[#8B96A0] bg-[#0A0D10]/50 p-3 rounded-lg border border-[#262D34]">
            You will receive a contract via email shortly. Once signed, deposit payment details will be provided.
          </p>

          <div className="pt-2">
            <a
              href={calComUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#2DD4BF] hover:underline"
            >
              Need to reschedule your discovery call? Visit Cal.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D10] text-[#F2F4F5] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#2DD4BF]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-4 border-b border-[#262D34] relative z-10">
        <div>
          <img src={vividelLogo} alt="Vividel Inc." className="h-8 w-auto" />
          <p className="mt-1 text-[10px] text-[#2DD4BF] uppercase tracking-widest font-semibold">
            Commercial & Event Photography
          </p>
        </div>

        <a
          href={calComUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#2DD4BF] bg-[#2DD4BF]/10 px-3 py-1.5 rounded-lg border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/20 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" /> Discovery Call (Cal.com)
        </a>
      </header>

      {/* Form Container */}
      <main className="max-w-2xl w-full mx-auto my-8 bg-[#171D23]/80 border border-[#262D34] rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative z-10">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#262D34]">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-[#2DD4BF] text-[#0A0D10] ring-4 ring-[#2DD4BF]/20'
                    : step > s
                    ? 'bg-[#059669]/40 text-[#34D399] border border-[#059669]'
                    : 'bg-[#0A0D10] text-[#8B96A0]/50 border border-[#262D34]'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s ? 'text-[#F2F4F5]' : 'text-[#8B96A0]/50'
                }`}
              >
                {s === 1 ? 'Personal' : s === 2 ? 'Project' : 'Confirm'}
              </span>
              {s < 3 && <div className="w-8 sm:w-16 h-[1px] bg-[#262D34] mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Views */}
        {step === 1 && (
          <Step1Personal data={formData} onChange={handleChange} errors={errors} />
        )}
        {step === 2 && (
          <Step2Project
            data={formData}
            services={services}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {step === 3 && (
          <Step3Confirmation
            data={formData}
            services={services}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        )}

        {/* Action Controls */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#262D34]">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to {step === 1 ? 'Project Details' : 'Confirmation'}
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center py-4 text-xs text-[#8B96A0]/60 relative z-10">
        © {new Date().getFullYear()} Vividel Inc. Studio Operations. All Rights Reserved.
      </footer>
    </div>
  );
};
