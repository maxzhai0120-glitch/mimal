export default function LoadingScreen({ steps, currentStep }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-12 h-12 border-4 border-dota-gold border-t-transparent rounded-full animate-spin" />
      <div className="space-y-2 text-center">
        {steps.map((step, idx) => (
          <div
            key={step}
            className={`text-sm transition ${
              idx < currentStep ? 'text-green-400' : idx === currentStep ? 'text-dota-gold' : 'text-gray-600'
            }`}
          >
            {idx < currentStep ? '✓' : idx === currentStep ? '⟳' : '○'} {step}
          </div>
        ))}
      </div>
    </div>
  );
}
