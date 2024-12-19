import { SignupForm } from "@/components/signup/SignupForm";
import { HowItWorks } from "@/components/signup/HowItWorks";

const Signup = () => {
  const handleGetStarted = () => {
    const signupForm = document.querySelector('.signup-form');
    signupForm?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="min-h-screen bg-[#FEF7CD] md:bg-none md:bg-cover md:bg-center md:bg-no-repeat"
      style={{ backgroundImage: 'url("/lovable-uploads/b02f1de1-fe5e-423b-a316-dfd6c7518396.png")' }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-shadow">
            Coordinate Your Trusted Babysitters, All in One Place
          </h1>
          <p className="text-xl text-gray-700 mb-8 text-shadow">
            Stop juggling multiple text threads. MySitterSquad helps you quickly find available time slots from your existing, trusted babysitters.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white/70 rounded-lg shadow-lg p-6 backdrop-blur-sm signup-form">
          <h1 className="text-3xl font-bold text-center mb-6">Join MySitterSquad</h1>
          <SignupForm />
        </div>
        <div className="mt-8">
          <HowItWorks onGetStarted={handleGetStarted} />
        </div>
      </div>
    </div>
  );
};

export default Signup;