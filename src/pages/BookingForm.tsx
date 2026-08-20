import React, { useState, useEffect } from 'react';
import { Step1Personal } from '../components/forms/Step1Personal';
import { Step2Project } from '../components/forms/Step2Project';
import { Step3Confirmation } from '../components/forms/Step3Confirmation';
import { PhotographyService } from '../types';
import { subscribeToActiveServices } from '../firebase/firestore';
import { triggerOnNewBooking } from '../services/cloudFunctions';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import vividelLogo from '../assets/vividel-logo.png';

export const BookingForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<PhotographyService[]>([]);
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

    return () => {
      unsubServices();
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
      <div className="min-h-screen bg-surface-2 text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-surface-1/90 border border-primary/40 rounded-2xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md relative z-10 animate-fade-in">
          <div className="w-16 h-16 bg-primary/15 border border-primary rounded-full flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-serif text-on-surface">
              Request Received
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Your booking request for <strong className="text-primary">{formData.service}</strong> has been successfully submitted to James Akabo Jnr at Vividel Inc.
            </p>
          </div>

          <div className="bg-surface-2 p-4 rounded-xl border border-outline text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Client:</span>
              <span className="font-medium text-on-surface">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Shoot Date:</span>
              <span className="font-medium text-on-surface">{formData.shootDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Location:</span>
              <span className="font-medium text-on-surface">{formData.location}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline">
              <span className="text-on-surface-variant">Status:</span>
              <span className="font-semibold text-primary">Pending Contract</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant bg-surface-2/50 p-3 rounded-lg border border-outline">
            You will receive a contract via email shortly. Once signed, deposit payment details will be provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2 text-on-surface flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between py-4 border-b border-outline relative z-10">
        <div>
          <img src={vividelLogo} alt="Vividel Inc." className="h-8 w-auto" />
          <p className="mt-1 text-[10px] text-primary uppercase tracking-widest font-semibold">
            Commercial & Event Photography
          </p>
        </div>
      </header>

      {/* Form Container */}
      <main className="max-w-2xl w-full mx-auto my-8 bg-surface-1/80 border border-outline rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative z-10">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : step > s
                    ? 'bg-emerald-600/40 text-emerald-700 border border-emerald-600'
                    : 'bg-surface-2 text-on-surface-variant/50 border border-outline'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s ? 'text-on-surface' : 'text-on-surface-variant/50'
                }`}
              >
                {s === 1 ? 'Personal' : s === 2 ? 'Project' : 'Confirm'}
              </span>
              {s < 3 && <div className="w-8 sm:w-16 h-[1px] bg-outline mx-2" />}
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline">
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
      <footer className="max-w-3xl w-full mx-auto text-center py-4 text-xs text-on-surface-variant/60 relative z-10">
        © {new Date().getFullYear()} Vividel Inc. Studio Operations. All Rights Reserved.
      </footer>
    </div>
  );
};
